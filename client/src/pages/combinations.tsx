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
  const [showAllVegetables, setShowAllVegetables] = useState(false);

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
    staleTime: 0,
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
                
                {/* デバッグ情報 */}
                {process.env.NODE_ENV === 'development' && searchQuery && (
                  <div className="text-xs text-gray-500 mb-2">
                    検索中: "{searchQuery}" - 結果: {searchResults.length}件
                  </div>
                )}
                
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

              {/* 野菜一覧表示 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">登録済み野菜一覧</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllVegetables(!showAllVegetables)}
                    className="text-xs"
                  >
                    {showAllVegetables ? "閉じる" : "全て表示"}
                  </Button>
                </div>
                
                {showAllVegetables ? (
                  <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2">
                    {ingredients
                      .filter(ingredient => ingredient.category === "vegetable")
                      .map((vegetable) => (
                        <div
                          key={vegetable.id}
                          className="flex items-center justify-between p-2 bg-white rounded border hover:shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{vegetable.name}</div>
                            <div className="text-xs text-gray-500">
                              {vegetable.nameEn} • {vegetable.nature} • {vegetable.element} • {vegetable.flavor.join("、")}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addIngredient(vegetable)}
                            disabled={selectedIngredients.find(item => item.id === vegetable.id) !== undefined}
                            className="ml-2 h-8 px-2 text-xs"
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {ingredients
                      .filter(ingredient => ingredient.category === "vegetable")
                      .slice(0, 12)
                      .map((ingredient) => (
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
                )}
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
                {/* 五行バランス分析 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Scale className="mr-2" size={24} />
                      五行バランス分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 五行円形図 */}
                    <div className="text-center">
                      <h4 className="font-medium mb-4">五行相生相克図</h4>
                      <div className="relative w-64 h-64 mx-auto">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* 背景円 */}
                          <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                          
                          {/* 五行要素 */}
                          {[
                            { element: 'wood', name: '木', color: '#10b981', x: 100, y: 20 },
                            { element: 'fire', name: '火', color: '#ef4444', x: 176, y: 69 },
                            { element: 'earth', name: '土', color: '#f59e0b', x: 145, y: 169 },
                            { element: 'metal', name: '金', color: '#6b7280', x: 55, y: 169 },
                            { element: 'water', name: '水', color: '#3b82f6', x: 24, y: 69 }
                          ].map(({ element, name, color, x, y }) => {
                            const count = (combinationResult.elementBalance as any)?.[element] || 0;
                            const radius = 8 + (count * 6);
                            return (
                              <g key={element}>
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r={radius} 
                                  fill={color}
                                  opacity={count > 0 ? 1 : 0.3}
                                />
                                <text 
                                  x={x} 
                                  y={y + 3} 
                                  textAnchor="middle" 
                                  fontSize="12" 
                                  fill="white" 
                                  fontWeight="bold"
                                >
                                  {name}
                                </text>
                                <text 
                                  x={x} 
                                  y={y + 25} 
                                  textAnchor="middle" 
                                  fontSize="10" 
                                  fill="#374151"
                                >
                                  {count}品
                                </text>
                              </g>
                            );
                          })}
                          
                          {/* 相生の線（生成関係） */}
                          <g stroke="#10b981" strokeWidth="2" opacity="0.6" fill="none">
                            <path d="M 100 20 L 176 69" markerEnd="url(#arrowgreen)"/>
                            <path d="M 176 69 L 145 169" markerEnd="url(#arrowgreen)"/>
                            <path d="M 145 169 L 55 169" markerEnd="url(#arrowgreen)"/>
                            <path d="M 55 169 L 24 69" markerEnd="url(#arrowgreen)"/>
                            <path d="M 24 69 L 100 20" markerEnd="url(#arrowgreen)"/>
                          </g>
                          
                          {/* 矢印マーカー */}
                          <defs>
                            <marker id="arrowgreen" markerWidth="10" markerHeight="7" 
                                    refX="9" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981"/>
                            </marker>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    {/* 五行要素詳細 */}
                    <div className="space-y-3">
                      <h4 className="font-medium">五行要素の詳細</h4>
                      {Object.entries(combinationResult.elementBalance || {}).map(([element, count]) => {
                        const elementInfo = {
                          wood: { name: '木', color: 'bg-green-500', description: '肝胆系・成長・発散・春の季節', organ: '肝・胆' },
                          fire: { name: '火', color: 'bg-red-500', description: '心小腸系・興奮・活動・夏の季節', organ: '心・小腸' },
                          earth: { name: '土', color: 'bg-yellow-500', description: '脾胃系・安定・消化・長夏の季節', organ: '脾・胃' },
                          metal: { name: '金', color: 'bg-gray-500', description: '肺大腸系・収斂・浄化・秋の季節', organ: '肺・大腸' },
                          water: { name: '水', color: 'bg-blue-500', description: '腎膀胱系・蓄積・排泄・冬の季節', organ: '腎・膀胱' }
                        }[element as keyof typeof elementInfo] || { name: element, color: 'bg-gray-400', description: '', organ: '' };
                        
                        return (
                          <div key={element} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 ${elementInfo.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                              {elementInfo.name}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{elementInfo.name}の要素 - {elementInfo.organ}</div>
                              <div className="text-sm text-gray-600">{elementInfo.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-orange-600">{count as number}</div>
                              <div className="text-xs text-gray-500">品目</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 五行バランス改善アドバイス */}
                    {combinationResult.suggestions && combinationResult.suggestions.length > 0 && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-medium mb-3 text-amber-800 flex items-center">
                          <Lightbulb className="mr-2" size={20} />
                          五行バランス改善アドバイス
                        </h4>
                        <div className="space-y-3">
                          {combinationResult.suggestions.map((suggestion: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2 text-sm text-amber-700">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* 推奨食材のクイック追加 */}
                        <div className="mt-4 pt-3 border-t border-amber-200">
                          <h5 className="text-sm font-medium text-amber-800 mb-2">おすすめ食材を追加</h5>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const elementBalance = combinationResult.elementBalance as any;
                              const recommendedFoods = [];
                              
                              // 不足している要素の食材を推奨
                              if (elementBalance.wood <= 1) recommendedFoods.push({name: "ほうれん草", element: "wood"});
                              if (elementBalance.fire <= 1) recommendedFoods.push({name: "トマト", element: "fire"});
                              if (elementBalance.earth <= 1) recommendedFoods.push({name: "かぼちゃ", element: "earth"});
                              if (elementBalance.metal <= 1) recommendedFoods.push({name: "大根", element: "metal"});
                              if (elementBalance.water <= 1) recommendedFoods.push({name: "昆布", element: "water"});
                              
                              return recommendedFoods.slice(0, 3).map((food, idx) => {
                                const elementColors = {
                                  wood: "bg-green-100 text-green-800 border-green-300",
                                  fire: "bg-red-100 text-red-800 border-red-300",
                                  earth: "bg-yellow-100 text-yellow-800 border-yellow-300",
                                  metal: "bg-gray-100 text-gray-800 border-gray-300",
                                  water: "bg-blue-100 text-blue-800 border-blue-300"
                                };
                                
                                // 実際の食材データから検索して追加する簡易版
                                const handleQuickAdd = () => {
                                  const foundIngredient = ingredients.find(ing => ing.name === food.name);
                                  if (foundIngredient && !selectedIngredients.find(item => item.id === foundIngredient.id)) {
                                    addIngredient(foundIngredient);
                                  }
                                };
                                
                                return (
                                  <button
                                    key={idx}
                                    onClick={handleQuickAdd}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors hover:shadow-sm ${elementColors[food.element as keyof typeof elementColors]}`}
                                    disabled={!ingredients.find(ing => ing.name === food.name) || selectedIngredients.find(item => item.name === food.name)}
                                  >
                                    + {food.name}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 五行説明 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-800">五行相生について</h4>
                      <p className="text-sm text-blue-700">
                        木→火→土→金→水→木の順で、各要素が次の要素を生み育てる関係です。
                        バランスの取れた食事では、これらの要素が調和していることが重要です。
                      </p>
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