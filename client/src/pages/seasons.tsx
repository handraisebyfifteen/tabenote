import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SeasonalCalendar from "@/components/seasonal-calendar";
import { Snowflake, Calendar } from "lucide-react";

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
      properties: ["温性", "補腎", "消食"]
    },
    {
      name: "黒豆と胡桃の甘煮", 
      description: "腎を補い、脳の働きを活性化するデザート",
      properties: ["平性", "補腎", "健脳"]
    },
    {
      name: "山芋と白きくらげのスープ",
      description: "気を補い肺を潤す滋養スープ", 
      properties: ["平性", "補気", "潤肺"]
    }
  ];

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
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  data-testid={`button-recipe-${index}`}
                >
                  レシピを見る
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
