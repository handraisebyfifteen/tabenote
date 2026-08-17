/**
 * 二十四節気の表示テキスト(solar_terms.md rev.1 より転記)。
 *
 *   段落1 = 暦としての事実
 *   段落2 = 中医学の対応(推奨される味は五季の判定ロジックと一致させている)
 *   大暑のみ、性の強い食材についての注記が3段落目に付く
 *
 * キーは SOLAR_TERMS の kanji。
 */

export interface SolarTermText {
  ja: string[];
  en: string[];
}

export const SOLAR_TERM_TEXTS: Record<string, SolarTermText> = {
  立春: {
    ja: [
      '暦の上で春が始まる。実際にはまだ寒さの底にあるが、この日を境に季節は動き出す。旧暦では一年の起点であり、前日の節分に豆をまくのは、年の変わり目に邪気を祓うためだった。',
      '春は肝を養う季節。冬に溜め込んだものが動き出す時期にあたる。酸味・辛味・甘味の食材が推奨される。',
    ],
    en: [
      'Spring opens on the calendar, though the cold is still at its deepest. This day once marked the start of the year — which is why beans are thrown the night before, to clear out what the old year left behind.',
      'Spring belongs to the Liver. What the body stored through winter begins to move again. Sour, pungent, and sweet flavors are favored.',
    ],
  },
  雨水: {
    ja: [
      '降るものが雪から雨に変わる。積もった雪が解けはじめ、土が湿りを取り戻す。農作業の準備を始める目安とされてきた。',
      '肝が本格的に動き出す時期。滞りをほどく辛味と、肝を養う酸味を意識したい。',
    ],
    en: [
      'What falls from the sky turns from snow to rain. Ice begins to melt, and the soil takes on moisture again. Farmers have long read this term as the signal to start preparing the fields.',
      'The Liver is waking properly now. Pungent flavors to keep things moving, sour to nourish the Liver itself.',
    ],
  },
  啓蟄: {
    ja: [
      '土の中で冬を越した虫が、春の雷に驚いて這い出してくる。「蟄」は隠れること、「啓」はひらくこと。地面の下で起きていたことが、ようやく表に出る。',
      '体の中でも同じことが起きる。冬の間に静まっていた気が動きはじめる。辛味が巡りを助ける。',
    ],
    en: [
      'Insects that wintered underground are startled awake by the first spring thunder. The name means, quite literally, the opening of what was hidden.',
      'Something similar happens inside. Qi that lay still through winter starts to circulate. Pungent flavors help it move.',
    ],
  },
  春分: {
    ja: [
      '昼と夜の長さが等しくなる。陰陽がちょうど釣り合う日で、ここから昼が長くなっていく。彼岸の中日にもあたる。',
      '陰陽が均衡するこの時期は、偏りのない食べ方が向く。甘味を土台に、酸味と辛味を添える。',
    ],
    en: [
      'Day and night stand equal. Yin and yang are precisely balanced, and from here the light begins to win. In Japan, this day sits at the center of the equinoctial week.',
      'When the seasons hold even, so should the plate. Sweet as a base, with sour and pungent alongside.',
    ],
  },
  清明: {
    ja: [
      '空気が澄み、光が明るさを増す。すべてのものが清らかで明るく見える、という意味の名前。中国では墓参りの日として知られる。',
      '春の盛り。肝の働きが最も活発になる。のびのびと動かすために、辛味で気を巡らせたい。',
    ],
    en: [
      'The air clears and the light sharpens. The name means exactly that — everything appears clean and bright. In China this is the day for visiting family graves.',
      'Spring at its height. The Liver works hardest now. Pungent flavors keep the energy moving freely.',
    ],
  },
  穀雨: {
    ja: [
      '穀物を育てる雨が降る。この頃に蒔いた種がよく育つとされ、田植えの準備が本格化する。春最後の節気。',
      'この時期は春土用にあたる。季節の変わり目は脾が乱れやすい。肝から心へ移る前の、いわば踊り場。甘味で脾を整え、苦味を少し添える。',
    ],
    en: [
      'Rain that feeds the grain. Seeds sown around now are said to take best, and rice fields are readied in earnest. The last term of spring.',
      'This falls within the spring doyō — the eighteen-day hinge between seasons. Transitions unsettle the Spleen. Sweet to steady it, with a little bitter alongside.',
    ],
  },
  立夏: {
    ja: [
      '暦の上で夏が始まる。新緑が濃くなり、風が乾いてくる。まだ暑さは本格化していないが、日差しは確かに強くなっている。',
      '夏は心を養う季節。苦味が熱をさばき、酸味が汗で失われるものを引き締める。',
    ],
    en: [
      "Summer opens on the calendar. The green deepens, the wind turns dry. The heat hasn't arrived yet, but the sun has clearly changed.",
      'Summer belongs to the Heart. Bitter flavors clear heat; sour holds in what sweating takes away.',
    ],
  },
  小満: {
    ja: [
      '麦の穂が実りはじめ、少しずつ満ちてくる。まだ完全ではないが、確かに育っている、という段階を指す。',
      '気温が上がり、心に負担がかかりはじめる。苦味を少しずつ取り入れて、熱がこもらないようにしたい。',
    ],
    en: [
      'Wheat begins to fill out — not full yet, but visibly getting there. The name captures that in-between state precisely.',
      'As temperatures climb, the Heart starts to feel it. Bring in bitter flavors gradually, before the heat has a chance to settle.',
    ],
  },
  芒種: {
    ja: [
      '「芒」は穂先の細い毛のこと。芒を持つ穀物の種を蒔く時期を指す。日本ではちょうど梅雨入りの頃にあたる。',
      '湿気が増しはじめる。心を養う苦味に加えて、甘味で脾を支えておくと、これから続く長夏が楽になる。',
    ],
    en: [
      'The name refers to the fine bristles on a grain husk — this is when such grains are sown. In Japan it lands almost exactly on the start of the rainy season.',
      'The damp is arriving. Alongside bitter for the Heart, bring in sweet to support the Spleen. The long summer ahead will go easier for it.',
    ],
  },
  夏至: {
    ja: [
      '一年で昼が最も長い日。陽が極まる。ただし暑さの本番はこれから来る。ここを境に、日は少しずつ短くなっていく。',
      '陽が極まれば陰に転じる。心に熱がこもりやすい時期。苦味で熱をさばき、酸味で汗によって失われるものを引き締める。',
    ],
    en: [
      'The longest day of the year. Yang reaches its peak — though the real heat is still ahead. From here, the light begins to retreat.',
      'When yang peaks, it turns. Heat gathers in the Heart now. Bitter to clear it, sour to hold in what sweating carries off.',
    ],
  },
  小暑: {
    ja: [
      '暑さが本格化しはじめる。日本ではこの頃に梅雨が明ける。湿った熱から、乾いた熱へ変わっていく境目。',
      '湿と熱が重なり、体に負担がかかる。冷たいものを取りすぎると脾が弱る。苦味は取りつつ、温かい形で。',
    ],
    en: [
      'The heat sets in. In Japan, the rainy season usually breaks around now — damp heat giving way to dry heat.',
      'Damp and heat together are hard on the body. Too much cold food weakens the Spleen. Take your bitter flavors, but take them warm.',
    ],
  },
  大暑: {
    ja: [
      '一年で最も暑い時期。夏土用にあたり、土用の丑の日もこの期間に来る。うなぎ、蜆、餅、「う」の付く食べ物。暑さを乗り切るための食が、これほど文化として残っている季節はない。',
      '季節の変わり目は脾が乱れる。甘味で脾を養い、苦味で熱を捌く。ただし冷やしすぎは禁物。涼性のものに温性を一つ添えると釣り合う。',
      '※ 熱性・寒性の強い食材は、合わせるものを工夫して単独では取らない',
    ],
    en: [
      'The hottest stretch of the year, and the heart of the summer doyō. This is when Japan eats eel, clams, rice cakes — an entire food culture built around getting through the heat.',
      "Transitions unsettle the Spleen. Sweet to nourish it, bitter to clear the heat — but don't overdo the cooling. Pair something cooling with something warming and it balances out.",
      'Note: ingredients at the extremes — hot or cold — are best combined rather than eaten alone.',
    ],
  },
  立秋: {
    ja: [
      '暦の上では秋が始まる。とはいえ実際には一年で最も暑い時期にあたる。この日を境に、挨拶は「暑中見舞い」から「残暑見舞い」に変わる。',
      '秋は肺を養う季節。空気が乾きはじめ、肺が最初に負担を受ける。辛味と甘味の食材が推奨される。',
    ],
    en: [
      'Autumn opens on the calendar, though this is often the hottest stretch of the year. From today, Japanese seasonal greetings shift from "midsummer" to "lingering heat."',
      'Autumn belongs to the Lung. As the air begins to dry, the Lung is the first to feel it. Pungent and sweet flavors are favored.',
    ],
  },
  処暑: {
    ja: [
      '「処」はとどまる、収まるの意。暑さがようやく退きはじめる。朝夕に涼しさが混じるようになる。',
      '夏の疲れが出やすい時期。乾きが本格化する前に、甘味で潤いを蓄えておきたい。',
    ],
    en: [
      'The character 処 means to settle, to come to rest. The heat finally begins to withdraw, and mornings and evenings carry a hint of cool.',
      'Summer fatigue tends to surface now. Before the real dryness sets in, build up moisture with sweet flavors.',
    ],
  },
  白露: {
    ja: [
      '朝、草の上に露が結ぶ。冷えた大気が水気を落とす。白は五行で秋の色にあたり、この名がついた。',
      '乾燥が強まる。肺は乾きに弱い。甘味で潤し、辛味で気を巡らせる。梨や白きくらげのような、白く潤す食材が向く。',
    ],
    en: [
      'Dew forms on the grass at dawn — cooled air releasing its moisture. White is the color of autumn in the Five Phases, hence the name.',
      'Dryness intensifies, and the Lung is vulnerable to it. Sweet to moisten, pungent to keep qi moving. White, moistening foods — pear, snow fungus — suit the season.',
    ],
  },
  秋分: {
    ja: [
      '昼と夜が再び等しくなる。春分と対をなす日で、ここから夜が長くなっていく。秋の彼岸の中日。',
      '陰陽が転換する。ここから陰が優勢になり、体も内へ向かう。甘味を軸に、辛味を控えめに添える。',
    ],
    en: [
      'Day and night are equal again — the mirror of the spring equinox. From here, the dark grows longer. In Japan, the center of the autumn equinoctial week.',
      'The balance tips. Yin takes over from here, and the body turns inward. Sweet at the center, pungent in moderation.',
    ],
  },
  寒露: {
    ja: [
      '露が冷たさを帯びる。白露の頃より気温が下がり、朝の空気に刺すような冷えが混じる。',
      '乾きに冷えが加わる。潤す食材はそのままに、温性のものを少しずつ増やしていく時期。',
    ],
    en: [
      "The dew turns cold. Temperatures have dropped since White Dew, and there's a bite in the morning air now.",
      'Cold joins dryness. Keep the moistening foods, but start folding in warmer ones.',
    ],
  },
  霜降: {
    ja: [
      '霜が降りはじめる。秋最後の節気で、次は立冬。紅葉が本格化し、農作物の収穫が終わる頃。',
      '秋土用にあたる。肺から腎へ移る前の踊り場。甘味で脾を整えておくと、冬の冷えに耐えられる体になる。',
    ],
    en: [
      'Frost begins to fall. The last term of autumn — winter opens next. Leaves turn in earnest, and the harvest wraps up.',
      'This is the autumn doyō, the hinge between Lung and Kidney. Steady the Spleen with sweet flavors now, and the body meets winter better prepared.',
    ],
  },
  立冬: {
    ja: [
      '暦の上で冬が始まる。日が短くなり、風が冷たさを増す。木々が葉を落とし、土が固くなっていく。',
      '冬は腎を養う季節。生命力を蓄える時期にあたる。辛味と鹹味の食材が推奨される。温性・熱性のものを選びたい。',
    ],
    en: [
      'Winter opens on the calendar. The days shorten, the wind sharpens. Trees drop their leaves and the ground hardens.',
      'Winter belongs to the Kidney — the season for storing vitality. Pungent and salty flavors are favored, and warming ingredients over cooling ones.',
    ],
  },
  小雪: {
    ja: [
      '雨が雪に変わりはじめる。まだ積もるほどではないが、初雪の便りが届く頃。',
      '冷えが本格化する。辛味で体を温め、鹹味で腎を養う。生ものや冷たいものは控えたい。',
    ],
    en: [
      'Rain starts turning to snow — not enough to settle yet, but the first reports come in around now.',
      'The cold takes hold. Pungent to warm the body, salty to nourish the Kidney. Raw and cold foods are best kept light.',
    ],
  },
  大雪: {
    ja: [
      '雪が本格的に降り積もる。一年で最も日が短い時期に向かい、寒さが厳しさを増していく。',
      '陽が最も弱まる時期。温めることを最優先に。煮込む、蒸すといった調理法が向く。',
    ],
    en: [
      'Snow falls in earnest and begins to pile up. The days are near their shortest, and the cold deepens.',
      'Yang is at its weakest. Warmth takes priority — this is the season for simmering and steaming.',
    ],
  },
  冬至: {
    ja: [
      '一年で夜が最も長い日。陰が極まる。日本では柚子湯に入り、かぼちゃを食べる習わしがある。この日を境に、日は少しずつ長くなる。',
      '陰が極まれば陽に転じる。冬至は一年の折り返し点でもある。鹹味で腎を養い、温性のもので陽を助ける。',
    ],
    en: [
      'The longest night of the year. Yin reaches its peak. In Japan, people bathe with yuzu and eat pumpkin. From here, the light slowly returns.',
      "When yin peaks, it turns. The solstice is the year's hinge. Salty flavors nourish the Kidney; warming foods support the returning yang.",
    ],
  },
  小寒: {
    ja: [
      '寒の入り。ここから節分までが「寒中」で、一年で最も寒い期間にあたる。',
      '冷えが体の芯に届く時期。辛味で巡らせ、鹹味で腎を補う。温かいものを、ゆっくり食べたい。',
    ],
    en: [
      'The cold season officially begins. From here until early February is the coldest stretch of the year.',
      'The chill reaches the core now. Pungent to circulate, salty to replenish the Kidney. Eat warm, and eat slowly.',
    ],
  },
  大寒: {
    ja: [
      '一年で最も寒い時期。二十四節気の最後にあたり、次は立春。寒さの底であると同時に、春がすぐそこにある。',
      '冬土用。一年で最後の踊り場であり、次の一年への入り口でもある。甘味で脾を整え、温性のもので支える。ここを丁寧に過ごすと、春に肝が伸びやかに動く。',
    ],
    en: [
      'The coldest point of the year — and the last of the twenty-four terms. Spring opens next. The bottom of winter is also the edge of what comes after.',
      'The winter doyō: the final hinge of the year, and the doorway to the next. Sweet to steady the Spleen, warming foods to support it. Spend this stretch well and the Liver unfolds freely come spring.',
    ],
  },
};

export function getTermText(kanji: string): SolarTermText | undefined {
  return SOLAR_TERM_TEXTS[kanji];
}
