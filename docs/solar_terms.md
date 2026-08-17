
二十四節気テキスト rev.1
作成日: 2026-08-13 用途: ホーム画面の表示テキスト 形式: 英訳 + 漢字
表記方針
節気名は Wikipedia 系の英訳を基準とする(ユネスコ登録に公式英訳はないため)
「Beginning of 〜」で四立を統一、「Minor / Major」で小大の対を統一
日付は年により1日前後する。太陽黄経から算出すること
段落1 = 暦としての事実 / 段落2 = 中医学の対応
同じ季節が続く間は、季節の中での位置づけで書き分ける
五季との対応(土用方式)
長夏は年4回、各18日間。 立春・立夏・立秋・立冬の直前18日間が土用にあたる。 四季から各18日ずつを土(長夏)が取る形になり、結果としてほぼ5等分になる。

五季
2026年の期間
日数
五臓
推奨される味
春
2/4〜4/16
72
肝
酸・辛・甘
長夏(春土用)
4/17〜5/4
18
脾
甘・苦
夏
5/5〜7/19
76
心
苦・酸・甘
長夏(夏土用)
7/20〜8/6
18
脾
甘・苦
秋
8/7〜10/19
74
肺
辛・甘
長夏(秋土用)
10/20〜11/6
18
脾
甘・苦
冬
11/7〜1/15
70
腎
辛・鹹
長夏(冬土用)
1/16〜2/3
18
脾
甘・苦

土用の合計は72日。 四季それぞれ約72日と、ほぼ均等になる。
なぜこの方式を採るか
節気は四季の体系(立春・立夏・立秋・立冬で4等分)であり、長夏の居場所が構造上ない。 一方、五行は5等分を要求する。この矛盾を解く方法として、古典では

土用方式 — 各季の最後18日を土とする。年4回。五行として最も整合的
夏後半方式 — 夏を割って後半を長夏とする。連続するが長夏だけ短い
梅雨方式 — 日本では梅雨を長夏と見る。節気とは無関係

の3つがある。本アプリは土用方式を採る。理由は、

節気の体系の中に定義されている(立春等の直前18日)ので、日付から一意に判定できる
五行としてほぼ5等分になり、体系が整う
日本には土用の食文化が豊富にある(土用の丑の日、土用蜆、土用餅、丑湯など)
「季節の変わり目に脾を養う」という中医学の考え方が、そのまま実装できる
土用中の節気の扱い
土用の期間は節気をまたぐ。例:夏土用(7/20〜8/6)は大暑(7/23)を含む。

節気は表示、五季は判定 と役割を分ける。 大暑の日に「今は夏土用(長夏)」と表示されるのは矛盾ではなく、 四季の暦と五行の季節が別体系であることの現れである。

ライブラリー層でこの点を説明すること。


春 — 肝を養う季節
1. Beginning of Spring 立春 — 2月4日頃
JA

暦の上で春が始まる。実際にはまだ寒さの底にあるが、この日を境に季節は動き出す。旧暦では一年の起点であり、前日の節分に豆をまくのは、年の変わり目に邪気を祓うためだった。

春は肝を養う季節。冬に溜め込んだものが動き出す時期にあたる。酸味・辛味・甘味の食材が推奨される。

EN

Spring opens on the calendar, though the cold is still at its deepest. This day once marked the start of the year — which is why beans are thrown the night before, to clear out what the old year left behind.

Spring belongs to the Liver. What the body stored through winter begins to move again. Sour, pungent, and sweet flavors are favored.


2. Rain Water 雨水 — 2月19日頃
JA

降るものが雪から雨に変わる。積もった雪が解けはじめ、土が湿りを取り戻す。農作業の準備を始める目安とされてきた。

肝が本格的に動き出す時期。滞りをほどく辛味と、肝を養う酸味を意識したい。

EN

What falls from the sky turns from snow to rain. Ice begins to melt, and the soil takes on moisture again. Farmers have long read this term as the signal to start preparing the fields.

The Liver is waking properly now. Pungent flavors to keep things moving, sour to nourish the Liver itself.


3. Awakening of Insects 啓蟄 — 3月5日頃
JA

土の中で冬を越した虫が、春の雷に驚いて這い出してくる。「蟄」は隠れること、「啓」はひらくこと。地面の下で起きていたことが、ようやく表に出る。

体の中でも同じことが起きる。冬の間に静まっていた気が動きはじめる。辛味が巡りを助ける。

EN

Insects that wintered underground are startled awake by the first spring thunder. The name means, quite literally, the opening of what was hidden.

Something similar happens inside. Qi that lay still through winter starts to circulate. Pungent flavors help it move.


4. Spring Equinox 春分 — 3月20日頃
JA

昼と夜の長さが等しくなる。陰陽がちょうど釣り合う日で、ここから昼が長くなっていく。彼岸の中日にもあたる。

陰陽が均衡するこの時期は、偏りのない食べ方が向く。甘味を土台に、酸味と辛味を添える。

EN

Day and night stand equal. Yin and yang are precisely balanced, and from here the light begins to win. In Japan, this day sits at the center of the equinoctial week.

When the seasons hold even, so should the plate. Sweet as a base, with sour and pungent alongside.


5. Pure Brightness 清明 — 4月4日頃
JA

空気が澄み、光が明るさを増す。すべてのものが清らかで明るく見える、という意味の名前。中国では墓参りの日として知られる。

春の盛り。肝の働きが最も活発になる。のびのびと動かすために、辛味で気を巡らせたい。

EN

The air clears and the light sharpens. The name means exactly that — everything appears clean and bright. In China this is the day for visiting family graves.

Spring at its height. The Liver works hardest now. Pungent flavors keep the energy moving freely.


長夏(春土用) — 脾を養う
6. Grain Rain 穀雨 — 4月20日頃
JA

穀物を育てる雨が降る。この頃に蒔いた種がよく育つとされ、田植えの準備が本格化する。春最後の節気。

この時期は春土用にあたる。季節の変わり目は脾が乱れやすい。肝から心へ移る前の、いわば踊り場。甘味で脾を整え、苦味を少し添える。

EN

Rain that feeds the grain. Seeds sown around now are said to take best, and rice fields are readied in earnest. The last term of spring.

This falls within the spring doyō — the eighteen-day hinge between seasons. Transitions unsettle the Spleen. Sweet to steady it, with a little bitter alongside.


夏 — 心を養う季節
7. Beginning of Summer 立夏 — 5月5日頃
JA

暦の上で夏が始まる。新緑が濃くなり、風が乾いてくる。まだ暑さは本格化していないが、日差しは確かに強くなっている。

夏は心を養う季節。苦味が熱をさばき、酸味が汗で失われるものを引き締める。

EN

Summer opens on the calendar. The green deepens, the wind turns dry. The heat hasn't arrived yet, but the sun has clearly changed.

Summer belongs to the Heart. Bitter flavors clear heat; sour holds in what sweating takes away.


8. Grain Buds 小満 — 5月21日頃
JA

麦の穂が実りはじめ、少しずつ満ちてくる。まだ完全ではないが、確かに育っている、という段階を指す。

気温が上がり、心に負担がかかりはじめる。苦味を少しずつ取り入れて、熱がこもらないようにしたい。

EN

Wheat begins to fill out — not full yet, but visibly getting there. The name captures that in-between state precisely.

As temperatures climb, the Heart starts to feel it. Bring in bitter flavors gradually, before the heat has a chance to settle.


9. Grain in Ear 芒種 — 6月5日頃
JA

「芒」は穂先の細い毛のこと。芒を持つ穀物の種を蒔く時期を指す。日本ではちょうど梅雨入りの頃にあたる。

湿気が増しはじめる。心を養う苦味に加えて、甘味で脾を支えておくと、これから続く長夏が楽になる。

EN

The name refers to the fine bristles on a grain husk — this is when such grains are sown. In Japan it lands almost exactly on the start of the rainy season.

The damp is arriving. Alongside bitter for the Heart, bring in sweet to support the Spleen. The long summer ahead will go easier for it.


10. Summer Solstice 夏至 — 6月21日頃
JA

一年で昼が最も長い日。陽が極まる。ただし暑さの本番はこれから来る。ここを境に、日は少しずつ短くなっていく。

陽が極まれば陰に転じる。心に熱がこもりやすい時期。苦味で熱をさばき、酸味で汗によって失われるものを引き締める。

EN

The longest day of the year. Yang reaches its peak — though the real heat is still ahead. From here, the light begins to retreat.

When yang peaks, it turns. Heat gathers in the Heart now. Bitter to clear it, sour to hold in what sweating carries off.


11. Minor Heat 小暑 — 7月7日頃
JA

暑さが本格化しはじめる。日本ではこの頃に梅雨が明ける。湿った熱から、乾いた熱へ変わっていく境目。

湿と熱が重なり、体に負担がかかる。冷たいものを取りすぎると脾が弱る。苦味は取りつつ、温かい形で。

EN

The heat sets in. In Japan, the rainy season usually breaks around now — damp heat giving way to dry heat.

Damp and heat together are hard on the body. Too much cold food weakens the Spleen. Take your bitter flavors, but take them warm.


長夏(夏土用) — 脾を養う
12. Major Heat 大暑 — 7月23日頃
JA

一年で最も暑い時期。夏土用にあたり、土用の丑の日もこの期間に来る。うなぎ、蜆、餅、「う」の付く食べ物。暑さを乗り切るための食が、これほど文化として残っている季節はない。

季節の変わり目は脾が乱れる。甘味で脾を養い、苦味で熱を捌く。ただし冷やしすぎは禁物。涼性のものに温性を一つ添えると釣り合う。

※ 熱性・寒性の強い食材は、合わせるものを工夫して単独では取らない

EN

The hottest stretch of the year, and the heart of the summer doyō. This is when Japan eats eel, clams, rice cakes — an entire food culture built around getting through the heat.

Transitions unsettle the Spleen. Sweet to nourish it, bitter to clear the heat — but don't overdo the cooling. Pair something cooling with something warming and it balances out.

Note: ingredients at the extremes — hot or cold — are best combined rather than eaten alone.


秋 — 肺を養う季節
13. Beginning of Autumn 立秋 — 8月7日頃
JA

暦の上では秋が始まる。とはいえ実際には一年で最も暑い時期にあたる。この日を境に、挨拶は「暑中見舞い」から「残暑見舞い」に変わる。

秋は肺を養う季節。空気が乾きはじめ、肺が最初に負担を受ける。辛味と甘味の食材が推奨される。

EN

Autumn opens on the calendar, though this is often the hottest stretch of the year. From today, Japanese seasonal greetings shift from "midsummer" to "lingering heat."

Autumn belongs to the Lung. As the air begins to dry, the Lung is the first to feel it. Pungent and sweet flavors are favored.


14. End of Heat 処暑 — 8月23日頃
JA

「処」はとどまる、収まるの意。暑さがようやく退きはじめる。朝夕に涼しさが混じるようになる。

夏の疲れが出やすい時期。乾きが本格化する前に、甘味で潤いを蓄えておきたい。

EN

The character 処 means to settle, to come to rest. The heat finally begins to withdraw, and mornings and evenings carry a hint of cool.

Summer fatigue tends to surface now. Before the real dryness sets in, build up moisture with sweet flavors.


15. White Dew 白露 — 9月7日頃
JA

朝、草の上に露が結ぶ。冷えた大気が水気を落とす。白は五行で秋の色にあたり、この名がついた。

乾燥が強まる。肺は乾きに弱い。甘味で潤し、辛味で気を巡らせる。梨や白きくらげのような、白く潤す食材が向く。

EN

Dew forms on the grass at dawn — cooled air releasing its moisture. White is the color of autumn in the Five Phases, hence the name.

Dryness intensifies, and the Lung is vulnerable to it. Sweet to moisten, pungent to keep qi moving. White, moistening foods — pear, snow fungus — suit the season.


16. Autumn Equinox 秋分 — 9月23日頃
JA

昼と夜が再び等しくなる。春分と対をなす日で、ここから夜が長くなっていく。秋の彼岸の中日。

陰陽が転換する。ここから陰が優勢になり、体も内へ向かう。甘味を軸に、辛味を控えめに添える。

EN

Day and night are equal again — the mirror of the spring equinox. From here, the dark grows longer. In Japan, the center of the autumn equinoctial week.

The balance tips. Yin takes over from here, and the body turns inward. Sweet at the center, pungent in moderation.


17. Cold Dew 寒露 — 10月8日頃
JA

露が冷たさを帯びる。白露の頃より気温が下がり、朝の空気に刺すような冷えが混じる。

乾きに冷えが加わる。潤す食材はそのままに、温性のものを少しずつ増やしていく時期。

EN

The dew turns cold. Temperatures have dropped since White Dew, and there's a bite in the morning air now.

Cold joins dryness. Keep the moistening foods, but start folding in warmer ones.


長夏(秋土用) — 脾を養う
18. Frost Descent 霜降 — 10月23日頃
JA

霜が降りはじめる。秋最後の節気で、次は立冬。紅葉が本格化し、農作物の収穫が終わる頃。

秋土用にあたる。肺から腎へ移る前の踊り場。甘味で脾を整えておくと、冬の冷えに耐えられる体になる。

EN

Frost begins to fall. The last term of autumn — winter opens next. Leaves turn in earnest, and the harvest wraps up.

This is the autumn doyō, the hinge between Lung and Kidney. Steady the Spleen with sweet flavors now, and the body meets winter better prepared.


冬 — 腎を養う季節
19. Beginning of Winter 立冬 — 11月7日頃
JA

暦の上で冬が始まる。日が短くなり、風が冷たさを増す。木々が葉を落とし、土が固くなっていく。

冬は腎を養う季節。生命力を蓄える時期にあたる。辛味と鹹味の食材が推奨される。温性・熱性のものを選びたい。

EN

Winter opens on the calendar. The days shorten, the wind sharpens. Trees drop their leaves and the ground hardens.

Winter belongs to the Kidney — the season for storing vitality. Pungent and salty flavors are favored, and warming ingredients over cooling ones.


20. Minor Snow 小雪 — 11月22日頃
JA

雨が雪に変わりはじめる。まだ積もるほどではないが、初雪の便りが届く頃。

冷えが本格化する。辛味で体を温め、鹹味で腎を養う。生ものや冷たいものは控えたい。

EN

Rain starts turning to snow — not enough to settle yet, but the first reports come in around now.

The cold takes hold. Pungent to warm the body, salty to nourish the Kidney. Raw and cold foods are best kept light.


21. Major Snow 大雪 — 12月7日頃
JA

雪が本格的に降り積もる。一年で最も日が短い時期に向かい、寒さが厳しさを増していく。

陽が最も弱まる時期。温めることを最優先に。煮込む、蒸すといった調理法が向く。

EN

Snow falls in earnest and begins to pile up. The days are near their shortest, and the cold deepens.

Yang is at its weakest. Warmth takes priority — this is the season for simmering and steaming.


22. Winter Solstice 冬至 — 12月21日頃
JA

一年で夜が最も長い日。陰が極まる。日本では柚子湯に入り、かぼちゃを食べる習わしがある。この日を境に、日は少しずつ長くなる。

陰が極まれば陽に転じる。冬至は一年の折り返し点でもある。鹹味で腎を養い、温性のもので陽を助ける。

EN

The longest night of the year. Yin reaches its peak. In Japan, people bathe with yuzu and eat pumpkin. From here, the light slowly returns.

When yin peaks, it turns. The solstice is the year's hinge. Salty flavors nourish the Kidney; warming foods support the returning yang.


23. Minor Cold 小寒 — 1月5日頃
JA

寒の入り。ここから節分までが「寒中」で、一年で最も寒い期間にあたる。

冷えが体の芯に届く時期。辛味で巡らせ、鹹味で腎を補う。温かいものを、ゆっくり食べたい。

EN

The cold season officially begins. From here until early February is the coldest stretch of the year.

The chill reaches the core now. Pungent to circulate, salty to replenish the Kidney. Eat warm, and eat slowly.


長夏(冬土用) — 脾を養う
24. Major Cold 大寒 — 1月20日頃
JA

一年で最も寒い時期。二十四節気の最後にあたり、次は立春。寒さの底であると同時に、春がすぐそこにある。

冬土用。一年で最後の踊り場であり、次の一年への入り口でもある。甘味で脾を整え、温性のもので支える。ここを丁寧に過ごすと、春に肝が伸びやかに動く。

EN

The coldest point of the year — and the last of the twenty-four terms. Spring opens next. The bottom of winter is also the edge of what comes after.

The winter doyō: the final hinge of the year, and the doorway to the next. Sweet to steady the Spleen, warming foods to support it. Spend this stretch well and the Liver unfolds freely come spring.


確認をお願いしたい箇所
以下は事実関係の確認が必要。誤りがあれば指摘してください。

節気
確認事項
立春
節分の豆まきは前日で正しいか
清明
中国の墓参り(清明節)の記述
芒種
日本の梅雨入りとほぼ一致するという記述
小暑
梅雨明けがこの頃という記述
立秋
暑中見舞い→残暑見舞いの切り替えが立秋で正しいか
白露
白が秋の色という五行対応
冬至
柚子湯・かぼちゃの習わし
小寒
「寒の入り」で正しいか。寒中は節分まででよいか
大暑
土用蜆・土用餅の記述
実装メモ
長夏の判定ロジック
土用 = 立春・立夏・立秋・立冬の直前18日間

節気の日付が太陽黄経から算出できれば、土用も自動的に決まる。

if (立春の18日前 <= today < 立春)  → 長夏(冬土用)

else if (立夏の18日前 <= today < 立夏) → 長夏(春土用)

else if (立秋の18日前 <= today < 立秋) → 長夏(夏土用)

else if (立冬の18日前 <= today < 立冬) → 長夏(秋土用)

else → 立春/立夏/立秋/立冬 の直近から 春/夏/秋/冬 を決める
節気と五季の対応(結果として)
各季節の最後の節気が、そのまま長夏に対応する。

長夏
該当する節気
春土用
穀雨
夏土用
大暑
秋土用
霜降
冬土用
大寒

清明・小暑・寒露・小寒の期間は末尾3日ほどが土用にかかるが、 表示上は上記4節気を長夏として扱えば実用上問題ない。 ただし判定は日付ベースで行うこと(表示と判定を別ロジックにする)。
その他
日付は年により変動する。太陽黄経から算出すること
段落2の推奨される味は、五季の判定ロジックと必ず一致させること
大暑の注記(熱性・寒性は単独で取らない)は、他の節気にも展開できる
土用の食文化(丑の日、土用蜆、土用餅、丑湯)はコンテンツとして展開の余地あり
