/**
 * NSUserTrackingUsageDescription を Info.plist から取り除く。
 *
 * @layers/expo のプラグインがこのキーを無条件に書き込むが、本アプリは
 * ATT を出さない方針(src/lib/analytics.tsx / requestTracking={false})。
 * キーだけバイナリに残っていると、App Store Connect が「プライバシー回答
 * (トラッキングなし)と矛盾」として審査提出を弾くため、このプラグインで削除する。
 *
 * 置き場所は plugins 配列の【先頭】であること。Info.plist の mod は
 * 配列の逆順で実行される(後に登録したものが先に走る)ため、先頭に置いた
 * ものだけが Layers の書き込みより後に走って削除できる。末尾に置くと空振りする。
 *
 * 将来 ATT の同意を取る方針に変えるときは、このプラグインを外し、
 * ASC の「Appのプライバシー」でトラッキングを申告し直すこと。
 */
const { withInfoPlist } = require('expo/config-plugins');

module.exports = (config) =>
  withInfoPlist(config, (c) => {
    delete c.modResults.NSUserTrackingUsageDescription;
    return c;
  });
