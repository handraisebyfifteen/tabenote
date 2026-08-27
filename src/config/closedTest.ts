/**
 * クローズドテスト配布ビルド(Google Play クローズドテストトラック限定)の印。
 *
 * tabenote はサブスク専用のため、素のビルドだと外注テスターがペイウォールで止まり、
 * Google が求める「テスター12人以上・14日間」の実使用実績が作れない。
 * そこでこのフラグが立つビルドに限り、購読判定だけを「購読中」に固定する。
 * 上書きは lib/BillingContext の1箇所だけ。RevenueCat に偽の購入は作らない。
 * 課金フロー自体の検証は、ライセンステスターが production ビルドで別途行う。
 *
 * 有効化するのは eas.json の closedtest プロファイルだけ(production は明示的に "0")。
 * EXPO_PUBLIC_* はビルド時にバンドルへ焼き込まれるので、実行時に切り替わる経路はない。
 * このビルドを本番トラックへ昇格させないこと。本番用は production で別途ビルドし直す。
 *
 * 判定は文字列 "1" との完全一致のみ。truthy 判定にすると "0" や "false" のような
 * 文字列でも有効になってしまうため使わない。
 */
export const IS_CLOSED_TEST = process.env.EXPO_PUBLIC_CLOSED_TEST === '1';

const IS_PRODUCTION_BUILD = !__DEV__;

// 混入の見張り。closedtest はリリースビルドなので、フラグが立っていれば毎起動これが出る
if (IS_CLOSED_TEST && IS_PRODUCTION_BUILD) {
  console.warn(
    '[closed-test] エンタイトルメント開放ビルドです。本番トラックへ昇格させないこと。'
  );
}
