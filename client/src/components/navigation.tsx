import { Link, useLocation } from "wouter";
import { 
  Home, 
  Search, 
  Moon, 
  Calendar, 
  Plus, 
  Book 
} from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "ホーム", icon: Home, id: "home" },
    { path: "/search", label: "検索", icon: Search, id: "search" },
    { path: "/elements", label: "五行", icon: Moon, id: "elements" },
    { path: "/seasons", label: "節気", icon: Calendar, id: "seasons" },
    { path: "/combination", label: "組み合わせ", icon: Plus, id: "combination" },
    { path: "/education", label: "学習", icon: Book, id: "education" },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden">
        <nav className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive(item.path)
                    ? "text-green-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                data-testid={`nav-mobile-${item.id}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 w-64 h-full bg-white shadow-lg border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">薬膳コンビネーター</h1>
          <p className="text-sm text-gray-600 mt-1">中医食養学アプリ</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`flex items-center px-6 py-3 transition-colors ${
                  isActive(item.path)
                    ? "text-green-600 bg-green-50 border-r-3 border-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                data-testid={`nav-desktop-${item.id}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label === "学習" && item.id === "education" ? "学習資料" : item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
