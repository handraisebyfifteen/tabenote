// TCM (Traditional Chinese Medicine) data constants and helper functions

export const TCM_NATURES = {
  hot: { label: "熱性", color: "bg-red-100 text-red-800", description: "体を強く温める" },
  warm: { label: "温性", color: "bg-orange-100 text-orange-800", description: "体を温める" },
  neutral: { label: "平性", color: "bg-gray-100 text-gray-800", description: "温めも冷やしもしない" },
  cool: { label: "涼性", color: "bg-blue-100 text-blue-800", description: "体を冷やす" },
  cold: { label: "寒性", color: "bg-blue-200 text-blue-900", description: "体を強く冷やす" }
} as const;

export const TCM_FLAVORS = {
  sweet: { label: "甘味", color: "bg-yellow-100 text-yellow-800", effect: "補益、緩和" },
  sour: { label: "酸味", color: "bg-green-100 text-green-800", effect: "収斂、固渋" },
  bitter: { label: "苦味", color: "bg-orange-100 text-orange-800", effect: "清熱、瀉下" },
  spicy: { label: "辛味", color: "bg-red-100 text-red-800", effect: "発散、行気" },
  salty: { label: "鹹味", color: "bg-blue-100 text-blue-800", effect: "軟堅、散結" }
} as const;

export const TCM_ELEMENTS = {
  wood: { 
    label: "木", 
    color: "bg-tcm-wood", 
    textColor: "text-tcm-wood",
    organ: "肝・胆", 
    flavor: "酸味", 
    emotion: "怒り・イライラ", 
    season: "春",
    description: "成長と発展のエネルギー"
  },
  fire: { 
    label: "火", 
    color: "bg-tcm-fire", 
    textColor: "text-tcm-fire",
    organ: "心・小腸", 
    flavor: "苦味", 
    emotion: "喜び・興奮", 
    season: "夏",
    description: "活動と循環のエネルギー"
  },
  earth: { 
    label: "土", 
    color: "bg-tcm-earth", 
    textColor: "text-tcm-earth",
    organ: "脾・胃", 
    flavor: "甘味", 
    emotion: "思考・心配", 
    season: "長夏",
    description: "変化と消化のエネルギー"
  },
  metal: { 
    label: "金", 
    color: "bg-tcm-metal", 
    textColor: "text-tcm-metal",
    organ: "肺・大腸", 
    flavor: "辛味", 
    emotion: "悲しみ・憂い", 
    season: "秋",
    description: "収斂と浄化のエネルギー"
  },
  water: { 
    label: "水", 
    color: "bg-tcm-water", 
    textColor: "text-tcm-water",
    organ: "腎・膀胱", 
    flavor: "鹹味", 
    emotion: "恐れ・驚き", 
    season: "冬",
    description: "蓄積と貯蔵のエネルギー"
  }
} as const;

export const TCM_MERIDIANS = {
  liver: "肝",
  gallbladder: "胆", 
  heart: "心",
  small_intestine: "小腸",
  spleen: "脾",
  stomach: "胃",
  lung: "肺",
  large_intestine: "大腸",
  kidney: "腎",
  bladder: "膀胱",
  pericardium: "心包",
  triple_heater: "三焦"
} as const;

export const COMBINATION_PRINCIPLES = {
  mutual_reinforcement: {
    name: "相須",
    description: "効果増強",
    color: "bg-green-100 text-green-800"
  },
  mutual_assistance: {
    name: "相使", 
    description: "補助作用",
    color: "bg-blue-100 text-blue-800"
  },
  mutual_restraint: {
    name: "相畏",
    description: "毒性軽減", 
    color: "bg-orange-100 text-orange-800"
  },
  mutual_inhibition: {
    name: "相殺",
    description: "効力相殺",
    color: "bg-red-100 text-red-800"
  },
  mutual_antagonism: {
    name: "相反",
    description: "有害反応",
    color: "bg-red-200 text-red-900"
  }
} as const;

export const BODY_CONSTITUTIONS = {
  qi_deficiency: {
    name: "気虚体質",
    description: "エネルギー不足、疲れやすい",
    characteristics: ["疲労感", "息切れ", "食欲不振", "汗をかきやすい"],
    recommendations: ["補気食材", "適度な運動", "規則正しい生活"]
  },
  yang_deficiency: {
    name: "陽虚体質", 
    description: "体が冷えやすい、代謝が低い",
    characteristics: ["冷え性", "むくみ", "下痢しやすい", "無気力"],
    recommendations: ["温性食材", "体を温める", "適度な運動"]
  },
  yin_deficiency: {
    name: "陰虚体質",
    description: "体液不足、熱がこもりやすい", 
    characteristics: ["のぼせ", "口渇", "便秘", "不眠"],
    recommendations: ["滋陰食材", "涼性食材", "充分な睡眠"]
  },
  phlegm_dampness: {
    name: "痰湿体質",
    description: "水分代謝が悪い、むくみやすい",
    characteristics: ["肥満", "むくみ", "痰が多い", "重だるさ"],
    recommendations: ["利水食材", "辛味食材", "運動"]
  },
  blood_stasis: {
    name: "瘀血体質",
    description: "血液循環が悪い",
    characteristics: ["肩こり", "生理不順", "しみ", "冷え"],
    recommendations: ["活血食材", "温性食材", "適度な運動"]
  }
} as const;

// Helper functions
export const getNatureLabel = (nature: string): string => {
  return TCM_NATURES[nature as keyof typeof TCM_NATURES]?.label || nature;
};

export const getNatureColor = (nature: string): string => {
  return TCM_NATURES[nature as keyof typeof TCM_NATURES]?.color || "bg-gray-100 text-gray-800";
};

export const getFlavorLabel = (flavors: string[]): string => {
  return flavors.map(flavor => 
    TCM_FLAVORS[flavor as keyof typeof TCM_FLAVORS]?.label || flavor
  ).join("");
};

export const getElementLabel = (element: string): string => {
  return TCM_ELEMENTS[element as keyof typeof TCM_ELEMENTS]?.label || element;
};

export const getElementColor = (element: string): string => {
  return TCM_ELEMENTS[element as keyof typeof TCM_ELEMENTS]?.color || "bg-gray-100";
};

export const getMeridianLabel = (meridians: string[]): string => {
  return meridians.map(meridian => 
    TCM_MERIDIANS[meridian as keyof typeof TCM_MERIDIANS] || meridian
  ).join("・");
};

export const calculateElementBalance = (ingredients: any[]): Record<string, number> => {
  const balance = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  ingredients.forEach(ingredient => {
    if (ingredient.element in balance) {
      balance[ingredient.element as keyof typeof balance]++;
    }
  });
  
  return balance;
};

export const calculateFlavorBalance = (ingredients: any[]): Record<string, number> => {
  const balance = { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 };
  
  ingredients.forEach(ingredient => {
    ingredient.flavor?.forEach((flavor: string) => {
      if (flavor in balance) {
        balance[flavor as keyof typeof balance]++;
      }
    });
  });
  
  return balance;
};

export const getCompatibilityAdvice = (yinYangBalance: number, temperatureBalance: number): string[] => {
  const advice: string[] = [];
  
  if (Math.abs(yinYangBalance) > 30) {
    if (yinYangBalance > 30) {
      advice.push("陰性食材を追加してバランスを整えることを推奨");
    } else {
      advice.push("陽性食材を追加してバランスを整えることを推奨");
    }
  }
  
  if (Math.abs(temperatureBalance) > 30) {
    if (temperatureBalance > 30) {
      advice.push("涼性・寒性食材で熱を中和することを推奨");
    } else {
      advice.push("温性・熱性食材で冷えを改善することを推奨");
    }
  }
  
  return advice;
};

export const getSeasonalRecommendations = (season: string): string[] => {
  const recommendations: Record<string, string[]> = {
    spring: ["木の要素を補う", "肝の働きを整える", "酸味を適度に取る"],
    summer: ["火の要素を活用", "心を養う", "苦味で清熱"],
    late_summer: ["土の要素を重視", "脾胃を強化", "甘味で補益"],
    autumn: ["金の要素を補う", "肺を潤す", "辛味で発散"],
    winter: ["水の要素を強化", "腎を補う", "鹹味で軟堅"]
  };
  
  return recommendations[season] || [];
};
