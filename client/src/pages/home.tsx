import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Search, 
  Moon, 
  Plus, 
  Calendar,
  Carrot,
  Leaf,
  Flame
} from "lucide-react";

export default function Home() {
  const { data: currentSeason } = useQuery({
    queryKey: ["/api/seasons/current"],
  });

  const { data: ingredients } = useQuery({
    queryKey: ["/api/ingredients"],
  });

  const stats = {
    totalIngredients: ingredients?.length || 0,
    seasonalRecommendations: 24,
    combinations: 156,
    patterns: 89,
  };

  const todayRecommendations = [
    {
      name: "大根",
      property: "涼性・甘辛味",
      benefit: "肺を潤す・消化促進",
      icon: Carrot,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      textColor: "text-orange-600"
    },
    {
      name: "白菜",
      property: "涼性・甘味", 
      benefit: "清熱・解毒",
      icon: Leaf,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-600"
    },
    {
      name: "生姜",
      property: "温性・辛味",
      benefit: "温中・散寒",
      icon: Flame,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-600"
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">薬膳コンビネーター</h1>
        <p className="text-green-100">中医食養学に基づく食材組み合わせアプリ</p>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 shadow-sm border">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-green-600" data-testid="stat-ingredients">
                {stats.totalIngredients}
              </div>
              <div className="text-sm text-gray-600">登録食材数</div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-sm border">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-orange-600" data-testid="stat-seasons">
                {stats.seasonalRecommendations}
              </div>
              <div className="text-sm text-gray-600">節気別推奨</div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-sm border">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-blue-600" data-testid="stat-combinations">
                {stats.combinations}
              </div>
              <div className="text-sm text-gray-600">組み合わせ例</div>
            </CardContent>
          </Card>
          <Card className="p-4 shadow-sm border">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-purple-600" data-testid="stat-patterns">
                {stats.patterns}
              </div>
              <div className="text-sm text-gray-600">弁証パターン</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Recommendations */}
        <Card className="shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 text-green-600 mr-2" />
              今日の推奨食材
              {currentSeason && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({currentSeason.name} - {currentSeason.period})
                </span>
              )}
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {todayRecommendations.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className={`flex items-center p-4 ${item.bgColor} rounded-lg`}>
                    <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mr-4`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.property}</div>
                      <div className={`text-xs ${item.textColor}`}>{item.benefit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/search">
            <Card className="p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">食材を検索</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  名前や性味から食材を検索して詳細な薬膳情報を確認
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/elements">
            <Card className="p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Moon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">五行相関図</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  五行学説に基づく食材の相関関係を視覚的に確認
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/combination">
            <Card className="p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800">組み合わせ診断</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  選択した食材の組み合わせを薬膳理論に基づいて評価
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
