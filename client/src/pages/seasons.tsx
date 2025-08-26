import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SeasonalCalendar from "@/components/seasonal-calendar";
import { Snowflake, Calendar, Clock, Users, ChefHat } from "lucide-react";
import { useState } from "react";

export default function Seasons() {
  const { data: currentSeason } = useQuery({
    queryKey: ["/api/seasons/current"],
  });

  const { data: seasons } = useQuery({
    queryKey: ["/api/seasons"],
  });

  const { data: seasonalIngredients } = useQuery({
    queryKey: ["/api/seasons/current/ingredients"],
    enabled: !!currentSeason,
  });

  const seasonalRecipes = [
    {
      name: "羊肉と大根の煮込み",
      description: "温陽効果の高い羊肉と消化を助ける大根の組み合わせ",
      properties: ["温性", "補腎", "消食"],
      cookingTime: "90分",
      servings: "4人分",
      ingredients: [
        "羊肉 500g（ブロック肉）",
        "大根 1本（約800g）",
        "生姜 30g",
        "長ネギ 2本",
        "八角 2個",
        "桂皮 1片",
        "醤油 大さじ3",
        "紹興酒 大さじ3",
        "氷砂糖 大さじ1",
        "水 1000ml"
      ],
      instructions: [
        "羊肉を3cm角に切り、熱湯で下茹でして臭みを取る",
        "大根は乱切り、生姜は薄切り、長ネギは斜め切りにする",
        "鍋に油を熱し、生姜、八角、桂皮を炒めて香りを出す",
        "羊肉を加えて表面を焼き、紹興酒を加えてアルコールを飛ばす",
        "水、醤油、氷砂糖を加えて煮立て、アクを取る",
        "弱火で60分煮込み、大根を加えてさらに30分煮る",
        "長ネギを加えて5分煮て完成"
      ],
      tcmBenefits: "羊肉の温陽作用で体を温め、大根の消食作用で消化を促進。冬の養生に適した温補の料理。"
    },
    {
      name: "黒豆と胡桃の甘煮", 
      description: "腎を補い、脳の働きを活性化するデザート",
      properties: ["平性", "補腎", "健脳"],
      cookingTime: "120分",
      servings: "6人分",
      ingredients: [
        "黒豆 200g",
        "胡桃 100g",
        "黒砂糖 80g",
        "水 800ml",
        "塩 ひとつまみ"
      ],
      instructions: [
        "黒豆は一晩水に浸けて戻す",
        "胡桃は粗く砕いておく",
        "鍋に黒豆と水を入れ、強火で煮立てる",
        "アクを取り、弱火で90分柔らかくなるまで煮る",
        "黒砂糖と塩を加えて溶かす",
        "胡桃を加えて10分煮て完成",
        "冷蔵庫で冷やしても美味しい"
      ],
      tcmBenefits: "黒豆の補腎作用と胡桃の健脳作用で、腎の精を補い記憶力向上に効果的。アンチエイジングにも。"
    },
    {
      name: "山芋と白きくらげのスープ",
      description: "気を補い肺を潤す滋養スープ", 
      properties: ["平性", "補気", "潤肺"],
      cookingTime: "45分",
      servings: "4人分",
      ingredients: [
        "山芋 300g",
        "白きくらげ 20g（乾燥）",
        "鶏がらスープ 1000ml",
        "枸杞子 大さじ1",
        "塩 小さじ1",
        "白胡椒 少々",
        "ごま油 小さじ1"
      ],
      instructions: [
        "白きくらげは水で戻し、石づきを取って一口大に切る",
        "山芋は皮を剥き、1cm厚の輪切りにする",
        "鍋に鶏がらスープを入れて煮立てる",
        "白きくらげを加えて20分煮る",
        "山芋を加えて15分煮る",
        "枸杞子を加えて5分煮る",
        "塩、白胡椒で味を調え、ごま油を垂らして完成"
      ],
      tcmBenefits: "山芋の補気健脾作用と白きくらげの潤肺養陰作用で、疲労回復と肺の乾燥を防ぐ。"
    }
  ];

  const [selectedRecipe, setSelectedRecipe] = useState<typeof seasonalRecipes[0] | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">二十四節気と薬膳</h1>
      
      {/* Current Season Highlight */}
      {currentSeason && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">{currentSeason.name}</h2>
              <p className="text-orange-100 mb-2">{currentSeason.period}</p>
              <p className="text-sm">{currentSeason.description}</p>
            </div>
            <div className="text-6xl opacity-80">
              <Snowflake />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-sm font-medium">推奨五行</div>
              <div className="text-lg font-bold">
                {currentSeason.recommendedElements?.join("・") || "水・火"}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-sm font-medium">重視する性味</div>
              <div className="text-lg font-bold">
                {currentSeason.recommendedNatures?.join("・") || "温性・鹹味"}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-sm font-medium">養生ポイント</div>
              <div className="text-lg font-bold">
                {currentSeason.healthFocus?.[0] || "補腎・温陽"}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-sm font-medium">注意点</div>
              <div className="text-lg font-bold">
                {currentSeason.avoidances?.[0] || "冷飲食避ける"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Calendar */}
      <Card className="shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">二十四節気カレンダー</h2>
        <SeasonalCalendar seasons={seasons} currentSeason={currentSeason} />
      </Card>

      {/* Seasonal Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Season Details */}
        <Card className="shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentSeason?.name || "立冬"}の薬膳ポイント
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">体質別アプローチ</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 陽虚体質：羊肉、生姜、桂皮で温陽</li>
                <li>• 陰虚体質：黒豆、胡麻、蓮の実で滋陰</li>
                <li>• 気虚体質：山芋、栗、棗で補気</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">調理法の注意</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• 煮込み料理や温かいスープを中心に</li>
                <li>• 生野菜や冷たい飲み物は控えめに</li>
                <li>• 辛味食材で発汗を促進</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Recommended Foods */}
        <Card className="shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <Calendar className="inline mr-2" size={18} />
            {currentSeason?.name || "立冬"}の推奨食材
          </h3>
          {seasonalIngredients && seasonalIngredients.length > 0 ? (
            <div className="space-y-4">
              {/* Group by nature */}
              {["hot", "warm", "neutral", "cool", "cold"].map(nature => {
                const ingredientsOfNature = seasonalIngredients.filter(ing => ing.nature === nature);
                if (ingredientsOfNature.length === 0) return null;
                
                const natureColors = {
                  hot: "bg-red-100 text-red-700",
                  warm: "bg-orange-100 text-orange-700",
                  neutral: "bg-gray-100 text-gray-700",
                  cool: "bg-blue-100 text-blue-700",
                  cold: "bg-cyan-100 text-cyan-700"
                };
                
                const natureLabels = {
                  hot: "熱性食材（強く体を温める）",
                  warm: "温性食材（体を温める）",
                  neutral: "平性食材（バランス）",
                  cool: "涼性食材（体を冷やす）",
                  cold: "寒性食材（強く体を冷やす）"
                };
                
                return (
                  <div key={nature}>
                    <h4 className="font-medium text-gray-700 mb-2">{natureLabels[nature]}</h4>
                    <div className="flex flex-wrap gap-2">
                      {ingredientsOfNature.slice(0, 8).map(ingredient => (
                        <Badge 
                          key={ingredient.id} 
                          className={natureColors[nature]}
                          data-testid={`badge-ingredient-${ingredient.id}`}
                        >
                          {ingredient.name}
                        </Badge>
                      ))}
                      {ingredientsOfNature.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{ingredientsOfNature.length - 8}個
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">温性食材（体を温める）</h4>
                <div className="flex flex-wrap gap-2">
                  {["羊肉", "生姜", "ニンニク", "ネギ", "唐辛子"].map(food => (
                    <Badge key={food} className="bg-red-100 text-red-700">{food}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">補腎食材（腎を強化）</h4>
                <div className="flex flex-wrap gap-2">
                  {["黒豆", "黒胡麻", "栗", "クルミ", "山芋"].map(food => (
                    <Badge key={food} className="bg-gray-100 text-gray-700">{food}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">滋陰食材（潤いを補う）</h4>
                <div className="flex flex-wrap gap-2">
                  {["白きくらげ", "蓮の実", "百合根", "豚肉"].map(food => (
                    <Badge key={food} className="bg-blue-100 text-blue-700">{food}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recipe Suggestions */}
      <Card className="mt-6 shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {currentSeason?.name || "立冬"}のおすすめレシピ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasonalRecipes.map((recipe, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">{recipe.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {recipe.cookingTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    {recipe.servings}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.properties.map((prop, propIndex) => (
                    <Badge 
                      key={propIndex}
                      className={
                        propIndex === 0 ? "bg-red-50 text-red-600" :
                        propIndex === 1 ? "bg-blue-50 text-blue-600" :
                        "bg-green-50 text-green-600"
                      }
                    >
                      {prop}
                    </Badge>
                  ))}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      data-testid={`button-recipe-${index}`}
                    >
                      <ChefHat className="mr-2" size={16} />
                      レシピを見る
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-800">
                        {recipe.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Recipe Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>調理時間: {recipe.cookingTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>分量: {recipe.servings}</span>
                        </div>
                      </div>
                      
                      {/* TCM Benefits */}
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">薬膳効果</h4>
                        <p className="text-orange-700 text-sm">{recipe.tcmBenefits}</p>
                      </div>
                      
                      {/* Properties */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">性味・効能</h4>
                        <div className="flex flex-wrap gap-2">
                          {recipe.properties.map((prop, propIndex) => (
                            <Badge 
                              key={propIndex}
                              className={
                                propIndex === 0 ? "bg-red-50 text-red-600" :
                                propIndex === 1 ? "bg-blue-50 text-blue-600" :
                                "bg-green-50 text-green-600"
                              }
                            >
                              {prop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Ingredients */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">材料</h4>
                          <ul className="space-y-1">
                            {recipe.ingredients.map((ingredient, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Instructions */}
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">作り方</h4>
                          <ol className="space-y-2">
                            {recipe.instructions.map((instruction, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex">
                                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                {instruction}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
