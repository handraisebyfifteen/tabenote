import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carrot, Leaf, Flame, Wheat } from "lucide-react";
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

export default function IngredientCard({ ingredient }: IngredientCardProps) {
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
        
        {/* TCM Properties */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">四性:</span>
            <Badge className={getNatureColor(ingredient.nature)}>
              {getNatureLabel(ingredient.nature)}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">五味:</span>
            <Badge className="bg-yellow-100 text-yellow-800">
              {getFlavorLabel(ingredient.flavor)}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">帰経:</span>
            <Badge className="bg-green-100 text-green-800">
              {ingredient.meridians.join("・")}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">五行:</span>
            <Badge className={getElementColor(ingredient.element)}>
              {getElementLabel(ingredient.element)}
            </Badge>
          </div>
        </div>
        
        {/* Effects */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">効能:</h4>
          <p className="text-sm text-gray-600">{ingredient.effects.join("、")}</p>
        </div>
        
        {/* Nutrition */}
        {ingredient.nutrition && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">栄養成分:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(ingredient.nutrition as Record<string, any>).slice(0, 2).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          data-testid={`button-view-details-${ingredient.id}`}
        >
          詳細を表示
        </Button>
      </CardContent>
    </Card>
  );
}
