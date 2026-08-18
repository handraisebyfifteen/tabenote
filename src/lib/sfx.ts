/**
 * 効果音の鳴らし口。組み合わせ画面の5つの音を持つ。
 *
 *   cursor   1タップ目・カーソル「キコ」        D#5 → B5
 *   select   2タップ目・決定「キコーン」        D#5 → C6
 *   confirm  3クリック目・決定ボタン「キコーン↑」 D#5 → E6
 *   remove   チップで食材を外す「キロ」         D5 → C#5
 *   ki       季節・五行ボタン「キ」            D#5 のみ
 *
 * 選ぶ3つの「キ」は D#5 で同じ。行き先だけ B5 → C6 → E6 と上がるので、
 * 押し進むほど音が上へ抜ける。外す音だけは半音低く立って半音下がる。
 *
 * 波形は scripts/gen-sfx.js が作る(assets/sfx/*.wav)。
 *
 * プレイヤーは音ごとにアプリで1つだけ持つ。画面ごとに作ると、
 *   ・組み合わせ画面と設定画面で二重に読み込むことになる
 *   ・画面に入るたび作り直しになり、最初のタップが鳴らないことがある
 * ため、初回に作って以後使い回す(合わせて 120KB の短い音なので抱えたままでよい)。
 *
 * 鳴らしかたの約束:
 *   マナーモード中でも鳴らす(playsInSilentMode: true)。
 *     端末の消音に従うと「設定で音を大きくしたのに鳴らない」が起きる。
 *     消したい人には設定画面の「効果音 → 消音」があるので、そちらを正とする。
 *   ほかのアプリの音楽は止めない(interruptionMode: 'mixWithOthers')。
 *     食べながら・音楽をかけながら開く画面なので、音を奪うほどの音ではない。
 *   連打されたら鳴らし直す(頭出ししてから play)。重ねずに鳴らし直すのは
 *     ファミコンの1チャンネルの流儀で、そのほうが連打の手応えが揃う。
 *     カーソルと決定は別のプレイヤーなので、互いは邪魔しない。
 *
 * 音が出ないこと自体は画面の用を損なわないので、失敗は投げずに warn だけ残す。
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SfxName = 'cursor' | 'select' | 'confirm' | 'remove' | 'ki';

const SOURCES: Record<SfxName, number> = {
  cursor: require('../../assets/sfx/cursor.wav'),
  select: require('../../assets/sfx/select.wav'),
  confirm: require('../../assets/sfx/confirm.wav'),
  remove: require('../../assets/sfx/remove.wav'),
  ki: require('../../assets/sfx/ki.wav'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};
let primed = false;

/**
 * プレイヤーを用意する。読み込みが要るので、鳴らす瞬間ではなく
 * アプリの起動時(SoundProvider)に呼んで、最初の1回から鳴るようにする。
 */
export function primeSfx(): void {
  if (primed) return;
  primed = true;
  for (const name of Object.keys(SOURCES) as SfxName[]) {
    try {
      // downloadFirst: 端末に落としてから鳴らす。開発中の音源は Metro の
      // http URL で、iOS の AVPlayer はこれを読み損ねることがある
      players[name] = createAudioPlayer(SOURCES[name], { downloadFirst: true });
    } catch (e) {
      // 端末が音を扱えない場合。以後この音は鳴らない
      console.warn(`[sfx] ${name} のプレイヤーを作れなかった`, e);
    }
  }
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  }).catch((e) => console.warn('[sfx] 音の設定に失敗', e));
}

/** 効果音を鳴らす。gain は 0〜1。0(消音)なら何もしない */
export function playSfx(name: SfxName, gain: number): void {
  if (gain <= 0) return;
  if (!primed) primeSfx();
  const player = players[name];
  if (player === undefined) return;
  try {
    // iOS の Safari だけは音量を変えられない(端末のボタン専用)。
    // その場合 expo-audio が警告を出すだけで、鳴ること自体は変わらない
    player.volume = gain;
    player.seekTo(0).catch((e) => console.warn(`[sfx] ${name} の頭出しに失敗`, e));
    player.play();
  } catch (e) {
    console.warn(`[sfx] ${name} の再生に失敗`, e);
  }
}
