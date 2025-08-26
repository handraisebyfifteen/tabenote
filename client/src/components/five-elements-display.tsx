import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  TreePine, 
  Flame, 
  Mountain, 
  Gem, 
  Droplets,
  Heart,
  Brain,
  Flower2,
  Zap,
  Info
} from "lucide-react";

export const fiveElementsData = {
  wood: {
    name: "木",
    nameEn: "Wood",
    icon: TreePine,
    color: "bg-green-500",
    lightColor: "bg-green-100 text-green-800 border-green-300",
    darkColor: "bg-green-600 text-white",
    season: "春",
    direction: "東",
    climate: "風",
    organ: "肝",
    bowel: "胆",
    tissue: "筋・爪",
    sense: "目",
    emotion: "怒",
    flavor: "酸",
    colorName: "青・緑",
    stage: "生（成長）",
    sound: "呼",
    liquid: "涙",
    description: "成長と発展を象徴。春のような生命力と柔軟性を持つ。",
    foods: ["レモン", "梅", "酢", "ほうれん草", "ブロッコリー"],
    meridians: ["肝経", "胆経"],
    time: "1-3時（胆）、3-5時（肝）",
    characteristics: ["伸展", "成長", "発散", "柔軟", "調達"],
    imbalance: {
      excess: ["イライラ", "頭痛", "目の充血", "筋肉のけいれん"],
      deficiency: ["めまい", "筋肉の脱力", "爪がもろい", "視力低下"]
    }
  },
  fire: {
    name: "火",
    nameEn: "Fire",
    icon: Flame,
    color: "bg-red-500",
    lightColor: "bg-red-100 text-red-800 border-red-300",
    darkColor: "bg-red-600 text-white",
    season: "夏",
    direction: "南",
    climate: "暑",
    organ: "心",
    bowel: "小腸",
    tissue: "血脈・面色",
    sense: "舌",
    emotion: "喜",
    flavor: "苦",
    colorName: "赤",
    stage: "長（成熟）",
    sound: "笑",
    liquid: "汗",
    description: "活力と情熱を象徴。温かさと明るさをもたらす。",
    foods: ["トマト", "苦瓜", "赤ピーマン", "いちご", "スイカ"],
    meridians: ["心経", "小腸経", "心包経", "三焦経"],
    time: "11-13時（心）、13-15時（小腸）",
    characteristics: ["炎上", "温熱", "昇騰", "明亮", "動的"],
    imbalance: {
      excess: ["不眠", "動悸", "口渇", "顔面紅潮", "興奮"],
      deficiency: ["倦怠感", "冷え", "顔面蒼白", "無気力"]
    }
  },
  earth: {
    name: "土",
    nameEn: "Earth",
    icon: Mountain,
    color: "bg-yellow-500",
    lightColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
    darkColor: "bg-yellow-600 text-white",
    season: "長夏",
    direction: "中央",
    climate: "湿",
    organ: "脾",
    bowel: "胃",
    tissue: "肌肉・唇",
    sense: "口",
    emotion: "思",
    flavor: "甘",
    colorName: "黄",
    stage: "化（変化）",
    sound: "歌",
    liquid: "涎",
    description: "安定と調和を象徴。栄養を運び全身を養う。",
    foods: ["かぼちゃ", "さつまいも", "とうもろこし", "大豆", "米"],
    meridians: ["脾経", "胃経"],
    time: "7-9時（胃）、9-11時（脾）",
    characteristics: ["中和", "受納", "化生", "運化", "統血"],
    imbalance: {
      excess: ["腹部膨満", "食欲不振", "むくみ", "体が重い"],
      deficiency: ["消化不良", "軟便", "疲労", "筋肉の萎縮"]
    }
  },
  metal: {
    name: "金",
    nameEn: "Metal",
    icon: Gem,
    color: "bg-gray-400",
    lightColor: "bg-gray-100 text-gray-800 border-gray-300",
    darkColor: "bg-gray-600 text-white",
    season: "秋",
    direction: "西",
    climate: "燥",
    organ: "肺",
    bowel: "大腸",
    tissue: "皮・皮毛",
    sense: "鼻",
    emotion: "悲・憂",
    flavor: "辛",
    colorName: "白",
    stage: "収（収穫）",
    sound: "哭",
    liquid: "涕",
    description: "純化と収斂を象徴。清らかさと秩序をもたらす。",
    foods: ["大根", "ねぎ", "生姜", "にんにく", "白菜"],
    meridians: ["肺経", "大腸経"],
    time: "3-5時（肺）、5-7時（大腸）",
    characteristics: ["収斂", "清粛", "下降", "純潔", "堅固"],
    imbalance: {
      excess: ["咳", "喘息", "便秘", "皮膚の乾燥"],
      deficiency: ["息切れ", "声が小さい", "風邪をひきやすい", "軟便"]
    }
  },
  water: {
    name: "水",
    nameEn: "Water",
    icon: Droplets,
    color: "bg-blue-500",
    lightColor: "bg-blue-100 text-blue-800 border-blue-300",
    darkColor: "bg-blue-600 text-white",
    season: "冬",
    direction: "北",
    climate: "寒",
    organ: "腎",
    bowel: "膀胱",
    tissue: "骨・髪",
    sense: "耳",
    emotion: "恐・驚",
    flavor: "鹹",
    colorName: "黒",
    stage: "蔵（貯蔵）",
    sound: "呻",
    liquid: "唾",
    description: "生命力の源を象徴。深い休息と再生をもたらす。",
    foods: ["黒豆", "黒ごま", "昆布", "わかめ", "牡蠣"],
    meridians: ["腎経", "膀胱経"],
    time: "15-17時（膀胱）、17-19時（腎）",
    characteristics: ["潤下", "寒涼", "貯蔵", "滋潤", "柔軟"],
    imbalance: {
      excess: ["浮腫", "頻尿", "腰痛", "耳鳴り"],
      deficiency: ["腰膝の無力", "脱毛", "健忘", "不妊"]
    }
  }
};

type FiveElement = keyof typeof fiveElementsData;

interface FiveElementsDisplayProps {
  element: string;
  className?: string;
  showDetails?: boolean;
}

export default function FiveElementsDisplay({ element, className = "", showDetails = false }: FiveElementsDisplayProps) {
  const [selectedElement, setSelectedElement] = useState<FiveElement | null>(null);
  const elementData = fiveElementsData[element as FiveElement];
  
  if (!elementData) {
    return <Badge className="bg-gray-100 text-gray-800">{element}</Badge>;
  }

  const Icon = elementData.icon;

  if (!showDetails) {
    return (
      <Badge 
        className={`${elementData.lightColor} border cursor-pointer hover:shadow-md transition-all ${className}`}
        onClick={() => setSelectedElement(element as FiveElement)}
      >
        <Icon className="w-3 h-3 mr-1" />
        {elementData.name} {elementData.nameEn}
      </Badge>
    );
  }

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <div className={`relative group cursor-pointer ${className}`}>
          <div className={`
            w-16 h-16 rounded-full ${elementData.color} 
            flex items-center justify-center text-white
            shadow-lg hover:shadow-xl transition-all duration-300
            hover:scale-110
          `}>
            <Icon className="w-8 h-8" />
          </div>
          
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-sm font-bold">{elementData.name}</span>
            <span className="text-xs text-gray-500 ml-1">({elementData.nameEn})</span>
          </div>
        </div>
      </div>

      {selectedElement && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white p-6 md:inset-8 lg:inset-16">
          <button 
            onClick={() => setSelectedElement(null)}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded"
          >
            ✕
          </button>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-full ${fiveElementsData[selectedElement].color} flex items-center justify-center text-white`}>
                {(() => {
                  const ElementIcon = fiveElementsData[selectedElement].icon;
                  return <ElementIcon className="w-10 h-10" />;
                })()}
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {fiveElementsData[selectedElement].name} ({fiveElementsData[selectedElement].nameEn})
                </h2>
                <p className="text-gray-600 mt-1">{fiveElementsData[selectedElement].description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    基本属性
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">季節:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].season}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">方位:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].direction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">色:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].colorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">味:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].flavor}味</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">気候:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].climate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    臓腑・身体
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">臓:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].organ}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">腑:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].bowel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">組織:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].tissue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">感覚器:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].sense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">体液:</span>
                      <span className="font-medium">{fiveElementsData[selectedElement].liquid}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    感情・特性
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="text-gray-600">感情:</span>
                      <span className="font-medium ml-2">{fiveElementsData[selectedElement].emotion}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">音声:</span>
                      <span className="font-medium ml-2">{fiveElementsData[selectedElement].sound}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-600">特性:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {fiveElementsData[selectedElement].characteristics.map((char, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Flower2 className="w-5 h-5" />
                    代表的な食材
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {fiveElementsData[selectedElement].foods.map((food, idx) => (
                        <Badge key={idx} className={fiveElementsData[selectedElement].lightColor}>
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    バランス異常
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-2">
                      <span className="font-medium text-red-600">過剰時:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {fiveElementsData[selectedElement].imbalance.excess.join("、")}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">不足時:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {fiveElementsData[selectedElement].imbalance.deficiency.join("、")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}