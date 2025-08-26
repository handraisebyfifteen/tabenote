import { Card, CardContent } from "@/components/ui/card";
import FiveElementsDiagram from "@/components/five-elements-diagram";
import { 
  TreePine, 
  Flame, 
  Mountain, 
  Coins, 
  Droplets 
} from "lucide-react";

export default function Elements() {
  const elements = [
    {
      name: "木",
      nameEn: "Wood Element",
      color: "bg-tcm-wood",
      textColor: "text-tcm-wood",
      icon: TreePine,
      organ: "肝・胆",
      flavor: "酸味",
      emotion: "怒り・イライラ",
      season: "春",
      foods: ["ほうれん草", "青梗菜", "梅"]
    },
    {
      name: "火", 
      nameEn: "Fire Element",
      color: "bg-tcm-fire",
      textColor: "text-tcm-fire",
      icon: Flame,
      organ: "心・小腸",
      flavor: "苦味",
      emotion: "喜び・興奮",
      season: "夏",
      foods: ["トマト", "赤唐辛子", "苦瓜"]
    },
    {
      name: "土",
      nameEn: "Earth Element", 
      color: "bg-tcm-earth",
      textColor: "text-tcm-earth",
      icon: Mountain,
      organ: "脾・胃",
      flavor: "甘味",
      emotion: "思考・心配",
      season: "長夏",
      foods: ["かぼちゃ", "さつまいも", "米"]
    },
    {
      name: "金",
      nameEn: "Metal Element",
      color: "bg-tcm-metal", 
      textColor: "text-tcm-metal",
      icon: Coins,
      organ: "肺・大腸",
      flavor: "辛味",
      emotion: "悲しみ・憂い",
      season: "秋",
      foods: ["大根", "生姜", "梨"]
    },
    {
      name: "水",
      nameEn: "Water Element",
      color: "bg-tcm-water",
      textColor: "text-tcm-water", 
      icon: Droplets,
      organ: "腎・膀胱",
      flavor: "鹹味",
      emotion: "恐れ・驚き", 
      season: "冬",
      foods: ["昆布", "黒豆", "栗"]
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">五行学説・相関図</h1>
      
      {/* Five Elements Diagram */}
      <Card className="shadow-sm border p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">五行相関図</h2>
        <FiveElementsDiagram />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">相生（そうしょう）</h3>
            <p className="text-sm text-green-700">木→火→土→金→水の順で互いを促進・強化する関係</p>
            <ul className="text-xs text-green-600 mt-2 space-y-1">
              <li>• 木生火：木が燃えて火を生む</li>
              <li>• 火生土：火が燃えて土（灰）を生む</li>
              <li>• 土生金：土の中から金属が生まれる</li>
              <li>• 金生水：金属の表面に水滴が生まれる</li>
              <li>• 水生木：水が木を育てる</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">相克（そうこく）</h3>
            <p className="text-sm text-red-700">木→土→水→火→金の順で互いを制御・抑制する関係</p>
            <ul className="text-xs text-red-600 mt-2 space-y-1">
              <li>• 木克土：木の根が土を吸収する</li>
              <li>• 土克水：土が水を吸収・せき止める</li>
              <li>• 水克火：水が火を消す</li>
              <li>• 火克金：火が金属を溶かす</li>
              <li>• 金克木：金属が木を切る</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Element Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {elements.map((element, index) => {
          const Icon = element.icon;
          return (
            <Card key={index} className="shadow-sm border overflow-hidden">
              <div className={`${element.color} text-white p-4 text-center`}>
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold text-lg">{element.name}</h3>
                <p className="text-sm opacity-90">{element.nameEn}</p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">臓腑:</span>
                    <span className="text-gray-600 ml-1">{element.organ}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">味:</span>
                    <span className="text-gray-600 ml-1">{element.flavor}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">感情:</span>
                    <span className="text-gray-600 ml-1">{element.emotion}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">季節:</span>
                    <span className="text-gray-600 ml-1">{element.season}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">代表食材:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {element.foods.map((food, foodIndex) => (
                        <span 
                          key={foodIndex}
                          className={`px-2 py-1 ${element.color} bg-opacity-20 ${element.textColor} rounded text-xs`}
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
