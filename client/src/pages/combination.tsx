import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, BarChart3, AlertTriangle, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Ingredient, Combination } from "@shared/schema";

export default function CombinationPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [analysis, setAnalysis] = useState<Combination | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searchResults } = useQuery({
    queryKey: ["/api/ingredients/search", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  const { data: allIngredients } = useQuery({
    queryKey: ["/api/ingredients"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (ingredients: string[]) => {
      const response = await apiRequest("POST", "/api/combinations", {
        ingredients,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      toast({
        title: "分析完了",
        description: "食材の組み合わせ分析が完了しました。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "分析中にエラーが発生しました。",
        variant: "destructive",
      });
    },
  });

  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.find(i => i.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
      setSearchQuery("");
    }
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredientId));
    setAnalysis(null);
  };

  const quickAddIngredient = (ingredientName: string) => {
    const ingredient = allIngredients?.find(i => i.name === ingredientName);
    if (ingredient) {
      addIngredient(ingredient);
    }
  };

  const analyzeSelection = () => {
    if (selectedIngredients.length < 2) {
      toast({
        title: "食材が不足",
        description: "分析には2つ以上の食材が必要です。",
        variant: "destructive",
      });
      return;
    }
    
    analyzeMutation.mutate(selectedIngredients.map(i => i.id));
  };

  const commonIngredients = ["米", "生姜", "大根", "白菜", "豆腐"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">薬膳組み合わせ診断</h1>
      
      {/* Selection Interface */}
      <Card className="shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">食材を選択</h2>
        
        {/* Search and Add */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="食材名を入力して追加"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-ingredient-search"
            />
            {searchResults && searchResults.length > 0 && searchQuery && (
              <div className="absolute z-10 w-full max-w-md bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
                {searchResults.slice(0, 5).map((ingredient: Ingredient) => (
                  <button
                    key={ingredient.id}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => addIngredient(ingredient)}
                    data-testid={`search-result-${ingredient.id}`}
                  >
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-sm text-gray-500">{ingredient.scientificName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button 
            onClick={() => searchResults?.[0] && addIngredient(searchResults[0])}
            className="bg-green-600 hover:bg-green-700"
            disabled={!searchResults?.[0]}
            data-testid="button-add-ingredient"
          >
            <Plus className="w-4 h-4 mr-2" />
            追加
          </Button>
        </div>

        {/* Quick Add Buttons */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">よく使われる食材:</p>
          <div className="flex flex-wrap gap-2">
            {commonIngredients.map((ingredientName) => (
              <Button
                key={ingredientName}
                variant="outline"
                size="sm"
                onClick={() => quickAddIngredient(ingredientName)}
                data-testid={`quick-add-${ingredientName}`}
              >
                {ingredientName}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Ingredients */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-700 mb-3">選択中の食材:</h3>
          {selectedIngredients.length === 0 ? (
            <p className="text-gray-500 text-sm">食材を選択してください</p>
          ) : (
            <div className="space-y-3" data-testid="selected-ingredients">
              {selectedIngredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold">{ingredient.name[0]}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{ingredient.name}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge className={`text-xs ${
                          ingredient.nature === "hot" ? "bg-red-100 text-red-700" :
                          ingredient.nature === "warm" ? "bg-orange-100 text-orange-700" :
                          ingredient.nature === "cool" ? "bg-blue-100 text-blue-700" :
                          ingredient.nature === "cold" ? "bg-blue-200 text-blue-800" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {ingredient.nature === "hot" ? "熱性" :
                           ingredient.nature === "warm" ? "温性" :
                           ingredient.nature === "neutral" ? "平性" :
                           ingredient.nature === "cool" ? "涼性" :
                           ingredient.nature === "cold" ? "寒性" :
                           ingredient.nature}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          {ingredient.flavor.join("")}
                        </Badge>
                        <Badge className={`text-xs ${
                          ingredient.element === "wood" ? "bg-green-100 text-green-700" :
                          ingredient.element === "fire" ? "bg-red-100 text-red-700" :
                          ingredient.element === "earth" ? "bg-yellow-100 text-yellow-700" :
                          ingredient.element === "metal" ? "bg-gray-100 text-gray-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {ingredient.element === "wood" ? "木" :
                           ingredient.element === "fire" ? "火" :
                           ingredient.element === "earth" ? "土" :
                           ingredient.element === "metal" ? "金" :
                           "水"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`remove-ingredient-${ingredient.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={analyzeSelection}
            disabled={selectedIngredients.length < 2 || analyzeMutation.isPending}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
            data-testid="button-analyze-combination"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {analyzeMutation.isPending ? "分析中..." : "組み合わせを分析"}
          </Button>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Assessment */}
          <Card className="shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">総合評価</h3>
            
            {/* Score */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2" data-testid="analysis-score">
                {analysis.overallScore}
              </div>
              <div className="text-gray-600">/ 100点</div>
              <div className="text-lg font-medium text-green-700 mt-2">
                {analysis.overallScore >= 80 ? "優秀な組み合わせ" :
                 analysis.overallScore >= 60 ? "良好な組み合わせ" :
                 analysis.overallScore >= 40 ? "普通の組み合わせ" :
                 "改善が必要な組み合わせ"}
              </div>
            </div>

            {/* Balance Analysis */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">陰陽バランス</span>
                  <span className="text-gray-600">
                    {analysis.yinYangBalance > 20 ? "陽性" :
                     analysis.yinYangBalance < -20 ? "陰性" : "バランス"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-red-500 h-2 rounded-full" 
                    style={{ width: `${50 + (analysis.yinYangBalance || 0) / 2}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>陰性</span>
                  <span>陽性</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">四性バランス</span>
                  <span className="text-gray-600">
                    {analysis.temperatureBalance > 20 ? "温熱" :
                     analysis.temperatureBalance < -20 ? "寒涼" : "バランス"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-red-600 h-2 rounded-full" 
                    style={{ width: `${50 + (analysis.temperatureBalance || 0) / 2}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>寒涼</span>
                  <span>温熱</span>
                </div>
              </div>
            </div>
          </Card>

          {/* TCM Analysis */}
          <Card className="shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">中医学的分析</h3>
            
            {/* Effects */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">期待される効果</h4>
              <div className="space-y-2">
                {analysis.effects?.map((effect, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">{effect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">注意点</h4>
                <div className="space-y-2">
                  {analysis.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                      <span className="text-sm text-yellow-700">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">改善提案</h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start p-2 bg-blue-50 rounded">
                      <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                      <span className="text-sm text-blue-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
