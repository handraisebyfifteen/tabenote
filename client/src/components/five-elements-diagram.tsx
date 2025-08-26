import { useState } from "react";
import { 
  TreePine, 
  Flame, 
  Mountain, 
  Coins, 
  Droplets 
} from "lucide-react";

export default function FiveElementsDiagram() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const elements = [
    {
      id: "wood",
      name: "木",
      icon: TreePine,
      position: "top-4 left-1/2 transform -translate-x-1/2",
      meridian: "肝・胆",
      flavor: "酸味"
    },
    {
      id: "fire", 
      name: "火",
      icon: Flame,
      position: "top-20 right-8",
      meridian: "心・小腸",
      flavor: "苦味"
    },
    {
      id: "earth",
      name: "土", 
      icon: Mountain,
      position: "bottom-20 right-12",
      meridian: "脾・胃",
      flavor: "甘味"
    },
    {
      id: "metal",
      name: "金",
      icon: Coins,
      position: "bottom-20 left-12", 
      meridian: "肺・大腸",
      flavor: "辛味"
    },
    {
      id: "water",
      name: "水",
      icon: Droplets,
      position: "top-20 left-8",
      meridian: "腎・膀胱", 
      flavor: "鹹味"
    }
  ];

  const getElementColor = (elementId: string) => {
    const colors: Record<string, string> = {
      wood: "bg-tcm-wood",
      fire: "bg-tcm-fire", 
      earth: "bg-tcm-earth",
      metal: "bg-tcm-metal",
      water: "bg-tcm-water"
    };
    return colors[elementId] || "bg-gray-500";
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square" data-testid="five-elements-diagram">
      {/* Pentagon base structure */}
      <div className="absolute inset-0">
        {elements.map((element) => {
          const Icon = element.icon;
          return (
            <div key={element.id} className={`absolute ${element.position}`}>
              <div 
                className={`w-20 h-20 ${getElementColor(element.id)} text-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                onClick={() => setSelectedElement(element.id)}
                data-testid={`element-${element.id}`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-sm font-bold">{element.name}</span>
              </div>
              <div className="text-center mt-2 text-xs">
                <div className="font-medium">{element.meridian}</div>
                <div className="text-gray-600">{element.flavor}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Relationship Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#059669" />
          </marker>
        </defs>
        {/* Generation Cycle (相生) */}
        <path d="M 200,80 L 280,140" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="generation-line" />
        <path d="M 300,180 L 240,240" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="generation-line" />
        <path d="M 200,260 L 120,240" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="generation-line" />
        <path d="M 100,180 L 120,140" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="generation-line" />
        <path d="M 140,100 L 180,80" stroke="#059669" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" className="generation-line" />
      </svg>

      {/* Element Details Modal */}
      {selectedElement && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-xs mx-4">
            <h3 className="font-bold text-lg mb-4">
              {elements.find(e => e.id === selectedElement)?.name} の詳細
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              詳細な五行の説明がここに表示されます。
            </p>
            <button 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => setSelectedElement(null)}
              data-testid="button-close-element-details"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
