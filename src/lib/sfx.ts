/**
 * 効果音の鳴らし口。いまのところ「決定」の音(キコーン)だけ。
 * 波形は scripts/gen-sfx.js が作る(assets/sfx/select.wav)。
 *
 * プレイヤーはアプリに1つだけ持つ。画面ごとに作ると、
 *   ・組み合わせ画面と設定画面で二重に読み込むことになる
 *   ・画面に入るたび作り直しになり、最初のタップが鳴らないことがある
 * ため、初回に1つ作って以後使い回す(44KB の短い音なので抱えたままでよい)。
 *
 * 鳴らしかたの約束:
 *   マナーモード中でも鳴らす(playsInSilentMode: true)。
 *     端末の消音に従うと「設定で音を大きくしたのに鳴らない」が起きる。
 *     消したい人には設定画面の「効果音 → 消音」があるので、そちらを正とする。
 *   ほかのアプリの音楽は止めない(interruptionMode: 'mixWithOthers')。
 *     食べながら・音楽をかけながら開く画面なので、音を奪うほどの音ではない。
 *   連打されたら鳴らし直す(頭出ししてから play)。重ねずに鳴らし直すのは
 *     ファミコンの1チャンネルの流儀で、そのほうが連打の手応えが揃う。
 *
 * 音が出ないこと自体は画面の用を損なわないので、失敗は投げずに warn だけ残す。
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SELECT_SOUND = require('../../assets/sfx/select.wav');

let player: AudioPlayer | null = null;

/**
 * プレイヤーを用意する。読み込みが要るので、鳴らす瞬間ではなく
 * アプリの起動時(SoundProvider)に呼んで、最初の1回から鳴るようにする。
 */
export function primeSfx(): void {
  if (player !== null) return;
  try {
    // downloadFirst: 端末に落としてから鳴らす。開発中の音源は Metro の
    // http URL で、iOS の AVPlayer はこれを読み損ねることがある
    player = createAudioPlayer(SELECT_SOUND, { downloadFirst: true });
  } catch (e) {
    // 端末が音を扱えない場合。以後 playSelectSfx は何もしない
    console.warn('[sfx] プレイヤーを作れなかった', e);
    return;
  }
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
  }).catch((e) => console.warn('[sfx] 音の設定に失敗', e));
}

/** 決定音を鳴らす。gain は 0〜1。0(消音)なら何もしない */
export function playSelectSfx(gain: number): void {
  if (gain <= 0) return;
  if (player === null) primeSfx();
  if (player === null) return;
  try {
    // iOS の Safari だけは音量を変えられない(端末のボタン専用)。
    // その場合 expo-audio が警告を出すだけで、鳴ること自体は変わらない
    player.volume = gain;
    player.seekTo(0).catch((e) => console.warn('[sfx] 頭出しに失敗', e));
    player.play();
  } catch (e) {
    console.warn('[sfx] 再生に失敗', e);
  }
}
