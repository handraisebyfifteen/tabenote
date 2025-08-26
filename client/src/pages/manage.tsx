import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, Upload, Plus, Edit2, Trash2, FileJson, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Ingredient } from "@shared/schema";

const ingredientFormSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  nameEn: z.string().optional(),
  scientificName: z.string().optional(),
  category: z.enum(["vegetable", "fruit", "grain", "protein", "spice", "herb"]),
  nature: z.enum(["hot", "warm", "neutral", "cool", "cold"]),
  flavor: z.array(z.enum(["sweet", "sour", "bitter", "spicy", "salty"])).min(1, "最低1つの味を選択してください"),
  element: z.enum(["wood", "fire", "earth", "metal", "water"]),
  meridians: z.array(z.string()).min(1, "最低1つの経絡を選択してください"),
  effects: z.array(z.string()).min(1, "最低1つの効能を入力してください"),
  contraindications: z.array(z.string()).optional(),
  commonUses: z.array(z.string()).optional(),
  preparationMethods: z.array(z.string()).optional(),
  bestSeasons: z.array(z.string()).optional()
});

type IngredientFormData = z.infer<typeof ingredientFormSchema>;

export default function Manage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["/api/ingredients"],
  });

  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      scientificName: "",
      category: "vegetable",
      nature: "neutral",
      flavor: [],
      element: "earth",
      meridians: [],
      effects: [],
      contraindications: [],
      commonUses: [],
      preparationMethods: [],
      bestSeasons: []
    }
  });

  const addIngredientMutation = useMutation({
    mutationFn: async (data: IngredientFormData) => {
      const response = await apiRequest("POST", "/api/ingredients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "成功",
        description: "食材が追加されました"
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "食材の追加に失敗しました",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: IngredientFormData) => {
    addIngredientMutation.mutate(data);
  };

  const exportJSON = () => {
    if (!ingredients) return;
    const dataStr = JSON.stringify(ingredients, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `tcm-ingredients-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "エクスポート完了",
      description: `${ingredients.length}件の食材データをエクスポートしました`
    });
  };

  const exportCSV = () => {
    if (!ingredients) return;
    
    const headers = ['名前', '英名', '学名', 'カテゴリ', '四性', '五味', '五行', '帰経', '効能'];
    const csvContent = [
      headers.join(','),
      ...ingredients.map((ing: Ingredient) => [
        ing.name,
        ing.nameEn || '',
        ing.scientificName || '',
        ing.category,
        ing.nature,
        ing.flavor.join('・'),
        ing.element,
        ing.meridians.join('・'),
        ing.effects.join('・')
      ].map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `tcm-ingredients-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "エクスポート完了",
      description: `${ingredients.length}件の食材データをCSV形式でエクスポートしました`
    });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate and import data
        if (Array.isArray(data)) {
          toast({
            title: "インポート処理中",
            description: `${data.length}件のデータを処理しています...`
          });
          
          // TODO: Implement bulk import API endpoint
          toast({
            title: "インポート機能",
            description: "一括インポート機能は準備中です。個別に追加機能をご利用ください。"
          });
        }
      } catch (error) {
        toast({
          title: "エラー",
          description: "ファイルの読み込みに失敗しました",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const filteredIngredients = ingredients?.filter((ing: Ingredient) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.nameEn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">食材管理</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={exportJSON}
            disabled={!ingredients?.length}
            data-testid="button-export-json"
          >
            <FileJson className="w-4 h-4 mr-2" />
            JSONエクスポート
          </Button>
          <Button 
            variant="outline"
            onClick={exportCSV}
            disabled={!ingredients?.length}
            data-testid="button-export-csv"
          >
            <FileText className="w-4 h-4 mr-2" />
            CSVエクスポート
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-add-ingredient">
                <Plus className="w-4 h-4 mr-2" />
                食材を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>新しい食材を追加</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>名前（日本語）*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="例：大根" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>英名</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="例：Daikon Radish" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="scientificName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>学名</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="例：Raphanus sativus" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>カテゴリ*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="vegetable">野菜</SelectItem>
                              <SelectItem value="fruit">果物</SelectItem>
                              <SelectItem value="grain">穀物</SelectItem>
                              <SelectItem value="protein">タンパク質</SelectItem>
                              <SelectItem value="spice">香辛料</SelectItem>
                              <SelectItem value="herb">薬草</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>四性*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="選択してください" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hot">熱性</SelectItem>
                              <SelectItem value="warm">温性</SelectItem>
                              <SelectItem value="neutral">平性</SelectItem>
                              <SelectItem value="cool">涼性</SelectItem>
                              <SelectItem value="cold">寒性</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="element"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>五行*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="wood">木</SelectItem>
                            <SelectItem value="fire">火</SelectItem>
                            <SelectItem value="earth">土</SelectItem>
                            <SelectItem value="metal">金</SelectItem>
                            <SelectItem value="water">水</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    食材を追加
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Import Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="file-import" className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              JSONファイルをインポート
            </Label>
            <input
              id="file-import"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              data-testid="input-file-import"
            />
            <span className="text-sm text-gray-600">
              JSONファイルから食材データを一括インポートできます
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-600">総食材数</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600" data-testid="stat-total-ingredients">
              {ingredients?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-600">野菜類</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {ingredients?.filter((i: Ingredient) => i.category === "vegetable").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-600">穀物類</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-orange-600">
              {ingredients?.filter((i: Ingredient) => i.category === "grain").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-600">タンパク質</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {ingredients?.filter((i: Ingredient) => i.category === "protein").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="食材名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md"
            data-testid="input-search-manage"
          />
        </CardContent>
      </Card>

      {/* Ingredients List */}
      <Card>
        <CardHeader>
          <CardTitle>登録食材一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">名前</th>
                    <th className="text-left p-2">カテゴリ</th>
                    <th className="text-left p-2">四性</th>
                    <th className="text-left p-2">五味</th>
                    <th className="text-left p-2">五行</th>
                    <th className="text-left p-2">効能</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients?.slice(0, 20).map((ingredient: Ingredient) => (
                    <tr key={ingredient.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{ingredient.name}</div>
                          {ingredient.nameEn && (
                            <div className="text-sm text-gray-500">{ingredient.nameEn}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {ingredient.category === "vegetable" && "野菜"}
                          {ingredient.category === "fruit" && "果物"}
                          {ingredient.category === "grain" && "穀物"}
                          {ingredient.category === "protein" && "タンパク質"}
                          {ingredient.category === "spice" && "香辛料"}
                          {ingredient.category === "herb" && "薬草"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={
                          ingredient.nature === "hot" ? "bg-red-100 text-red-700" :
                          ingredient.nature === "warm" ? "bg-orange-100 text-orange-700" :
                          ingredient.nature === "cool" ? "bg-blue-100 text-blue-700" :
                          ingredient.nature === "cold" ? "bg-blue-200 text-blue-800" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {ingredient.nature === "hot" && "熱性"}
                          {ingredient.nature === "warm" && "温性"}
                          {ingredient.nature === "neutral" && "平性"}
                          {ingredient.nature === "cool" && "涼性"}
                          {ingredient.nature === "cold" && "寒性"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {ingredient.flavor.map((f, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {f === "sweet" && "甘"}
                              {f === "sour" && "酸"}
                              {f === "bitter" && "苦"}
                              {f === "spicy" && "辛"}
                              {f === "salty" && "鹹"}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={
                          ingredient.element === "wood" ? "bg-green-100 text-green-700" :
                          ingredient.element === "fire" ? "bg-red-100 text-red-700" :
                          ingredient.element === "earth" ? "bg-yellow-100 text-yellow-700" :
                          ingredient.element === "metal" ? "bg-gray-100 text-gray-700" :
                          "bg-blue-100 text-blue-700"
                        }>
                          {ingredient.element === "wood" && "木"}
                          {ingredient.element === "fire" && "火"}
                          {ingredient.element === "earth" && "土"}
                          {ingredient.element === "metal" && "金"}
                          {ingredient.element === "water" && "水"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {ingredient.effects.slice(0, 2).join("、")}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIngredients && filteredIngredients.length > 20 && (
                <div className="text-center py-4 text-gray-500">
                  他{filteredIngredients.length - 20}件の食材があります
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}