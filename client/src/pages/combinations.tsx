import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  X, 
  Sparkles, 
  Heart, 
  Zap, 
  Scale, 
  ThermometerSun,
  ThermometerSnowflake,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Search
} from "lucide-react";
import type { Ingredient } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Combinations() {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [combinationResult, setCombinationResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const { data: ingredients = [] } = useQuery({
    queryKey: ["/api/ingredients"],
  });

  const { data: searchResults = [] } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients/search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ q: searchQuery });
      const response = await fetch(`/api/ingredients/search?${params}`);
      if (!response.ok) throw new Error("検索に失敗しました");
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const analyzeCombination = useMutation({
    mutationFn: async (ingredientIds: string[]) => {
      const response = await fetch("/api/combinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `組み合わせ分析 ${new Date().toLocaleString()}`,
          description: "自動生成された組み合わせ分析",
          ingredients: ingredientIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error("分析に失敗しました");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCombinationResult(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    },
  });

  const addIngredient = (ingredient: Ingredient) => {
    if (selectedIngredients.find(item => item.id === ingredient.id)) return;
    if (selectedIngredients.length >= 5) return; // 最大5個まで
    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSearchQuery("");
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredientId));
  };

  const handleAnalyze = () => {
    if (selectedIngredients.length < 2) return;
    setIsAnalyzing(true);
    analyzeCombination.mutate(selectedIngredients.map(ing => ing.id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0.6) return <ThermometerSun className="text-red-500" size={20} />;
    if (balance < -0.6) return <ThermometerSnowflake className="text-blue-500" size={20} />;
    return <Scale className="text-green-500" size={20} />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          <Sparkles className="inline mr-3" size={32} />
          薬膳食材組み合わせ分析
        </h1>
        <p className="text-gray-600">食材の相性と薬膳効果を分析して、最適な組み合わせを見つけましょう</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左側: 食材選択 */}
        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2" size={24} />
                食材を選択 ({selectedIngredients.length}/5)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              {/* 簡単検索 */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    placeholder="食材名を入力してEnterで追加..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        addIngredient(searchResults[0]);
                      }
                    }}
                    className="pl-10"
                    data-testid="input-ingredient-search"
                  />
                  {searchQuery && searchResults.length > 0 && (
                    <Button
                      onClick={() => addIngredient(searchResults[0])}
                      className="absolute right-2 top-1.5 h-8 px-3 text-xs bg-orange-500 hover:bg-orange-600"
                      data-testid="button-quick-add"
                    >
                      追加
                    </Button>
                  )}
                </div>
                
                {/* ドロップダウン検索結果 */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.slice(0, 10).map((ingredient: Ingredient, index) => (
                      <button
                        key={ingredient.id}
                        onClick={() => addIngredient(ingredient)}
                        className={`w-full text-left p-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === 0 ? 'bg-orange-25' : ''
                        }`}
                        data-testid={`button-add-ingredient-${ingredient.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800">{ingredient.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <Badge variant="outline" className="mr-1 text-xs">{ingredient.nature}</Badge>
                              <Badge variant="outline" className="mr-1 text-xs">{ingredient.element}</Badge>
                              <Badge variant="outline" className="text-xs">{ingredient.flavor[0]}</Badge>
                            </div>
                          </div>
                          <Plus className="text-orange-500" size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 人気食材クイック選択 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">よく使われる食材</h4>
                <div className="flex flex-wrap gap-2">
                  {ingredients.slice(0, 12).map((ingredient) => (
                    <Button
                      key={ingredient.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addIngredient(ingredient)}
                      className="text-xs h-8 hover:bg-orange-50 hover:border-orange-300"
                      disabled={selectedIngredients.find(item => item.id === ingredient.id) !== undefined}
                      data-testid={`button-quick-select-${ingredient.id}`}
                    >
                      <Plus className="mr-1" size={12} />
                      {ingredient.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 選択済み食材 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">選択済み食材</h4>
                {selectedIngredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200 animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 flex items-center">
                        <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        {ingredient.name}
                      </div>
                      <div className="flex gap-2 mt-2 ml-8">
                        <Badge variant="outline" className="text-xs bg-white">{ingredient.nature}</Badge>
                        <Badge variant="outline" className="text-xs bg-white">{ingredient.element}</Badge>
                        <Badge variant="outline" className="text-xs bg-white">{ingredient.flavor[0]}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="ml-2 p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                      data-testid={`button-remove-ingredient-${ingredient.id}`}
                      title="削除"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                {selectedIngredients.length > 0 && (
                  <Button
                    onClick={() => setSelectedIngredients([])}
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="mr-2" size={14} />
                    すべてクリア
                  </Button>
                )}
              </div>

              {selectedIngredients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
                  <p>まずは食材を選択してください</p>
                </div>
              )}

              {/* 分析ボタン */}
              <Button
                onClick={handleAnalyze}
                disabled={selectedIngredients.length < 2 || isAnalyzing}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                data-testid="button-analyze-combination"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="mr-2 animate-spin" size={20} />
                    分析中...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" size={20} />
                    組み合わせを分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右側: 分析結果 */}
        <div className="space-y-6">
          {combinationResult ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">総合評価</TabsTrigger>
                <TabsTrigger value="balance">バランス</TabsTrigger>
                <TabsTrigger value="effects">効果・注意</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* 総合スコア */}
                <Card className="shadow-lg">
                  <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardTitle className="text-2xl">
                      <Heart className="inline mr-2" size={28} />
                      総合スコア
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 text-center">
                    <div className={`text-6xl font-bold mb-4 ${getScoreColor(combinationResult.overallScore)}`}>
                      {combinationResult.overallScore}
                    </div>
                    <Progress value={combinationResult.overallScore} className="h-3 mb-4" />
                    <div className="text-gray-600">
                      {combinationResult.overallScore >= 80 ? "素晴らしい組み合わせです！" :
                       combinationResult.overallScore >= 60 ? "良い組み合わせです" :
                       "改善の余地があります"}
                    </div>
                  </CardContent>
                </Card>

                {/* 陰陽バランス */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        {getBalanceIcon(combinationResult.yinYangBalance)}
                        <span className="ml-2">陰陽バランス</span>
                      </h3>
                      <Badge className={getScoreColor(Math.abs(combinationResult.yinYangBalance) * 100)}>
                        {combinationResult.yinYangBalance > 0 ? "陽性" : combinationResult.yinYangBalance < 0 ? "陰性" : "中性"}
                      </Badge>
                    </div>
                    <div className="relative bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 h-full transition-all duration-500"
                        style={{
                          width: `${Math.abs(combinationResult.yinYangBalance) * 50}%`,
                          left: combinationResult.yinYangBalance > 0 ? "50%" : `${50 - Math.abs(combinationResult.yinYangBalance) * 50}%`,
                          backgroundColor: combinationResult.yinYangBalance > 0 ? "#f97316" : "#3b82f6"
                        }}
                      />
                      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-600"></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="balance" className="space-y-4">
                {/* 詳細バランス */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="mr-2" size={24} />
                      詳細バランス分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>温度バランス</span>
                        <span className="font-semibold">{(combinationResult.temperatureBalance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.abs(combinationResult.temperatureBalance) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>味のバランス</span>
                        <span className="font-semibold">{(combinationResult.flavorBalance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.abs(combinationResult.flavorBalance) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>五行バランス</span>
                        <span className="font-semibold">{(combinationResult.elementBalance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.abs(combinationResult.elementBalance) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects" className="space-y-4">
                {/* 効果 */}
                {combinationResult.effects?.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="flex items-center text-green-800">
                        <CheckCircle2 className="mr-2" size={24} />
                        期待される効果
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid gap-2">
                        {combinationResult.effects.map((effect: string, index: number) => (
                          <div key={index} className="flex items-center text-green-700">
                            <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                            {effect}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 注意点 */}
                {combinationResult.warnings?.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader className="bg-yellow-50">
                      <CardTitle className="flex items-center text-yellow-800">
                        <AlertTriangle className="mr-2" size={24} />
                        注意点
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid gap-2">
                        {combinationResult.warnings.map((warning: string, index: number) => (
                          <div key={index} className="flex items-center text-yellow-700">
                            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 提案 */}
                {combinationResult.suggestions?.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="flex items-center text-blue-800">
                        <Sparkles className="mr-2" size={24} />
                        改善提案
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid gap-2">
                        {combinationResult.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-center text-blue-700">
                            <Sparkles size={16} className="mr-2 flex-shrink-0" />
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="shadow-lg border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <Sparkles size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">分析結果がここに表示されます</h3>
                <p className="text-gray-500">
                  2つ以上の食材を選択して「組み合わせを分析」ボタンをクリックしてください
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}