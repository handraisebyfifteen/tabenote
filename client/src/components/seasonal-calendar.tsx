import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Sun, 
  Wheat, 
  Snowflake,
  CloudRain,
  Bug,
  Sprout
} from "lucide-react";
import type { Season } from "@shared/schema";

interface SeasonalCalendarProps {
  seasons?: Season[];
  currentSeason?: Season;
}

export default function SeasonalCalendar({ seasons, currentSeason }: SeasonalCalendarProps) {
  // Default seasonal data for display
  const defaultSeasons = [
    { id: "1", name: "立春", period: "2/4〜18", icon: Sprout, color: "border-green-200 hover:bg-green-50" },
    { id: "2", name: "雨水", period: "2/19〜3/5", icon: CloudRain, color: "border-green-200 hover:bg-green-50" },
    { id: "3", name: "啓蟄", period: "3/6〜20", icon: Bug, color: "border-green-200 hover:bg-green-50" },
    { id: "4", name: "立夏", period: "5/5〜20", icon: Sun, color: "border-red-200 hover:bg-red-50" },
    { id: "5", name: "小満", period: "5/21〜6/5", icon: Wheat, color: "border-red-200 hover:bg-red-50" },
    { id: "6", name: "立秋", period: "8/7〜22", icon: Leaf, color: "border-orange-200 hover:bg-orange-50" },
    { id: "7", name: "立冬", period: "11/7〜21", icon: Snowflake, color: "border-blue-200 hover:bg-blue-50" },
    { id: "8", name: "小雪", period: "11/22〜12/6", icon: Snowflake, color: "border-blue-200 hover:bg-blue-50" },
  ];

  const displaySeasons = seasons?.length ? seasons : defaultSeasons;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" data-testid="seasonal-calendar">
      {displaySeasons.map((season: any) => {
        const Icon = season.icon || Leaf;
        const isCurrentSeason = currentSeason?.name === season.name;
        
        return (
          <div
            key={season.id}
            className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
              isCurrentSeason ? "bg-blue-50 border-blue-200" : season.color || "border-gray-200 hover:bg-gray-50"
            }`}
            data-testid={`season-card-${season.id}`}
          >
            <div className="text-center">
              <div className={`font-bold text-sm ${
                isCurrentSeason ? "text-blue-600" : 
                season.color?.includes('green') ? "text-green-600" :
                season.color?.includes('red') ? "text-red-600" :
                season.color?.includes('orange') ? "text-orange-600" :
                "text-blue-600"
              }`}>
                {season.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {season.period}
              </div>
              <div className={`w-8 h-8 rounded-full mx-auto mt-2 flex items-center justify-center ${
                isCurrentSeason ? "bg-blue-100" :
                season.color?.includes('green') ? "bg-green-100" :
                season.color?.includes('red') ? "bg-red-100" :
                season.color?.includes('orange') ? "bg-orange-100" :
                "bg-blue-100"
              }`}>
                <Icon className={`w-4 h-4 ${
                  isCurrentSeason ? "text-blue-600" :
                  season.color?.includes('green') ? "text-green-600" :
                  season.color?.includes('red') ? "text-red-600" :
                  season.color?.includes('orange') ? "text-orange-600" :
                  "text-blue-600"
                }`} />
              </div>
              {isCurrentSeason && (
                <div className="text-xs text-blue-600 font-medium mt-1">現在</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
