import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carrot, Leaf, Flame, Wheat, ChevronDown, ChevronUp } from "lucide-react";
import type { Ingredient } from "@shared/schema";

interface IngredientCardProps {
  ingredient: Ingredient;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "vegetable": return Carrot;
    case "spice": return Flame;
    case "grain": return Wheat;
    default: return Leaf;
  }
};

const getNatureColor = (nature: string) => {
  switch (nature) {
    case "hot": return "bg-red-100 text-red-800";
    case "warm": return "bg-orange-100 text-orange-800";
    case "neutral": return "bg-gray-100 text-gray-800";
    case "cool": return "bg-blue-100 text-blue-800";
    case "cold": return "bg-blue-200 text-blue-900";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getElementColor = (element: string) => {
  switch (element) {
    case "wood": return "bg-green-100 text-green-800";
    case "fire": return "bg-red-100 text-red-800";
    case "earth": return "bg-yellow-100 text-yellow-800";
    case "metal": return "bg-gray-100 text-gray-800";
    case "water": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getNatureLabel = (nature: string) => {
  const labels: Record<string, string> = {
    hot: "熱性",
    warm: "温性", 
    neutral: "平性",
    cool: "涼性",
    cold: "寒性"
  };
  return labels[nature] || nature;
};

const getFlavorLabel = (flavors: string[]) => {
  const labels: Record<string, string> = {
    sweet: "甘",
    sour: "酸", 
    bitter: "苦",
    spicy: "辛",
    salty: "鹹"
  };
  return flavors.map(f => labels[f] || f).join("");
};

const getElementLabel = (element: string) => {
  const labels: Record<string, string> = {
    wood: "木",
    fire: "火",
    earth: "土", 
    metal: "金",
    water: "水"
  };
  return labels[element] || element;
};

const getMeridianLabel = (meridian: string) => {
  const labels: Record<string, string> = {
    lung: "肺 (Lung)",
    large_intestine: "大腸 (Large Intestine)",
    stomach: "胃 (Stomach)",
    spleen: "脾 (Spleen)",
    heart: "心 (Heart)",
    small_intestine: "小腸 (Small Intestine)",
    bladder: "膀胱 (Bladder)",
    kidney: "腎 (Kidney)",
    pericardium: "心包 (Pericardium)",
    triple_heater: "三焦 (Triple Heater)",
    gallbladder: "胆 (Gallbladder)",
    liver: "肝 (Liver)"
  };
  return labels[meridian] || meridian;
};

const getNutritionLabel = (key: string) => {
  const labels: Record<string, string> = {
    calories: "カロリー",
    protein: "タンパク質",
    fat: "脂質",
    carbohydrates: "炭水化物",
    fiber: "食物繊維",
    sugar: "糖質",
    sodium: "ナトリウム",
    potassium: "カリウム",
    calcium: "カルシウム",
    iron: "鉄",
    magnesium: "マグネシウム",
    phosphorus: "リン",
    zinc: "亜鉛",
    vitamin_A: "ビタミンA",
    vitamin_B1: "ビタミンB1",
    vitamin_B2: "ビタミンB2",
    vitamin_B6: "ビタミンB6",
    vitamin_B12: "ビタミンB12",
    vitamin_C: "ビタミンC",
    vitamin_D: "ビタミンD",
    vitamin_E: "ビタミンE",
    vitamin_K: "ビタミンK",
    folate: "葉酸",
    niacin: "ナイアシン",
    omega_3: "オメガ3脂肪酸",
    beta_carotene: "ベータカロテン",
    lycopene: "リコピン",
    anthocyanins: "アントシアニン",
    polyphenols: "ポリフェノール",
    isoflavones: "イソフラボン",
    caffeine: "カフェイン",
    alcohol: "アルコール",
    salt: "塩分",
    cholesterol: "コレステロール",
    selenium: "セレン",
    copper: "銅",
    manganese: "マンガン",
    iodine: "ヨウ素",
    chromium: "クロム",
    molybdenum: "モリブデン",
    pantothenic_acid: "パントテン酸",
    biotin: "ビオチン",
    choline: "コリン",
    water: "水分",
    ash: "灰分",
    energy: "エネルギー",
    glucose: "グルコース",
    fructose: "フルクトース",
    sucrose: "スクロース",
    lactose: "ラクトース",
    galactose: "ガラクトース",
    starch: "デンプン",
    amino_acids: "アミノ酸",
    essential_oils: "精油",
    volatile_compounds: "揮発性化合物",
    organic_acids: "有機酸",
    enzymes: "酵素",
    probiotics: "プロバイオティクス",
    prebiotics: "プレバイオティクス",
    dietary_fiber: "食物繊維",
    pectin: "ペクチン",
    cellulose: "セルロース",
    hemicellulose: "ヘミセルロース",
    lignin: "リグニン"
  };
  return labels[key] || key;
};

const formatNutritionValue = (key: string, value: any) => {
  const stringValue = String(value);
  
  // カロリーの場合
  if (key === 'calories' || key === 'energy') {
    return `${stringValue}kcal`;
  }
  
  // ミリグラム単位の栄養素
  if (['sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'phosphorus', 'zinc', 
       'vitamin_C', 'caffeine', 'cholesterol'].includes(key)) {
    return `${stringValue}mg`;
  }
  
  // マイクログラム単位の栄養素
  if (['vitamin_A', 'vitamin_B12', 'vitamin_D', 'folate', 'biotin', 'selenium', 
       'iodine', 'chromium', 'molybdenum'].includes(key)) {
    return `${stringValue}μg`;
  }
  
  // グラム単位の栄養素
  if (['protein', 'fat', 'carbohydrates', 'fiber', 'sugar'].includes(key)) {
    return `${stringValue}g`;
  }
  
  // パーセント表示
  if (['alcohol', 'water'].includes(key) && !isNaN(Number(stringValue))) {
    return `${stringValue}%`;
  }
  
  // 定性的な値（high, low, etc.）はそのまま
  if (['high', 'low', 'moderate', 'rich', '含有', 'natural', 'fermented', 'unique'].includes(stringValue)) {
    const qualitativeLabels: Record<string, string> = {
      high: '豊富',
      very_high: '非常に豊富',
      extremely_high: '極めて豊富',
      low: '少量',
      moderate: '適量',
      rich: '豊富',
      含有: '含有',
      natural: '天然',
      fermented: '発酵',
      unique: '特有',
      trace: '微量'
    };
    return qualitativeLabels[stringValue] || stringValue;
  }
  
  return stringValue;
};

export default function IngredientCard({ ingredient }: IngredientCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = getCategoryIcon(ingredient.category);

  return (
    <Card className="shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-800" data-testid={`ingredient-name-${ingredient.id}`}>
              {ingredient.name}
            </h3>
            {ingredient.scientificName && (
              <p className="text-gray-600 text-sm">{ingredient.scientificName}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-500" />
          </div>
        </div>
        
        {/* Basic Properties */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge className={getNatureColor(ingredient.nature)}>
            {getNatureLabel(ingredient.nature)}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {getFlavorLabel(ingredient.flavor || [])}
          </Badge>
          <Badge className={getElementColor(ingredient.element)}>
            {getElementLabel(ingredient.element)}
          </Badge>
        </div>
        
        {/* Detailed Information (Collapsible) */}
        {showDetails && (
          <div className="space-y-4 mb-4 border-t pt-4">
            {/* TCM Properties */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">帰経:</span>
                <div className="flex flex-wrap gap-1 max-w-48">
                  {ingredient.meridians?.map((meridian, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                      {getMeridianLabel(meridian)}
                    </Badge>
                  )) || <span className="text-sm text-gray-500">-</span>}
                </div>
              </div>
            </div>
            
            {/* Effects */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">効能:</h4>
              <p className="text-sm text-gray-600">{ingredient.effects?.join("、") || ""}</p>
            </div>
            
            {/* Contraindications */}
            {ingredient.contraindications && ingredient.contraindications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">適応:</h4>
                <p className="text-sm text-gray-600">{ingredient.contraindications.join("、")}</p>
              </div>
            )}
            
            {/* Nutrition */}
            {ingredient.nutrition && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">栄養成分:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(ingredient.nutrition as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">{getNutritionLabel(key)}:</span> {formatNutritionValue(key, value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Functional Components */}
            {ingredient.functionalComponents && ingredient.functionalComponents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">機能性成分:</h4>
                <p className="text-sm text-gray-600">{ingredient.functionalComponents.join("、")}</p>
              </div>
            )}
            
            {/* Common Uses */}
            {ingredient.commonUses && ingredient.commonUses.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">一般的な用途:</h4>
                <p className="text-sm text-gray-600">{ingredient.commonUses.join("、")}</p>
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-green-600 hover:bg-green-700"
          data-testid={`button-view-details-${ingredient.id}`}
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              詳細を隠す
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              詳細を表示
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
