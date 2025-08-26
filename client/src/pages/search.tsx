import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon } from "lucide-react";
import IngredientCard from "@/components/ingredient-card";
import type { Ingredient } from "@shared/schema";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    nature: "",
    flavor: "",
    element: "",
    category: ""
  });

  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients/search", { 
      q: searchQuery, 
      ...filters 
    }],
    enabled: true,
  });

  const handleSearch = () => {
    // Search is handled reactively by the query
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">食材検索・データベース</h1>
      
      {/* Search Interface */}
      <Card className="shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="食材名で検索 (例: 大根, にんじん)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search-ingredients"
            />
          </div>
          <Button 
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-search"
          >
            <SearchIcon className="w-4 h-4 mr-2" />
            検索
          </Button>
        </div>
        
        {/* Filter Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">四性</label>
            <Select value={filters.nature} onValueChange={(value) => setFilters({...filters, nature: value})}>
              <SelectTrigger data-testid="select-nature">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                <SelectItem value="hot">熱性</SelectItem>
                <SelectItem value="warm">温性</SelectItem>
                <SelectItem value="neutral">平性</SelectItem>
                <SelectItem value="cool">涼性</SelectItem>
                <SelectItem value="cold">寒性</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">五味</label>
            <Select value={filters.flavor} onValueChange={(value) => setFilters({...filters, flavor: value})}>
              <SelectTrigger data-testid="select-flavor">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                <SelectItem value="sweet">甘味</SelectItem>
                <SelectItem value="sour">酸味</SelectItem>
                <SelectItem value="bitter">苦味</SelectItem>
                <SelectItem value="spicy">辛味</SelectItem>
                <SelectItem value="salty">鹹味</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">五行</label>
            <Select value={filters.element} onValueChange={(value) => setFilters({...filters, element: value})}>
              <SelectTrigger data-testid="select-element">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                <SelectItem value="wood">木</SelectItem>
                <SelectItem value="fire">火</SelectItem>
                <SelectItem value="earth">土</SelectItem>
                <SelectItem value="metal">金</SelectItem>
                <SelectItem value="water">水</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                <SelectItem value="vegetable">野菜</SelectItem>
                <SelectItem value="fruit">果物</SelectItem>
                <SelectItem value="grain">穀物</SelectItem>
                <SelectItem value="protein">タンパク質</SelectItem>
                <SelectItem value="spice">香辛料</SelectItem>
                <SelectItem value="herb">薬草</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">検索中...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="search-results">
          {ingredients?.map((ingredient: Ingredient) => (
            <IngredientCard key={ingredient.id} ingredient={ingredient} />
          ))}
          {ingredients?.length === 0 && (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-500">該当する食材が見つかりませんでした。</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
