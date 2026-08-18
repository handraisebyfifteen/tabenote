#!/usr/bin/env node
/**
 * 効果音(SFX)を波形から作る。
 *
 * 組み合わせ画面のキャラ選択の音を、ファミコンの矩形波の流儀で合成する。
 *
 *   cursor.wav   1タップ目・カーソル「キコ」      D#5 → B5
 *   select.wav   2タップ目・決定「キコーン」      D#5 → C6
 *   confirm.wav  3クリック目・決定ボタン「キコーン↑」D#5 → E6
 *   remove.wav   チップで食材を外す「キロ」       D5 → C#5
 *   ki.wav       季節・五行・分類チップ「キ」     D#5 のみ
 *   search.wav   検索欄フォーカス「カチッ」       A#4 → D#5
 *
 * 選ぶ3つは立ち上がりの「キ」を D#5 で揃え、行き先だけを B5 → C6 → E6 と
 * 上げていく。同じ楽器のまま、押し進むごとに音が上へ抜けていく並び。
 * 取り消しだけは半音低い D5 から C#5 へ下がり、向きの逆で「戻した」と言う。
 *
 * 音源を外から持ってくると権利の出所を追えなくなる(指示書 8-5)ので、
 * 素材は置かず、このスクリプトが唯一の出所になる。鳴りを変えたいときは
 * 下の VARIANTS・CURSOR_SFX・CONFIRM_SFX をいじって作り直す。
 *
 * 使い方:
 *   node ./scripts/gen-sfx.js                    採用中のものを assets/sfx/ へ
 *   node ./scripts/gen-sfx.js --variants <dir>   聴き比べ用に候補を全部 <dir> へ
 *
 * 出力は 16bit / 44.1kHz / モノラルの WAV。
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

/** 平均律。A4=440Hz からの半音差で周波数を出す */
function note(name) {
  const table = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const m = /^([A-G])(#?)(-?\d)$/.exec(name);
  if (m === null) throw new Error(`音名が読めない: ${name}`);
  const semitoneFromA4 =
    table[m[1]] + (m[2] === '#' ? 1 : 0) + (Number(m[3]) - 4) * 12 - table.A;
  return 440 * Math.pow(2, semitoneFromA4 / 12);
}

/**
 * 矩形波(パルス波)1サンプル。duty はファミコンの 0.125 / 0.25 / 0.5 に倣う。
 * duty が小さいほど細くて硬い音、0.5 でいちばん太い。
 */
function pulse(phase, duty) {
  return phase % 1 < duty ? 1 : -1;
}

/** 継ぎ目のプチッというノイズを消すための出入りのなまし(秒) */
const EDGE_FADE = 0.004;

/**
 * 決定音「キコーン」の候補。どれも骨格は同じで、
 *
 *   キ   … D#5 を一瞬だけ。細い duty で子音のように短く立てる
 *   コーン … C6 へ跳ね上がってから減衰する
 *
 * 跳ね上がりは D#5 → C6 の長6度。決めた瞬間に上へ抜ける感じを狙っている。
 * 違うのは「コーン」の作りかた(単音か、和音か、アルペジオか)。
 *
 * レイヤーの指定:
 *   note/octave/detune  音程(detune はセント)
 *   arp/arpRate         音を高速で切り替える(ファミコンの和音の出しかた)
 *   duty                矩形波の細さ
 *   start/dur/gain      鳴り始め・長さ・音量
 *   decay               減衰の速さ(0 で鳴りっぱなし)
 */
const VARIANTS = {
  /**
   * 採用中。「コーン」を C6 + G6 + C7 の同時発音で鳴らす。
   * 5度を足すと芯が太くなり、単音より「コーン」と響いて聞こえる。
   * さらに +8 セントずらした層を重ね、うなりで余韻が揺れる。
   */
  chord: {
    gain: 0.5,
    layers: [
      // 「キ」。後ろの重なりに音量で負けないよう単層のぶん強めに出す
      { note: 'D#5', duty: 0.125, start: 0, dur: 0.055, gain: 1.7, decay: 0 },
      { note: 'D#6', duty: 0.125, start: 0, dur: 0.055, gain: 0.7, decay: 0 },
      // 「コーン」の芯
      { note: 'C6', duty: 0.25, start: 0.055, dur: 0.44, gain: 1, decay: 6 },
      { note: 'C6', detune: 8, duty: 0.25, start: 0.055, dur: 0.44, gain: 0.5, decay: 6 },
      // 5度と1オクターブ上。上ほど速く減らして、頭だけきらめかせる
      { note: 'G6', duty: 0.25, start: 0.055, dur: 0.34, gain: 0.55, decay: 9 },
      { note: 'C7', duty: 0.125, start: 0.06, dur: 0.2, gain: 0.3, decay: 16 },
    ],
  },

  /**
   * ファミコン実機のやりかた。1チャンネルで C6→G6→C7 を 60Hz で切り替えて
   * 和音に聞かせる。同時発音よりざらついて、いちばん8bitらしい。
   */
  arp: {
    gain: 0.5,
    layers: [
      { note: 'D#5', duty: 0.125, start: 0, dur: 0.055, gain: 1.6, decay: 0 },
      {
        arp: ['C6', 'G6', 'C7'],
        arpRate: 60,
        duty: 0.25,
        start: 0.055,
        dur: 0.44,
        gain: 1.6,
        decay: 6,
      },
      { note: 'C6', detune: 8, duty: 0.5, start: 0.055, dur: 0.44, gain: 0.5, decay: 6 },
    ],
  },

  /**
   * 太いほう。C5 を下に敷いて重心を下げ、余韻を長めに引く。
   * 「キコーン」というより「キコーーン」。
   */
  fat: {
    gain: 0.5,
    layers: [
      { note: 'D#5', duty: 0.25, start: 0, dur: 0.06, gain: 1.7, decay: 0 },
      { note: 'C5', duty: 0.5, start: 0.06, dur: 0.6, gain: 0.7, decay: 4 },
      { note: 'C6', duty: 0.25, start: 0.06, dur: 0.6, gain: 1, decay: 4.5 },
      { note: 'C6', detune: 10, duty: 0.25, start: 0.06, dur: 0.6, gain: 0.6, decay: 4.5 },
      { note: 'G6', duty: 0.125, start: 0.06, dur: 0.3, gain: 0.4, decay: 10 },
    ],
  },
};

/** 採用中の候補(assets へ書き出すのはこれ) */
const SELECTED = 'chord';

/**
 * カーソル音「キコ」。1タップ目(カーソルが乗った合図)に鳴る。
 *
 * 決定音と同じ D#5 で立ち上げ、行き先だけ半音低い B5 にして、余韻を切る。
 * 決定音が D#→C まで上がりきるのに対し、カーソルは B で止まる。
 * 「まだ決まっていない」を音程で言うための半音差で、続けて2タップ目を鳴らすと
 * B → C と収まる。連打されるので、決定音より短く(0.13秒)小さく(gain 0.4)。
 */
const CURSOR_SFX = {
  gain: 0.4,
  layers: [
    // 「キ」: 決定音と同じ立ち上がり。同じ楽器から出ているように聞かせる
    { note: 'D#5', duty: 0.125, start: 0, dur: 0.045, gain: 1.6, decay: 0 },
    { note: 'D#6', duty: 0.125, start: 0, dur: 0.045, gain: 0.6, decay: 0 },
    // 「コ」: 伸ばさない。速く減衰させて言い切る
    // 「キ」と同じ高さに聞こえるまで上げる(重なりが1層少ないぶん強く出す)
    { note: 'B5', duty: 0.25, start: 0.045, dur: 0.085, gain: 1.8, decay: 12 },
    { note: 'B6', duty: 0.125, start: 0.045, dur: 0.05, gain: 0.35, decay: 20 },
  ],
};

/**
 * 道具ボタンの音「キ」。季節ボタン・五行の「?」ボタン・分類チップなど、
 * 表示を切り替えるだけのボタンで鳴る。
 *
 * 選ぶ音たちの立ち上がりと同じ D#5 を、行き先を付けずに言い切る。
 * 「コ」が続かないのは、まだどこへも進んでいないから。切り替えるだけの操作に
 * 音程の物語を持たせず、同じ楽器の気配だけを残す。
 */
const KI_SFX = {
  gain: 0.35,
  layers: [
    { note: 'D#5', duty: 0.125, start: 0, dur: 0.045, gain: 1.6, decay: 0 },
    { note: 'D#6', duty: 0.125, start: 0, dur: 0.045, gain: 0.6, decay: 0 },
  ],
};

/**
 * 検索欄の音「カチッ」。組み合わせ画面と手帳の検索欄にフォーカスが入るときに
 * 鳴る。B♭4 → D#5(表記の都合で A#4 と書く)。
 *
 * 下から4度上がってみんなの「キ」と同じ D#5 に着地する。留め金が
 * カチッとはまる向きの跳びで、「ここから探しはじめる」の合図。
 * どちらの音も伸ばさず言い切って、キーボードが出る邪魔をしない。
 */
const SEARCH_SFX = {
  gain: 0.3,
  layers: [
    // 「カ」: 下の A#4。硬く短く
    { note: 'A#4', duty: 0.25, start: 0, dur: 0.03, gain: 1.3, decay: 0 },
    { note: 'A#5', duty: 0.125, start: 0, dur: 0.03, gain: 0.5, decay: 0 },
    // 「チッ」: 4度上がって D#5 で言い切る。速い減衰で「ッ」を作る
    { note: 'D#5', duty: 0.125, start: 0.03, dur: 0.07, gain: 1.5, decay: 20 },
    { note: 'D#6', duty: 0.125, start: 0.03, dur: 0.045, gain: 0.5, decay: 28 },
  ],
};

/**
 * 取り消し音「キロ」。パーティ枠のチップをタップして食材を外すときに鳴る。
 *
 * 選ぶ側の3つが D#5 から上へ跳ぶ(B5 / C6 / E6)のに対し、これだけ下がる。
 * 立ち上がりも仲間の D#5 より半音低い D5 にして、そこから C#5 へ半音だけ
 * 引っ込む。上がる=進む、下がる=戻す、を音程の向きで言い分ける。
 *
 * 取り消しは静かな操作なので、いちばん小さく(gain 0.3)短く。
 * 「ロ」は duty 0.5 の太い波で丸く鳴らし、きらめきの層は重ねない。
 */
const REMOVE_SFX = {
  gain: 0.3,
  layers: [
    // 「キ」: 選ぶ音たちと同じ形の立ち上がり。高さだけ半音低い
    { note: 'D5', duty: 0.125, start: 0, dur: 0.045, gain: 1.6, decay: 0 },
    { note: 'D6', duty: 0.125, start: 0, dur: 0.045, gain: 0.6, decay: 0 },
    // 「ロ」: 半音下がって引っ込む。丸い波で速く減衰させ、余韻を残さない
    { note: 'C#5', duty: 0.5, start: 0.045, dur: 0.09, gain: 1.7, decay: 14 },
  ],
};

/**
 * 決定ボタンの音「キコーン↑」の候補。3クリック目(選び終えて助言へ進む)に鳴る。
 *
 * 骨格はどれも同じで、立ち上がりは他の2つと同じ D#5。行き先だけ、決定音の C6 より
 * さらに上の E6(D#5 の1オクターブと半音上)へ跳ばす。
 * B5 で止まる → C6 で収まる → E6 で上へ抜ける、の3段目。
 *
 * 最後の一押しなので、下に E5 を敷いて重心を作り、余韻も長め(0.55秒)に引く。
 * 押したら画面が変わるので、鳴り切らなくてよい。
 * 違うのは、E6 の上に何を重ねるか。
 *
 * ここでオクターブ上(E7)へ伸ばさないことにした理由が2つある。
 *
 *   折り返しの汚れ。この矩形波はアンチエイリアスをしていないので、高い音ほど
 *   ナイキストを超えた倍音が低い方へ折り返る。E7 を duty 0.125 で鳴らすと
 *   倍音でない成分が 11%(280/450/730/900Hz)出て、どれも E の和音の外。
 *   決定音の C7 でも同じことは起きるが、E7 のほうが濁りが多い。
 *
 *   帯域。2637Hz は耳の感度がいちばん高いあたりで、スマホの小さいスピーカーも
 *   この帯を持ち上げる。狙いは「上へ抜ける」で「刺さる」ではない。
 */
const CONFIRM_VARIANTS = {
  /**
   * 上へ伸ばす代わりに G#6(3度)を足して、E メジャーの三和音にする。
   * 決定音の C6+G6+C7 は3度のない骨組みの和音。3クリック目だけ3度が入るので、
   * 音を高くせずに「決まった」の明るさだけが増える。
   * ……のだが、味つけが増えるぶん昔のゲーム機らしさは薄れるので、採らなかった。
   */
  triad: {
    gain: 0.55,
    layers: [
      // 「キ」: 3つの音で共通の立ち上がり
      { note: 'D#5', duty: 0.125, start: 0, dur: 0.055, gain: 1.7, decay: 0 },
      { note: 'D#6', duty: 0.125, start: 0, dur: 0.055, gain: 0.7, decay: 0 },
      // 「コーン↑」の芯。うなりで余韻を揺らすのは決定音と同じ作り
      { note: 'E6', duty: 0.25, start: 0.055, dur: 0.55, gain: 1, decay: 5 },
      { note: 'E6', detune: 8, duty: 0.25, start: 0.055, dur: 0.55, gain: 0.5, decay: 5 },
      // 1オクターブ下。ここだけ下を足して、3段目をいちばん太くする
      { note: 'E5', duty: 0.5, start: 0.055, dur: 0.55, gain: 0.45, decay: 5 },
      // 3度と5度。上ほど速く減らして、頭だけきらめかせる
      { note: 'G#6', duty: 0.25, start: 0.055, dur: 0.3, gain: 0.42, decay: 11 },
      { note: 'B6', duty: 0.25, start: 0.055, dur: 0.36, gain: 0.5, decay: 9 },
    ],
  },

  /**
   * オクターブ上を残す案。E7 を duty 0.5 にすると倍音が奇数だけになり、
   * 折り返しの汚れが 11% → 5% まで減る。そのぶん薄く短くしてある。
   */
  octave: {
    gain: 0.55,
    layers: [
      { note: 'D#5', duty: 0.125, start: 0, dur: 0.055, gain: 1.7, decay: 0 },
      { note: 'D#6', duty: 0.125, start: 0, dur: 0.055, gain: 0.7, decay: 0 },
      { note: 'E6', duty: 0.25, start: 0.055, dur: 0.55, gain: 1, decay: 5 },
      { note: 'E6', detune: 8, duty: 0.25, start: 0.055, dur: 0.55, gain: 0.5, decay: 5 },
      { note: 'E5', duty: 0.5, start: 0.055, dur: 0.55, gain: 0.45, decay: 5 },
      { note: 'B6', duty: 0.25, start: 0.055, dur: 0.36, gain: 0.5, decay: 9 },
      { note: 'E7', duty: 0.5, start: 0.06, dur: 0.14, gain: 0.2, decay: 18 },
    ],
  },

  /**
   * 採用中。上物は5度の B6 まで、行き先は E6 のまま伸ばさない。
   * 重ねが少ないぶん折り返しの濁りがなく、矩形波の素の鳴りが残る。
   * 3段目を華やかにするより、昔のゲーム機の素っ気なさに寄せた。
   */
  plain: {
    gain: 0.55,
    layers: [
      { note: 'D#5', duty: 0.125, start: 0, dur: 0.055, gain: 1.7, decay: 0 },
      { note: 'D#6', duty: 0.125, start: 0, dur: 0.055, gain: 0.7, decay: 0 },
      { note: 'E6', duty: 0.25, start: 0.055, dur: 0.55, gain: 1, decay: 5 },
      { note: 'E6', detune: 8, duty: 0.25, start: 0.055, dur: 0.55, gain: 0.5, decay: 5 },
      { note: 'E5', duty: 0.5, start: 0.055, dur: 0.55, gain: 0.45, decay: 5 },
      { note: 'B6', duty: 0.25, start: 0.055, dur: 0.36, gain: 0.55, decay: 9 },
    ],
  },
};

/** 採用中の候補(assets へ書き出すのはこれ) */
const CONFIRM_SELECTED = 'plain';

/** 1レイヤーを合成してバッファへ足し込む */
function renderLayer(out, layer) {
  const tune = Math.pow(2, (layer.octave ?? 0) + (layer.detune ?? 0) / 1200);
  const steps = (layer.arp ?? [layer.note]).map((n) => note(n) * tune);
  const from = Math.round(layer.start * SAMPLE_RATE);
  const count = Math.round(layer.dur * SAMPLE_RATE);
  // 位相は足し込みで進める。アルペジオで音程が変わっても波が途切れない
  let phase = 0;
  for (let i = 0; i < count; i += 1) {
    const t = i / SAMPLE_RATE;
    const freq =
      steps.length === 1
        ? steps[0]
        : steps[Math.floor(t * layer.arpRate) % steps.length];
    // 減衰(decay=0 なら鳴りっぱなし)
    let env = layer.decay > 0 ? Math.exp(-layer.decay * t) : 1;
    // 両端をなます
    const edge = Math.min(t, layer.dur - t) / EDGE_FADE;
    if (edge < 1) env *= Math.max(0, edge);
    out[from + i] += pulse(phase, layer.duty) * env * layer.gain;
    phase += freq / SAMPLE_RATE;
  }
}

/** float(-1..1)の配列を 16bit PCM の WAV にする */
function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt チャンクの長さ
  header.writeUInt16LE(1, 20); // 1 = PCM
  header.writeUInt16LE(1, 22); // モノラル
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // バイト/秒
  header.writeUInt16LE(2, 32); // ブロックあたりのバイト数
  header.writeUInt16LE(16, 34); // ビット深度
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function build(sfx) {
  const end = Math.max(...sfx.layers.map((l) => l.start + l.dur));
  const samples = new Float64Array(Math.ceil(end * SAMPLE_RATE));
  for (const layer of sfx.layers) renderLayer(samples, layer);
  // 重ねた結果が 1 を超えると割れるので、いちばん高いところで正規化してから音量を掛ける
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  if (peak > 0) {
    for (let i = 0; i < samples.length; i += 1) samples[i] = (samples[i] / peak) * sfx.gain;
  }
  return { wav: toWav(samples), seconds: end };
}

function write(file, sfx) {
  const { wav, seconds } = build(sfx);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, wav);
  console.log(`${path.relative(process.cwd(), file)}  ${seconds.toFixed(3)}s  ${wav.length}B`);
}

const variantsIndex = process.argv.indexOf('--variants');
if (variantsIndex !== -1) {
  const dir = process.argv[variantsIndex + 1];
  if (dir === undefined) throw new Error('--variants には出力先ディレクトリが要る');
  for (const [name, sfx] of Object.entries(VARIANTS)) {
    write(path.join(dir, `select-${name}.wav`), sfx);
  }
  for (const [name, sfx] of Object.entries(CONFIRM_VARIANTS)) {
    write(path.join(dir, `confirm-${name}.wav`), sfx);
  }
  write(path.join(dir, 'cursor.wav'), CURSOR_SFX);
  write(path.join(dir, 'remove.wav'), REMOVE_SFX);
  write(path.join(dir, 'ki.wav'), KI_SFX);
  write(path.join(dir, 'search.wav'), SEARCH_SFX);
} else {
  const dir = path.join(__dirname, '..', 'assets', 'sfx');
  write(path.join(dir, 'select.wav'), VARIANTS[SELECTED]);
  write(path.join(dir, 'cursor.wav'), CURSOR_SFX);
  write(path.join(dir, 'confirm.wav'), CONFIRM_VARIANTS[CONFIRM_SELECTED]);
  write(path.join(dir, 'remove.wav'), REMOVE_SFX);
  write(path.join(dir, 'ki.wav'), KI_SFX);
  write(path.join(dir, 'search.wav'), SEARCH_SFX);
}
