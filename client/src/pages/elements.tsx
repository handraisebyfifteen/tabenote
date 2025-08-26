import { Card, CardContent } from "@/components/ui/card";
import FiveElementsDisplay, { fiveElementsData } from "@/components/five-elements-display";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  TreePine, 
  Flame, 
  Mountain, 
  Gem, 
  Droplets,
  ArrowRight,
  RotateCcw
} from "lucide-react";

export default function Elements() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const elements = Object.entries(fiveElementsData);

  const generateCycle = (type: 'generate' | 'destroy') => {
    if (type === 'generate') {
      return ['wood', 'fire', 'earth', 'metal', 'water'];
    } else {
      return ['wood', 'earth', 'water', 'fire', 'metal'];
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">五行学説・相関図</h1>
        <p className="text-gray-600">薬膳食典に基づく五行理論と食材の分類システム</p>
      </div>

      {/* Interactive Five Elements Circle */}
      <Card className="shadow-lg border-2 p-8 mb-8 bg-gradient-to-br from-gray-50 to-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">五行相関図 - インタラクティブ表示</h2>
        
        <div className="relative w-96 h-96 mx-auto mb-8">
          {/* Center pentagon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
              <span className="text-lg font-bold text-gray-600">五行</span>
            </div>
          </div>

          {/* Elements positioned in a circle */}
          {Object.entries(fiveElementsData).map(([key, element], index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180); // 72 degrees apart, starting from top
            const radius = 140;
            const x = Math.cos(angle) * radius + 192; // 192 = half of container width
            const y = Math.sin(angle) * radius + 192; // 192 = half of container height
            
            return (
              <div
                key={key}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <FiveElementsDisplay 
                  element={key} 
                  showDetails={true}
                  className={`${selectedElement === key ? 'ring-4 ring-blue-300' : ''}`}
                />
              </div>
            );
          })}

          {/* Generate cycle arrows (outer circle) */}
          {generateCycle('generate').map((element, index) => {
            const nextIndex = (index + 1) % 5;
            const angle1 = (index * 72 - 90) * (Math.PI / 180);
            const angle2 = (nextIndex * 72 - 90) * (Math.PI / 180);
            const radius = 120;
            const x1 = Math.cos(angle1) * radius + 192;
            const y1 = Math.sin(angle1) * radius + 192;
            const x2 = Math.cos(angle2) * radius + 192;
            const y2 = Math.sin(angle2) * radius + 192;
            
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const arrowAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            
            return (
              <div
                key={`generate-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: midX, 
                  top: midY,
                  transform: `translate(-50%, -50%) rotate(${arrowAngle}deg)`
                }}
              >
                <ArrowRight className="w-4 h-4 text-green-500" />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-green-600" />
              相生（そうしょう）- 促進関係
            </h3>
            <p className="text-sm text-green-700 mb-4">互いを育み、強化する関係</p>
            <div className="space-y-2">
              {[
                { from: '木', to: '火', description: '木が燃えて火を生む' },
                { from: '火', to: '土', description: '火が燃えて土（灰）を生む' },
                { from: '土', to: '金', description: '土の中から金属が生まれる' },
                { from: '金', to: '水', description: '金属の表面に水滴が生まれる' },
                { from: '水', to: '木', description: '水が木を育てる' }
              ].map((relation, idx) => (
                <div key={idx} className="flex items-center text-xs text-green-600 bg-white rounded px-3 py-2">
                  <span className="font-medium">{relation.from}</span>
                  <ArrowRight className="w-3 h-3 mx-2" />
                  <span className="font-medium">{relation.to}</span>
                  <span className="ml-2 text-gray-500">: {relation.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-red-50 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-600" />
              相克（そうこく）- 抑制関係
            </h3>
            <p className="text-sm text-red-700 mb-4">互いを制御し、バランスを保つ関係</p>
            <div className="space-y-2">
              {[
                { from: '木', to: '土', description: '木の根が土を吸収する' },
                { from: '土', to: '水', description: '土が水を吸収・せき止める' },
                { from: '水', to: '火', description: '水が火を消す' },
                { from: '火', to: '金', description: '火が金属を溶かす' },
                { from: '金', to: '木', description: '金属が木を切る' }
              ].map((relation, idx) => (
                <div key={idx} className="flex items-center text-xs text-red-600 bg-white rounded px-3 py-2">
                  <span className="font-medium">{relation.from}</span>
                  <RotateCcw className="w-3 h-3 mx-2" />
                  <span className="font-medium">{relation.to}</span>
                  <span className="ml-2 text-gray-500">: {relation.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Element Cards Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">五行詳細 - クリックして詳細表示</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {elements.map(([key, element]) => {
            const Icon = element.icon;
            return (
              <Card 
                key={key} 
                className={`shadow-lg border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  selectedElement === key ? 'ring-4 ring-blue-300 border-blue-300' : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedElement(selectedElement === key ? null : key)}
              >
                <div className={`${element.color} text-white p-6 text-center`}>
                  <Icon className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-bold text-xl">{element.name}</h3>
                  <p className="text-sm opacity-90">{element.nameEn}</p>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">季節:</span>
                      <Badge className={element.lightColor}>{element.season}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">臓腑:</span>
                      <Badge className={element.lightColor}>{element.organ}・{element.bowel}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">味:</span>
                      <Badge className={element.lightColor}>{element.flavor}味</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">感情:</span>
                      <Badge className={element.lightColor}>{element.emotion}</Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 block mb-2">代表食材:</span>
                      <div className="flex flex-wrap gap-1">
                        {element.foods.slice(0, 3).map((food, foodIndex) => (
                          <span 
                            key={foodIndex}
                            className={`px-2 py-1 ${element.lightColor} rounded-full text-xs font-medium`}
                          >
                            {food}
                          </span>
                        ))}
                        {element.foods.length > 3 && (
                          <span className={`px-2 py-1 ${element.lightColor} rounded-full text-xs`}>
                            +{element.foods.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Element Details */}
      {selectedElement && (
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {fiveElementsData[selectedElement as keyof typeof fiveElementsData].name} 
              ({fiveElementsData[selectedElement as keyof typeof fiveElementsData].nameEn}) の詳細
            </h2>
            <button 
              onClick={() => setSelectedElement(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              閉じる
            </button>
          </div>
          
          <FiveElementsDisplay 
            element={selectedElement} 
            showDetails={true}
          />
        </Card>
      )}

      {/* TCM Application */}
      <Card className="shadow-lg border p-8 bg-gradient-to-br from-amber-50 to-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">薬膳における五行活用法</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">体質診断への応用</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 肌色・舌の色から五行バランスを判断</li>
              <li>• 感情の傾向から虚実を見極める</li>
              <li>• 味の好みから臓器の状態を推測</li>
              <li>• 季節による体調変化を予測</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">食材選択の指針</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 相生関係を利用した補強</li>
              <li>• 相克関係による過剰の抑制</li>
              <li>• 季節に応じた五行バランス</li>
              <li>• 個人の体質に合わせた調整</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}