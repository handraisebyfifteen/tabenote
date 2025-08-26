import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  User, 
  Calendar, 
  Utensils,
  CheckCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { 
  TCM_ELEMENTS, 
  TCM_NATURES, 
  TCM_FLAVORS, 
  TCM_MERIDIANS, 
  COMBINATION_PRINCIPLES,
  BODY_CONSTITUTIONS
} from "@/lib/tcm-data";

export default function Education() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses = [
    {
      id: "basic-theory",
      title: "中医基礎理論",
      level: "初級",
      levelColor: "bg-green-100 text-green-700",
      description: "陰陽学説、五行学説、気血津液の基本概念を学習",
      chapters: 6,
      duration: "約2時間",
      progress: 30,
      icon: Book
    },
    {
      id: "food-classification", 
      title: "食物性味分類",
      level: "中級",
      levelColor: "bg-blue-100 text-blue-700",
      description: "四性五味の理論と食材の分類方法を詳しく学習",
      chapters: 8,
      duration: "約3時間", 
      progress: 60,
      icon: Utensils
    },
    {
      id: "pattern-identification",
      title: "弁証施膳",
      level: "上級", 
      levelColor: "bg-purple-100 text-purple-700",
      description: "体質診断に基づく薬膳の実践的な組み立て方",
      chapters: 10,
      duration: "約4時間",
      progress: 10,
      icon: User
    }
  ];

  const theoryReferences = [
    {
      title: "陰陽学説",
      description: "万物を陰と陽の対立統一として捉える基本理論。食材も陰性・陽性に分類され、体質や季節に応じてバランスを取ることが重要。",
      color: "border-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "五行学説", 
      description: "木・火・土・金・水の5つの要素による相互関係論。臓腑や味覚、感情なども五行に対応して分類される。",
      color: "border-green-500",
      textColor: "text-green-600"
    },
    {
      title: "気血津液学説",
      description: "人体の生命活動を支える基本物質。気は機能、血は栄養、津液は体液を表し、これらのバランスが健康の鍵。",
      color: "border-orange-500", 
      textColor: "text-orange-600"
    }
  ];

  const practicalGuides = [
    {
      title: "体質チェック",
      description: "簡単な質問に答えて自分の体質タイプを診断",
      icon: User,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      action: "診断を始める"
    },
    {
      title: "週間薬膳プラン",
      description: "季節と体質に合わせた1週間の食事プランを作成", 
      icon: Calendar,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600", 
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      action: "プラン作成"
    },
    {
      title: "レシピ集",
      description: "症状別・体質別の薬膳レシピ集",
      icon: Utensils,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      buttonColor: "bg-purple-600 hover:bg-purple-700", 
      action: "レシピを見る"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">薬膳学習資料</h1>
      
      {/* Learning Path */}
      <Card className="shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">学習コース</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Card 
                key={course.id}
                className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCourse(course.id)}
                data-testid={`course-card-${course.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">{course.title}</h3>
                    <Badge className={course.levelColor}>{course.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      {course.chapters}章・{course.duration}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{course.progress}%</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    size="sm"
                    data-testid={`button-start-course-${course.id}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {course.progress > 0 ? "続きから学習" : "学習開始"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Reference Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Theory Reference */}
        <Card className="shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">理論参考資料</h3>
          <div className="space-y-4">
            {theoryReferences.map((theory, index) => (
              <div key={index} className={`border-l-4 ${theory.color} pl-4`}>
                <h4 className="font-medium text-gray-800">{theory.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{theory.description}</p>
                <Button 
                  variant="link" 
                  className={`${theory.textColor} text-sm p-0 h-auto mt-2`}
                  data-testid={`button-read-theory-${index}`}
                >
                  詳細を読む
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Practical Guides */}
        <Card className="shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">実践ガイド</h3>
          <div className="space-y-4">
            {practicalGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <div key={index} className={`p-4 ${guide.bgColor} rounded-lg`}>
                  <h4 className={`font-medium mb-2 ${guide.iconColor}`}>
                    <Icon className="w-5 h-5 mr-2 inline" />
                    {guide.title}
                  </h4>
                  <p className={`text-sm mb-3 ${guide.iconColor}`}>{guide.description}</p>
                  <Button 
                    className={`${guide.buttonColor} text-white`}
                    size="sm"
                    data-testid={`button-guide-${index}`}
                  >
                    {guide.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick Reference Cards */}
      <Card className="shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">クイックリファレンス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Four Natures Reference */}
          <Card className="border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 text-center">四性分類</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(TCM_NATURES).map(([key, nature]) => (
                <div key={key} className="flex justify-between">
                  <span className={nature.color.includes('red') ? 'text-red-600' : 
                                  nature.color.includes('orange') ? 'text-orange-600' :
                                  nature.color.includes('blue') ? 'text-blue-600' : 'text-gray-600'}>
                    {nature.label}:
                  </span>
                  <span className="text-gray-600 text-xs">{nature.description}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Five Flavors Reference */}
          <Card className="border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 text-center">五味効能</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(TCM_FLAVORS).map(([key, flavor]) => (
                <div key={key} className="flex justify-between">
                  <span className={flavor.color.includes('yellow') ? 'text-yellow-600' :
                                  flavor.color.includes('green') ? 'text-green-600' :
                                  flavor.color.includes('orange') ? 'text-orange-600' :
                                  flavor.color.includes('red') ? 'text-red-600' : 'text-blue-600'}>
                    {flavor.label}:
                  </span>
                  <span className="text-gray-600 text-xs">{flavor.effect}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Five Elements Reference */}
          <Card className="border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 text-center">五行臓腑</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(TCM_ELEMENTS).map(([key, element]) => (
                <div key={key} className="flex justify-between">
                  <span className={element.textColor}>
                    {element.label}・{element.organ}:
                  </span>
                  <span className="text-gray-600 text-xs">{element.season}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Combination Principles Reference */}
          <Card className="border border-gray-200 p-4">
            <h4 className="font-medium text-gray-800 mb-3 text-center">配伍原則</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(COMBINATION_PRINCIPLES).map(([key, principle]) => (
                <div key={key} className="flex justify-between">
                  <span className={principle.color.includes('green') ? 'text-green-600' :
                                  principle.color.includes('blue') ? 'text-blue-600' :
                                  principle.color.includes('orange') ? 'text-orange-600' :
                                  'text-red-600'}>
                    {principle.name}:
                  </span>
                  <span className="text-gray-600 text-xs">{principle.description}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Card>

      {/* Constitution Types */}
      <Card className="mt-6 shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">体質分類と対応</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(BODY_CONSTITUTIONS).map(([key, constitution]) => (
            <Card key={key} className="border border-gray-200 p-4">
              <h4 className="font-medium text-gray-800 mb-2">{constitution.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{constitution.description}</p>
              
              <div className="mb-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">特徴:</h5>
                <div className="flex flex-wrap gap-1">
                  {constitution.characteristics.slice(0, 3).map((char, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-1">対応:</h5>
                <div className="flex flex-wrap gap-1">
                  {constitution.recommendations.slice(0, 2).map((rec, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-700 text-xs">
                      {rec}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {courses.find(c => c.id === selectedCourse)?.title}
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedCourse(null)}
                  data-testid="button-close-course-detail"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <Info className="w-4 h-4 inline mr-2" />
                    学習内容
                  </h4>
                  <p className="text-sm text-blue-700">
                    詳細な学習カリキュラムと進捗管理機能を提供します。
                    実際の実装では、各章の詳細な内容、演習問題、
                    進捗追跡機能などが含まれます。
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    data-testid="button-start-learning"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    学習を開始
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCourse(null)}
                    data-testid="button-cancel-course"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
