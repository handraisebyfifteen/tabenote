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
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());

  const elements = Object.entries(fiveElementsData);

  const toggleElement = (key: string) => {
    const newExpanded = new Set(expandedElements);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedElements(newExpanded);
  };

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
        
        <div className="mb-8" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="relative" style={{ width: '384px', height: '384px' }}>
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
              const centerX = 192; // 384px / 2
              const centerY = 192; // 384px / 2
              const x = Math.cos(angle) * radius + centerX;
              const y = Math.sin(angle) * radius + centerY;
              
              return (
                <div
                  key={key}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: x, top: y }}
                >
                  <FiveElementsDisplay 
                    element={key} 
                    showDetails={true}
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
              const centerX = 192; // 384px / 2
              const centerY = 192; // 384px / 2
              const x1 = Math.cos(angle1) * radius + centerX;
              const y1 = Math.sin(angle1) * radius + centerY;
              const x2 = Math.cos(angle2) * radius + centerX;
              const y2 = Math.sin(angle2) * radius + centerY;
            
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {elements.map(([key, element]) => {
            const Icon = element.icon;
            const isExpanded = expandedElements.has(key);
            
            return (
              <Card 
                key={key} 
                className={`shadow-lg border-2 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl ${
                  isExpanded ? 'ring-4 ring-blue-300 border-blue-300 scale-105' : 'hover:border-gray-300'
                }`}
                onClick={() => toggleElement(key)}
              >
                <div className={`${element.color} text-white p-6 text-center`}>
                  <Icon className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="font-bold text-xl">{element.name}</h3>
                  <p className="text-sm opacity-90">{element.nameEn}</p>
                  <div className="mt-2 text-xs opacity-75">
                    {isExpanded ? '▲ 詳細を隠す' : '▼ 詳細を表示'}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  {/* Basic Info */}
                  <div className="space-y-4 text-sm mb-4">
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
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t pt-4 space-y-4 text-sm animate-in slide-in-from-top-2 duration-300">
                      {/* Additional Properties */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          詳細属性
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-gray-600">方位:</span> <span className="font-medium">{element.direction}</span></div>
                          <div><span className="text-gray-600">色:</span> <span className="font-medium">{element.colorName}</span></div>
                          <div><span className="text-gray-600">気候:</span> <span className="font-medium">{element.climate}</span></div>
                          <div><span className="text-gray-600">組織:</span> <span className="font-medium">{element.tissue}</span></div>
                          <div><span className="text-gray-600">感覚器:</span> <span className="font-medium">{element.sense}</span></div>
                          <div><span className="text-gray-600">体液:</span> <span className="font-medium">{element.liquid}</span></div>
                        </div>
                      </div>

                      {/* Foods */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">代表食材</h4>
                        <div className="flex flex-wrap gap-1">
                          {element.foods.map((food, foodIndex) => (
                            <span 
                              key={foodIndex}
                              className={`px-2 py-1 ${element.lightColor} rounded-full text-xs font-medium`}
                            >
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Characteristics */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">特性</h4>
                        <div className="flex flex-wrap gap-1">
                          {element.characteristics.map((char, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Imbalances */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-red-50 rounded p-3">
                          <h5 className="font-medium text-red-800 text-xs mb-1">過剰時の症状</h5>
                          <p className="text-xs text-red-600">{element.imbalance.excess.join("、")}</p>
                        </div>
                        <div className="bg-blue-50 rounded p-3">
                          <h5 className="font-medium text-blue-800 text-xs mb-1">不足時の症状</h5>
                          <p className="text-xs text-blue-600">{element.imbalance.deficiency.join("、")}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-800 font-medium">{element.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

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