import { type Ingredient, type InsertIngredient, type Season, type InsertSeason, type Combination, type InsertCombination } from "@shared/schema";
import { db } from "./db";
import { ingredients, seasons, combinations } from "@shared/schema";
import { eq, like, or, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: string): Promise<Ingredient | undefined>;
  searchIngredients(query: string, filters?: { 
    nature?: string; 
    flavor?: string; 
    element?: string; 
    category?: string 
  }): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  
  // Seasons
  getSeasons(): Promise<Season[]>;
  getSeason(id: string): Promise<Season | undefined>;
  getCurrentSeason(): Promise<Season | undefined>;
  getSeasonalIngredients(season: Season): Promise<Ingredient[]>;
  
  // Combinations
  createCombination(combination: InsertCombination): Promise<Combination>;
  getCombination(id: string): Promise<Combination | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients);
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    const [ingredient] = await db.select().from(ingredients).where(eq(ingredients.id, id));
    return ingredient || undefined;
  }

  async searchIngredients(query: string, filters?: { nature?: string; flavor?: string; element?: string; category?: string }): Promise<Ingredient[]> {
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          like(ingredients.name, `%${query}%`),
          like(ingredients.nameEn, `%${query}%`)
        )
      );
    }
    
    if (filters?.nature) {
      conditions.push(eq(ingredients.nature, filters.nature));
    }
    
    if (filters?.element) {
      conditions.push(eq(ingredients.element, filters.element));
    }
    
    if (filters?.category) {
      conditions.push(eq(ingredients.category, filters.category));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return await db.select().from(ingredients).where(whereClause);
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const [newIngredient] = await db.insert(ingredients).values(ingredient).returning();
    return newIngredient;
  }

  async getSeasons(): Promise<Season[]> {
    return await db.select().from(seasons);
  }

  async getSeason(id: string): Promise<Season | undefined> {
    const [season] = await db.select().from(seasons).where(eq(seasons.id, id));
    return season || undefined;
  }

  async getCurrentSeason(): Promise<Season | undefined> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    
    // Calculate which season we're currently in based on date
    // This is a simplified calculation - in practice you'd want more precise dates
    const seasonRanges = [
      { name: "大寒", start: { month: 1, day: 20 }, end: { month: 2, day: 3 } },
      { name: "立春", start: { month: 2, day: 4 }, end: { month: 2, day: 18 } },
      { name: "雨水", start: { month: 2, day: 19 }, end: { month: 3, day: 5 } },
      { name: "啓蟄", start: { month: 3, day: 6 }, end: { month: 3, day: 20 } },
      { name: "春分", start: { month: 3, day: 21 }, end: { month: 4, day: 4 } },
      { name: "清明", start: { month: 4, day: 5 }, end: { month: 4, day: 19 } },
      { name: "穀雨", start: { month: 4, day: 20 }, end: { month: 5, day: 4 } },
      { name: "立夏", start: { month: 5, day: 5 }, end: { month: 5, day: 20 } },
      { name: "小満", start: { month: 5, day: 21 }, end: { month: 6, day: 5 } },
      { name: "芒種", start: { month: 6, day: 6 }, end: { month: 6, day: 20 } },
      { name: "夏至", start: { month: 6, day: 21 }, end: { month: 7, day: 6 } },
      { name: "小暑", start: { month: 7, day: 7 }, end: { month: 7, day: 22 } },
      { name: "大暑", start: { month: 7, day: 23 }, end: { month: 8, day: 6 } },
      { name: "立秋", start: { month: 8, day: 7 }, end: { month: 8, day: 22 } },
      { name: "処暑", start: { month: 8, day: 23 }, end: { month: 9, day: 7 } },
      { name: "白露", start: { month: 9, day: 8 }, end: { month: 9, day: 22 } },
      { name: "秋分", start: { month: 9, day: 23 }, end: { month: 10, day: 7 } },
      { name: "寒露", start: { month: 10, day: 8 }, end: { month: 10, day: 22 } },
      { name: "霜降", start: { month: 10, day: 23 }, end: { month: 11, day: 6 } },
      { name: "立冬", start: { month: 11, day: 7 }, end: { month: 11, day: 21 } },
      { name: "小雪", start: { month: 11, day: 22 }, end: { month: 12, day: 6 } },
      { name: "大雪", start: { month: 12, day: 7 }, end: { month: 12, day: 21 } },
      { name: "冬至", start: { month: 12, day: 22 }, end: { month: 12, day: 31 } },
      { name: "冬至", start: { month: 1, day: 1 }, end: { month: 1, day: 5 } },
      { name: "小寒", start: { month: 1, day: 6 }, end: { month: 1, day: 19 } }
    ];
    
    const currentSeason = seasonRanges.find(range => {
      const isInRange = (month === range.start.month && day >= range.start.day) || 
                       (month === range.end.month && day <= range.end.day) ||
                       (month > range.start.month && month < range.end.month);
      return isInRange;
    });
    
    if (currentSeason) {
      const [season] = await db.select().from(seasons).where(eq(seasons.name, currentSeason.name));
      return season || undefined;
    }
    
    // Fallback to first season if calculation fails
    const [season] = await db.select().from(seasons).limit(1);
    return season || undefined;
  }

  async getSeasonalIngredients(season: Season): Promise<Ingredient[]> {
    const allIngredients = await this.getIngredients();
    
    // Filter ingredients based on season's recommendations
    return allIngredients.filter(ingredient => {
      // Check if ingredient's element matches season's recommended elements
      const elementMatch = season.recommendedElements?.includes(ingredient.element) || false;
      
      // Check if ingredient's nature matches season's recommended natures
      const natureMatch = season.recommendedNatures?.includes(ingredient.nature) || false;
      
      // Check if any of ingredient's flavors match season's recommended flavors
      const flavorMatch = season.recommendedFlavors?.some(flavor => 
        ingredient.flavor.includes(flavor)
      ) || false;
      
      // Check if ingredient is specifically recommended for this season
      const seasonMatch = ingredient.bestSeasons?.includes(season.name) || 
                         ingredient.bestSeasons?.includes("all") || false;
      
      // Return ingredient if it matches any of the criteria
      return elementMatch || natureMatch || flavorMatch || seasonMatch;
    }).sort((a, b) => {
      // Sort by relevance: season-specific > element match > nature match > flavor match
      const aSeasonMatch = a.bestSeasons?.includes(season.name) ? 4 : 0;
      const aElementMatch = season.recommendedElements?.includes(a.element) ? 3 : 0;
      const aNatureMatch = season.recommendedNatures?.includes(a.nature) ? 2 : 0;
      const aFlavorMatch = season.recommendedFlavors?.some(f => a.flavor.includes(f)) ? 1 : 0;
      
      const bSeasonMatch = b.bestSeasons?.includes(season.name) ? 4 : 0;
      const bElementMatch = season.recommendedElements?.includes(b.element) ? 3 : 0;
      const bNatureMatch = season.recommendedNatures?.includes(b.nature) ? 2 : 0;
      const bFlavorMatch = season.recommendedFlavors?.some(f => b.flavor.includes(f)) ? 1 : 0;
      
      const aScore = aSeasonMatch + aElementMatch + aNatureMatch + aFlavorMatch;
      const bScore = bSeasonMatch + bElementMatch + bNatureMatch + bFlavorMatch;
      
      return bScore - aScore; // Sort by relevance score (highest first)
    });
  }

  async createCombination(combination: InsertCombination): Promise<Combination> {
    const [newCombination] = await db.insert(combinations).values(combination).returning();
    return newCombination;
  }

  async getCombination(id: string): Promise<Combination | undefined> {
    const [combination] = await db.select().from(combinations).where(eq(combinations.id, id));
    return combination || undefined;
  }
}

export class MemStorage implements IStorage {
  private ingredients: Map<string, Ingredient>;
  private seasons: Map<string, Season>;
  private combinations: Map<string, Combination>;

  constructor() {
    this.ingredients = new Map();
    this.seasons = new Map();
    this.combinations = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize with comprehensive TCM ingredient data
    const ingredientsData: InsertIngredient[] = [
      // 野菜類（Vegetables）
      {
        name: "大根",
        nameEn: "Daikon Radish",
        scientificName: "Raphanus sativus",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet", "spicy"],
        element: "metal",
        meridians: ["lung", "stomach"],
        effects: ["清熱解毒", "消食化痰", "利尿通便"],
        contraindications: ["脾胃虚寒者慎用"],
        nutrition: { calories: 18, vitaminC: 12, fiber: 1.4 },
        commonUses: ["煮物", "サラダ", "おろし"],
        preparationMethods: ["生食", "煮込み", "蒸し"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "人参",
        nameEn: "Carrot",
        scientificName: "Daucus carota",
        category: "vegetable",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "liver"],
        effects: ["健脾消食", "補肝明目", "清熱解毒"],
        contraindications: [],
        nutrition: { calories: 39, vitaminA: 835, betaCarotene: 8285 },
        commonUses: ["炒め物", "煮物", "ジュース"],
        preparationMethods: ["生食", "炒める", "煮る"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "トマト",
        nameEn: "Tomato",
        scientificName: "Solanum lycopersicum",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet", "sour"],
        element: "fire",
        meridians: ["liver", "stomach"],
        effects: ["清熱解毒", "生津止渴", "健胃消食"],
        contraindications: ["脾胃虚寒者少食"],
        nutrition: { calories: 19, vitaminC: 15, lycopene: 3025 },
        commonUses: ["サラダ", "スープ", "ソース"],
        preparationMethods: ["生食", "煮る", "焼く"],
        bestSeasons: ["summer"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "きゅうり",
        nameEn: "Cucumber",
        scientificName: "Cucumis sativus",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "water",
        meridians: ["stomach", "bladder"],
        effects: ["清熱利水", "解毒消腫"],
        contraindications: ["脾胃虚寒者慎用"],
        nutrition: { calories: 14, vitaminK: 16.4, water: 95.2 },
        commonUses: ["サラダ", "漬物", "和え物"],
        preparationMethods: ["生食", "塩もみ", "漬ける"],
        bestSeasons: ["summer"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "なす",
        nameEn: "Eggplant",
        scientificName: "Solanum melongena",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "water",
        meridians: ["spleen", "stomach", "large_intestine"],
        effects: ["清熱活血", "消腫止痛"],
        contraindications: ["脾胃虚寒者、妊婦慎用"],
        nutrition: { calories: 22, potassium: 220, nasunin: "含有" },
        commonUses: ["炒め物", "煮物", "揚げ物"],
        preparationMethods: ["炒める", "煮る", "揚げる"],
        bestSeasons: ["summer", "autumn"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "かぼちゃ",
        nameEn: "Pumpkin",
        scientificName: "Cucurbita maxima",
        category: "vegetable",
        nature: "warm",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["補中益気", "健脾利水"],
        contraindications: ["気滞湿阻者慎用"],
        nutrition: { calories: 49, vitaminA: 330, betaCarotene: 3900 },
        commonUses: ["煮物", "スープ", "デザート"],
        preparationMethods: ["煮る", "蒸す", "焼く"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "ほうれん草",
        nameEn: "Spinach",
        scientificName: "Spinacia oleracea",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "wood",
        meridians: ["liver", "stomach", "large_intestine"],
        effects: ["養血止血", "潤燥滑腸"],
        contraindications: ["結石患者慎用"],
        nutrition: { calories: 20, iron: 2.0, folate: 210 },
        commonUses: ["お浸し", "炒め物", "和え物"],
        preparationMethods: ["茹でる", "炒める", "和える"],
        bestSeasons: ["winter", "spring"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 香辛料・薬味類（Spices & Herbs）
      {
        name: "生姜",
        nameEn: "Ginger",
        scientificName: "Zingiber officinale",
        category: "spice",
        nature: "warm",
        flavor: ["spicy"],
        element: "fire",
        meridians: ["lung", "spleen", "stomach"],
        effects: ["温中散寒", "回陽通脈", "温肺化飲"],
        contraindications: ["陰虚火旺者忌用"],
        nutrition: { calories: 80, gingerol: "高含有", vitaminB6: 0.16 },
        commonUses: ["調味料", "薬味", "茶"],
        preparationMethods: ["生食", "煮出し", "炒め"],
        bestSeasons: ["autumn", "winter", "spring"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "にんにく",
        nameEn: "Garlic",
        scientificName: "Allium sativum",
        category: "spice",
        nature: "warm",
        flavor: ["spicy"],
        element: "metal",
        meridians: ["spleen", "stomach", "lung"],
        effects: ["温中健胃", "解毒殺虫", "行気消積"],
        contraindications: ["陰虚火旺者、眼疾患者忌用"],
        nutrition: { calories: 134, allicin: "含有", vitaminB6: 1.235 },
        commonUses: ["調味料", "炒め物", "薬味"],
        preparationMethods: ["生食", "炒める", "すりおろし"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "ネギ",
        nameEn: "Green Onion",
        scientificName: "Allium fistulosum",
        category: "spice",
        nature: "warm",
        flavor: ["spicy"],
        element: "metal",
        meridians: ["lung", "stomach"],
        effects: ["発汗解表", "通陽活血", "解毒消腫"],
        contraindications: ["表虚多汗者慎用"],
        nutrition: { calories: 28, vitaminC: 11, alliin: "含有" },
        commonUses: ["薬味", "鍋物", "炒め物"],
        preparationMethods: ["生食", "炒める", "煮る"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "シナモン",
        nameEn: "Cinnamon",
        scientificName: "Cinnamomum verum",
        category: "spice",
        nature: "hot",
        flavor: ["sweet", "spicy"],
        element: "fire",
        meridians: ["kidney", "spleen", "heart", "liver"],
        effects: ["補火助陽", "散寒止痛", "温経通脈"],
        contraindications: ["陰虚火旺、出血傾向者忌用"],
        nutrition: { calories: 247, manganese: 17.466, cinnamaldehyde: "含有" },
        commonUses: ["デザート", "飲み物", "薬膳茶"],
        preparationMethods: ["粉末", "煎じる", "香り付け"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 葉菜類
      {
        name: "白菜",
        nameEn: "Chinese Cabbage",
        scientificName: "Brassica rapa",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["stomach", "large_intestine"],
        effects: ["清熱除煩", "解渴利尿", "通利腸胃"],
        contraindications: ["脾胃虚寒、腹泻者不宜"],
        nutrition: { calories: 13, folate: 61, potassium: 220 },
        commonUses: ["鍋物", "炒め物", "漬物"],
        preparationMethods: ["生食", "煮込み", "炒め"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "レタス",
        nameEn: "Lettuce",
        scientificName: "Lactuca sativa",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet", "bitter"],
        element: "water",
        meridians: ["stomach", "large_intestine"],
        effects: ["清熱利尿", "通乳"],
        contraindications: ["脾胃虚寒者少食"],
        nutrition: { calories: 12, vitaminK: 29, folate: 73 },
        commonUses: ["サラダ", "炒め物", "スープ"],
        preparationMethods: ["生食", "炒める", "茹でる"],
        bestSeasons: ["spring", "summer"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "小松菜",
        nameEn: "Komatsuna",
        scientificName: "Brassica rapa var. perviridis",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "wood",
        meridians: ["liver", "stomach"],
        effects: ["清熱除煩", "利水消腫"],
        contraindications: ["脾虚便溏者慎用"],
        nutrition: { calories: 14, calcium: 170, iron: 2.8 },
        commonUses: ["お浸し", "炒め物", "味噌汁"],
        preparationMethods: ["茹でる", "炒める", "和える"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 穀物・豆類（Grains & Legumes）
      {
        name: "米",
        nameEn: "Rice",
        scientificName: "Oryza sativa",
        category: "grain",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["補中益気", "健脾和胃", "除煩止渴"],
        contraindications: [],
        nutrition: { calories: 356, carbohydrate: 77.1, protein: 6.1 },
        commonUses: ["主食", "お粥", "餅"],
        preparationMethods: ["炊く", "蒸す", "炒める"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "小豆",
        nameEn: "Azuki Bean",
        scientificName: "Vigna angularis",
        category: "grain",
        nature: "neutral",
        flavor: ["sweet", "sour"],
        element: "fire",
        meridians: ["heart", "small_intestine"],
        effects: ["利水消腫", "解毒排膿", "健脾利湿"],
        contraindications: ["陰虚津少者慎用"],
        nutrition: { calories: 339, protein: 20.3, fiber: 17.8 },
        commonUses: ["あんこ", "お汁粉", "赤飯"],
        preparationMethods: ["煮る", "蒸す", "炊く"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "黒豆",
        nameEn: "Black Soybean",
        scientificName: "Glycine max",
        category: "grain",
        nature: "neutral",
        flavor: ["sweet"],
        element: "water",
        meridians: ["kidney", "spleen"],
        effects: ["補腎強身", "活血利水", "解毒"],
        contraindications: ["消化不良者注意"],
        nutrition: { calories: 339, protein: 36, anthocyanin: "高含有" },
        commonUses: ["煮豆", "茶", "粉末"],
        preparationMethods: ["煮込み", "焙煎", "発酵"],
        bestSeasons: ["winter", "spring"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "大豆",
        nameEn: "Soybean",
        scientificName: "Glycine max",
        category: "grain",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["健脾寛中", "潤燥消水"],
        contraindications: ["消化不良者適量"],
        nutrition: { calories: 417, protein: 35.3, isoflavone: "含有" },
        commonUses: ["豆腐", "納豆", "味噌"],
        preparationMethods: ["煮る", "発酵", "加工"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "緑豆",
        nameEn: "Mung Bean",
        scientificName: "Vigna radiata",
        category: "grain",
        nature: "cool",
        flavor: ["sweet"],
        element: "wood",
        meridians: ["heart", "stomach"],
        effects: ["清熱解毒", "消暑利水"],
        contraindications: ["脾胃虚寒者慎用"],
        nutrition: { calories: 347, protein: 23.9, fiber: 16.3 },
        commonUses: ["もやし", "春雨", "デザート"],
        preparationMethods: ["発芽", "煮る", "製粉"],
        bestSeasons: ["summer"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 根菜類
      {
        name: "山芋",
        nameEn: "Chinese Yam",
        scientificName: "Dioscorea opposita",
        category: "vegetable",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "lung", "kidney"],
        effects: ["補脾養胃", "生津益肺", "補腎澀精"],
        contraindications: ["湿盛中満者慎用"],
        nutrition: { calories: 118, diosgenin: "含有", mucilage: "豊富" },
        commonUses: ["とろろ", "煮物", "お好み焼き"],
        preparationMethods: ["生食", "煮込み", "蒸し"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "里芋",
        nameEn: "Taro",
        scientificName: "Colocasia esculenta",
        category: "vegetable",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["stomach", "large_intestine"],
        effects: ["益胃健脾", "調補中気", "解毒消腫"],
        contraindications: ["皮膚アレルギー者注意"],
        nutrition: { calories: 58, potassium: 640, mucin: "含有" },
        commonUses: ["煮物", "汁物", "田楽"],
        preparationMethods: ["煮る", "蒸す", "揚げる"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "蓮根",
        nameEn: "Lotus Root",
        scientificName: "Nelumbo nucifera",
        category: "vegetable",
        nature: "cool",
        flavor: ["sweet"],
        element: "metal",
        meridians: ["heart", "spleen", "stomach"],
        effects: ["清熱生津", "涼血止血", "健脾開胃"],
        contraindications: ["脾虚胃寒者慎用"],
        nutrition: { calories: 66, vitaminC: 48, fiber: 2.0 },
        commonUses: ["煮物", "きんぴら", "天ぷら"],
        preparationMethods: ["煮る", "炒める", "揚げる"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "ごぼう",
        nameEn: "Burdock Root",
        scientificName: "Arctium lappa",
        category: "vegetable",
        nature: "cool",
        flavor: ["bitter", "spicy"],
        element: "metal",
        meridians: ["lung", "stomach"],
        effects: ["疏散風熱", "解毒消腫", "潤腸通便"],
        contraindications: ["脾虚便溏者慎用"],
        nutrition: { calories: 65, fiber: 5.7, inulin: "含有" },
        commonUses: ["きんぴら", "煮物", "サラダ"],
        preparationMethods: ["炒める", "煮る", "茹でる"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // きのこ類（Mushrooms）
      {
        name: "椎茸",
        nameEn: "Shiitake Mushroom",
        scientificName: "Lentinula edodes",
        category: "herb",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["stomach"],
        effects: ["益気健脾", "化痰理気", "扶正固本"],
        contraindications: [],
        nutrition: { calories: 19, vitaminD: 2.1, lentinan: "含有" },
        commonUses: ["煮物", "炒め物", "出汁"],
        preparationMethods: ["煮る", "炒める", "干す"],
        bestSeasons: ["autumn", "spring"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "白きくらげ",
        nameEn: "White Wood Ear",
        scientificName: "Tremella fuciformis",
        category: "herb",
        nature: "neutral",
        flavor: ["sweet"],
        element: "water",
        meridians: ["lung", "stomach"],
        effects: ["滋陰潤肺", "養胃生津", "補脳強心"],
        contraindications: ["外感風寒者不宜"],
        nutrition: { calories: 19, collagen: "豊富", vitaminD: "含有" },
        commonUses: ["スープ", "デザート", "炒め物"],
        preparationMethods: ["水戻し後調理", "煮込み", "蒸し"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "黒きくらげ",
        nameEn: "Black Wood Ear",
        scientificName: "Auricularia auricula",
        category: "herb",
        nature: "neutral",
        flavor: ["sweet"],
        element: "water",
        meridians: ["stomach", "large_intestine"],
        effects: ["涼血止血", "潤肺止咳", "養陰潤燥"],
        contraindications: ["脾虚便溏者慎用"],
        nutrition: { calories: 13, iron: 10.5, fiber: 7.0 },
        commonUses: ["炒め物", "スープ", "サラダ"],
        preparationMethods: ["水戻し", "炒める", "煮る"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 果物類（Fruits）
      {
        name: "りんご",
        nameEn: "Apple",
        scientificName: "Malus domestica",
        category: "fruit",
        nature: "cool",
        flavor: ["sweet", "sour"],
        element: "wood",
        meridians: ["heart", "lung", "stomach"],
        effects: ["生津潤肺", "除煩解渴", "健脾益胃"],
        contraindications: ["脾虚便溏者少食"],
        nutrition: { calories: 54, fiber: 2.4, pectin: "含有" },
        commonUses: ["生食", "ジュース", "コンポート"],
        preparationMethods: ["生食", "煮る", "焼く"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "梨",
        nameEn: "Pear",
        scientificName: "Pyrus pyrifolia",
        category: "fruit",
        nature: "cool",
        flavor: ["sweet"],
        element: "metal",
        meridians: ["lung", "stomach"],
        effects: ["生津潤燥", "清熱化痰", "潤肺止咳"],
        contraindications: ["脾胃虚寒、便溏者慎用"],
        nutrition: { calories: 43, potassium: 140, sorbitol: "含有" },
        commonUses: ["生食", "コンポート", "ジュース"],
        preparationMethods: ["生食", "煮る", "蒸す"],
        bestSeasons: ["autumn"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "柿",
        nameEn: "Persimmon",
        scientificName: "Diospyros kaki",
        category: "fruit",
        nature: "cold",
        flavor: ["sweet"],
        element: "metal",
        meridians: ["heart", "lung", "large_intestine"],
        effects: ["清熱潤肺", "生津止渴", "健脾化痰"],
        contraindications: ["脾胃虚寒、糖尿病者慎用"],
        nutrition: { calories: 60, vitaminC: 70, tannin: "含有" },
        commonUses: ["生食", "干し柿", "柿酢"],
        preparationMethods: ["生食", "干す", "発酵"],
        bestSeasons: ["autumn"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "みかん",
        nameEn: "Mandarin Orange",
        scientificName: "Citrus unshiu",
        category: "fruit",
        nature: "cool",
        flavor: ["sweet", "sour"],
        element: "wood",
        meridians: ["lung", "stomach"],
        effects: ["潤肺化痰", "生津止渴", "和胃降逆"],
        contraindications: ["風寒咳嗽者慎用"],
        nutrition: { calories: 45, vitaminC: 32, hesperidin: "含有" },
        commonUses: ["生食", "ジュース", "陳皮"],
        preparationMethods: ["生食", "搾る", "皮を干す"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "バナナ",
        nameEn: "Banana",
        scientificName: "Musa acuminata",
        category: "fruit",
        nature: "cold",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["lung", "large_intestine"],
        effects: ["清熱潤腸", "解毒通便"],
        contraindications: ["脾胃虚寒、腎病者慎用"],
        nutrition: { calories: 86, potassium: 358, tryptophan: "含有" },
        commonUses: ["生食", "スムージー", "お菓子"],
        preparationMethods: ["生食", "焼く", "凍らせる"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 海産物（Seafood）
      {
        name: "昆布",
        nameEn: "Kelp",
        scientificName: "Saccharina japonica",
        category: "herb",
        nature: "cold",
        flavor: ["salty"],
        element: "water",
        meridians: ["liver", "stomach", "kidney"],
        effects: ["軟堅散結", "消痰利水", "清熱化痰"],
        contraindications: ["脾胃虚寒、甲状腺疾患者注意"],
        nutrition: { calories: 43, iodine: 2400, alginic_acid: "含有" },
        commonUses: ["出汁", "煮物", "サラダ"],
        preparationMethods: ["煮る", "戻す", "炒める"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "わかめ",
        nameEn: "Wakame",
        scientificName: "Undaria pinnatifida",
        category: "herb",
        nature: "cool",
        flavor: ["salty"],
        element: "water",
        meridians: ["liver", "kidney"],
        effects: ["清熱化痰", "軟堅散結", "利水消腫"],
        contraindications: ["脾胃虚寒者少食"],
        nutrition: { calories: 16, calcium: 100, fucoidan: "含有" },
        commonUses: ["味噌汁", "サラダ", "酢の物"],
        preparationMethods: ["戻す", "茹でる", "和える"],
        bestSeasons: ["spring"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // ナッツ・種実類（Nuts & Seeds）
      {
        name: "くるみ",
        nameEn: "Walnut",
        scientificName: "Juglans regia",
        category: "grain",
        nature: "warm",
        flavor: ["sweet"],
        element: "water",
        meridians: ["kidney", "lung", "large_intestine"],
        effects: ["補腎温肺", "潤腸通便", "健脳益智"],
        contraindications: ["痰熱咳嗽、陰虚火旺者慎用"],
        nutrition: { calories: 674, omega3: 9.08, vitaminE: 1.2 },
        commonUses: ["おつまみ", "お菓子", "料理"],
        preparationMethods: ["生食", "焙煎", "粉砕"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "栗",
        nameEn: "Chestnut",
        scientificName: "Castanea crenata",
        category: "grain",
        nature: "warm",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach", "kidney"],
        effects: ["養胃健脾", "補腎強筋", "活血止血"],
        contraindications: ["消化不良者少食"],
        nutrition: { calories: 164, vitaminC: 33, potassium: 420 },
        commonUses: ["栗ご飯", "甘露煮", "焼き栗"],
        preparationMethods: ["茹でる", "焼く", "蒸す"],
        bestSeasons: ["autumn"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "黒ごま",
        nameEn: "Black Sesame",
        scientificName: "Sesamum indicum",
        category: "grain",
        nature: "neutral",
        flavor: ["sweet"],
        element: "water",
        meridians: ["liver", "kidney"],
        effects: ["補肝腎", "益精血", "潤腸燥"],
        contraindications: ["便溏者慎用"],
        nutrition: { calories: 578, calcium: 1200, sesamin: "含有" },
        commonUses: ["ふりかけ", "和え物", "デザート"],
        preparationMethods: ["炒る", "すりつぶす", "練る"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 肉類・タンパク質源（Protein）
      {
        name: "鶏肉",
        nameEn: "Chicken",
        scientificName: "Gallus gallus domesticus",
        category: "protein",
        nature: "warm",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["温中益気", "補精添髄", "強筋骨"],
        contraindications: ["感冒発熱時慎用"],
        nutrition: { calories: 200, protein: 20.0, vitaminB6: 0.32 },
        commonUses: ["唐揚げ", "煮物", "スープ"],
        preparationMethods: ["焼く", "煮る", "蒸す"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "豚肉",
        nameEn: "Pork",
        scientificName: "Sus scrofa domesticus",
        category: "protein",
        nature: "neutral",
        flavor: ["sweet", "salty"],
        element: "water",
        meridians: ["spleen", "stomach", "kidney"],
        effects: ["補腎養血", "滋陰潤燥", "益気"],
        contraindications: ["湿熱痰滞者少食"],
        nutrition: { calories: 216, protein: 19.3, vitaminB1: 0.69 },
        commonUses: ["炒め物", "煮物", "とんかつ"],
        preparationMethods: ["焼く", "煮る", "揚げる"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "牛肉",
        nameEn: "Beef",
        scientificName: "Bos taurus",
        category: "protein",
        nature: "warm",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["補脾胃", "益気血", "強筋骨"],
        contraindications: ["熱病、皮膚病者慎用"],
        nutrition: { calories: 259, protein: 17.1, iron: 2.0 },
        commonUses: ["ステーキ", "煮込み", "すき焼き"],
        preparationMethods: ["焼く", "煮る", "炒める"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "羊肉",
        nameEn: "Lamb",
        scientificName: "Ovis aries",
        category: "protein",
        nature: "hot",
        flavor: ["sweet"],
        element: "fire",
        meridians: ["spleen", "kidney"],
        effects: ["補虚温中", "補腎壮陽", "益気補血"],
        contraindications: ["陰虚火旺、熱病者忌用"],
        nutrition: { calories: 227, protein: 18.0, carnitine: "高含有" },
        commonUses: ["ジンギスカン", "煮込み", "串焼き"],
        preparationMethods: ["焼く", "煮る", "蒸す"],
        bestSeasons: ["winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "卵",
        nameEn: "Egg",
        scientificName: "Gallus gallus domesticus",
        category: "protein",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["heart", "kidney"],
        effects: ["滋陰潤燥", "養血息風", "安神"],
        contraindications: ["高コレステロール者適量"],
        nutrition: { calories: 151, protein: 12.6, choline: "含有" },
        commonUses: ["目玉焼き", "茹で卵", "オムレツ"],
        preparationMethods: ["焼く", "茹でる", "蒸す"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "豆腐",
        nameEn: "Tofu",
        scientificName: "Glycine max",
        category: "protein",
        nature: "cool",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["spleen", "stomach", "large_intestine"],
        effects: ["益気和中", "生津潤燥", "清熱解毒"],
        contraindications: ["脾虚便溏者少食"],
        nutrition: { calories: 76, protein: 8.0, isoflavone: "含有" },
        commonUses: ["味噌汁", "冷奴", "麻婆豆腐"],
        preparationMethods: ["煮る", "焼く", "揚げる"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 魚介類（Fish）
      {
        name: "鮭",
        nameEn: "Salmon",
        scientificName: "Oncorhynchus keta",
        category: "protein",
        nature: "warm",
        flavor: ["sweet"],
        element: "water",
        meridians: ["spleen", "stomach"],
        effects: ["補虚労", "健脾胃", "温中下気"],
        contraindications: ["皮膚病者慎用"],
        nutrition: { calories: 133, protein: 22.3, omega3: "高含有" },
        commonUses: ["塩焼き", "刺身", "ムニエル"],
        preparationMethods: ["焼く", "生食", "蒸す"],
        bestSeasons: ["autumn"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "鯖",
        nameEn: "Mackerel",
        scientificName: "Scomber japonicus",
        category: "protein",
        nature: "neutral",
        flavor: ["sweet"],
        element: "water",
        meridians: ["stomach", "kidney"],
        effects: ["滋補強壮", "補虚益気"],
        contraindications: ["アレルギー体質者注意"],
        nutrition: { calories: 202, protein: 20.7, DHA: "高含有" },
        commonUses: ["塩焼き", "味噌煮", "〆鯖"],
        preparationMethods: ["焼く", "煮る", "酢〆"],
        bestSeasons: ["autumn", "winter"],
        synergisticWith: [],
        conflictsWith: []
      },
      
      // 調味料・その他
      {
        name: "蜂蜜",
        nameEn: "Honey",
        scientificName: "Apis mellifera",
        category: "spice",
        nature: "neutral",
        flavor: ["sweet"],
        element: "earth",
        meridians: ["lung", "spleen", "large_intestine"],
        effects: ["補中益気", "潤肺止咳", "潤腸通便"],
        contraindications: ["1歳未満児、糖尿病者注意"],
        nutrition: { calories: 294, fructose: 38.2, glucose: 31.0 },
        commonUses: ["甘味料", "薬膳茶", "料理"],
        preparationMethods: ["そのまま", "溶かす", "混ぜる"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "味噌",
        nameEn: "Miso",
        scientificName: "Glycine max",
        category: "spice",
        nature: "warm",
        flavor: ["salty", "sweet"],
        element: "earth",
        meridians: ["spleen", "stomach"],
        effects: ["健脾胃", "解毒", "補中益気"],
        contraindications: ["高血圧者適量"],
        nutrition: { calories: 217, protein: 12.5, probiotics: "含有" },
        commonUses: ["味噌汁", "味噌煮", "調味料"],
        preparationMethods: ["溶かす", "煮る", "和える"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "醤油",
        nameEn: "Soy Sauce",
        scientificName: "Glycine max",
        category: "spice",
        nature: "cold",
        flavor: ["salty"],
        element: "water",
        meridians: ["stomach", "spleen", "kidney"],
        effects: ["清熱解毒", "除煩"],
        contraindications: ["高血圧者少量"],
        nutrition: { calories: 60, sodium: 5493, amino_acids: "含有" },
        commonUses: ["調味料", "煮物", "刺身"],
        preparationMethods: ["調味", "煮る", "漬ける"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      },
      {
        name: "酢",
        nameEn: "Vinegar",
        scientificName: "Acetobacter",
        category: "spice",
        nature: "warm",
        flavor: ["sour", "bitter"],
        element: "wood",
        meridians: ["liver", "stomach"],
        effects: ["散瘀止血", "解毒殺虫", "開胃"],
        contraindications: ["胃潰瘍者慎用"],
        nutrition: { calories: 25, acetic_acid: "4-8%" },
        commonUses: ["酢の物", "ドレッシング", "寿司"],
        preparationMethods: ["和える", "漬ける", "調味"],
        bestSeasons: ["all"],
        synergisticWith: [],
        conflictsWith: []
      }
    ];

    ingredientsData.forEach(data => {
      const id = randomUUID();
      this.ingredients.set(id, { ...data, id, isActive: true });
    });

    // Initialize complete 24 seasonal periods data (二十四節気)
    const seasonsData: InsertSeason[] = [
      {
        name: "立春", nameEn: "Beginning of Spring", period: "2月4日〜18日",
        description: "春の始まり。陽気が初めて動き出す時期。肝の働きを整え、気の流れを良くする。",
        recommendedElements: ["wood", "fire"], recommendedNatures: ["neutral", "warm"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["疏肝理気", "養血柔肝", "健脾和胃"],
        avoidances: ["過度な辛味", "生冷食品"], recommendedIngredients: [], order: 1
      },
      {
        name: "雨水", nameEn: "Rain Water", period: "2月19日〜3月5日",
        description: "雪から雨に変わる時期。脾胃を健やかにし、湿気対策を重視。",
        recommendedElements: ["earth", "wood"], recommendedNatures: ["neutral", "warm"],
        recommendedFlavors: ["sweet", "bitter"], healthFocus: ["健脾除湿", "理気和胃", "養肝血"],
        avoidances: ["過度な甘味", "湿気の多い食材"], recommendedIngredients: [], order: 2
      },
      {
        name: "啓蟄", nameEn: "Awakening of Insects", period: "3月6日〜20日",
        description: "虫が目覚める時期。肝気が上昇しやすいので、穏やかに肝を養う。",
        recommendedElements: ["wood", "earth"], recommendedNatures: ["neutral", "cool"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["養肝血", "清肝火", "健脾胃"],
        avoidances: ["辛辣食品", "過度な飲酒"], recommendedIngredients: [], order: 3
      },
      {
        name: "春分", nameEn: "Spring Equinox", period: "3月21日〜4月4日",
        description: "昼夜が等しくなる。陰陽のバランスを重視し、調和のとれた食事を。",
        recommendedElements: ["wood", "earth"], recommendedNatures: ["neutral"],
        recommendedFlavors: ["sweet", "bland"], healthFocus: ["調和陰陽", "養肝脾", "清心安神"],
        avoidances: ["極端な性味", "過食"], recommendedIngredients: [], order: 4
      },
      {
        name: "清明", nameEn: "Clear and Bright", period: "4月5日〜19日",
        description: "清らかで明るい時期。肝の疏泄機能を助け、気血の流れを促進。",
        recommendedElements: ["wood", "fire"], recommendedNatures: ["neutral", "cool"],
        recommendedFlavors: ["sweet", "bitter"], healthFocus: ["疏肝理気", "清熱涼血", "健脾益気"],
        avoidances: ["発物食材", "過度な補養"], recommendedIngredients: [], order: 5
      },
      {
        name: "穀雨", nameEn: "Grain Rain", period: "4月20日〜5月4日",
        description: "春の最後の節気。脾胃を調え、夏への準備を整える。",
        recommendedElements: ["earth", "wood"], recommendedNatures: ["neutral", "cool"],
        recommendedFlavors: ["sweet", "bitter"], healthFocus: ["健脾和胃", "清肝瀉火", "養陰潤燥"],
        avoidances: ["温燥食材", "厚味食品"], recommendedIngredients: [], order: 6
      },
      {
        name: "立夏", nameEn: "Beginning of Summer", period: "5月5日〜20日",
        description: "夏の始まり。心の働きを養い、暑熱に備える。",
        recommendedElements: ["fire", "earth"], recommendedNatures: ["cool", "neutral"],
        recommendedFlavors: ["bitter", "sweet"], healthFocus: ["養心安神", "清熱解暑", "健脾化湿"],
        avoidances: ["過度な寒涼", "厚膩食品"], recommendedIngredients: [], order: 7
      },
      {
        name: "小満", nameEn: "Grain Buds", period: "5月21日〜6月5日",
        description: "麦の穂が実り始める時期。湿邪を防ぎ、心火を清める。",
        recommendedElements: ["fire", "earth"], recommendedNatures: ["cool", "neutral"],
        recommendedFlavors: ["bitter", "bland"], healthFocus: ["清心火", "利水渗湿", "健脾和胃"],
        avoidances: ["膩滞食品", "辛辣刺激"], recommendedIngredients: [], order: 8
      },
      {
        name: "芒種", nameEn: "Grain in Ear", period: "6月6日〜20日",
        description: "麦の収穫時期。湿熱を除き、心神を安定させる。",
        recommendedElements: ["fire", "earth"], recommendedNatures: ["cool"],
        recommendedFlavors: ["bitter", "sweet"], healthFocus: ["清熱利湿", "養心安神", "健脾開胃"],
        avoidances: ["熱性食材", "過度な甘味"], recommendedIngredients: [], order: 9
      },
      {
        name: "夏至", nameEn: "Summer Solstice", period: "6月21日〜7月6日",
        description: "一年で最も昼が長い時期。陽気が最盛なので、涼性食材で調和を図る。",
        recommendedElements: ["fire", "water"], recommendedNatures: ["cool", "cold"],
        recommendedFlavors: ["bitter", "salty"], healthFocus: ["清熱解暑", "養陰生津", "清心安神"],
        avoidances: ["温熱食材", "辛辣刺激"], recommendedIngredients: [], order: 10
      },
      {
        name: "小暑", nameEn: "Slight Heat", period: "7月7日〜22日",
        description: "暑さが本格化する時期。清熱と化湿を重視。",
        recommendedElements: ["fire", "earth"], recommendedNatures: ["cool", "cold"],
        recommendedFlavors: ["bitter", "sweet"], healthFocus: ["清熱解暑", "化湿健脾", "生津止渇"],
        avoidances: ["温燥食材", "厚膩食品"], recommendedIngredients: [], order: 11
      },
      {
        name: "大暑", nameEn: "Great Heat", period: "7月23日〜8月6日",
        description: "一年で最も暑い時期。涼性食材で体を冷ましつつ、脾胃を保護。",
        recommendedElements: ["water", "earth"], recommendedNatures: ["cool", "cold"],
        recommendedFlavors: ["bitter", "sweet"], healthFocus: ["清熱瀉火", "健脾化湿", "生津潤燥"],
        avoidances: ["熱性食材", "肥甘厚味"], recommendedIngredients: [], order: 12
      },
      {
        name: "立秋", nameEn: "Beginning of Autumn", period: "8月7日〜22日",
        description: "秋の始まり。肺を潤し、燥邪から身を守る。",
        recommendedElements: ["metal", "earth"], recommendedNatures: ["neutral", "cool"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["潤肺養陰", "收斂固脱", "健脾益気"],
        avoidances: ["辛辣燥烈", "過度な発散"], recommendedIngredients: [], order: 13
      },
      {
        name: "処暑", nameEn: "Stopping the Heat", period: "8月23日〜9月7日",
        description: "暑さが和らぐ時期。秋燥に備え、肺陰を養う。",
        recommendedElements: ["metal", "water"], recommendedNatures: ["neutral", "cool"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["養陰潤肺", "清残熱", "健脾和胃"],
        avoidances: ["辛燥食材", "冷飲過度"], recommendedIngredients: [], order: 14
      },
      {
        name: "白露", nameEn: "White Dew", period: "9月8日〜22日",
        description: "露が白く見える時期。肺を潤し、腎気を収斂させる。",
        recommendedElements: ["metal", "water"], recommendedNatures: ["neutral", "warm"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["潤肺防燥", "收斂腎気", "養胃生津"],
        avoidances: ["辛辣食品", "過度な涼性"], recommendedIngredients: [], order: 15
      },
      {
        name: "秋分", nameEn: "Autumn Equinox", period: "9月23日〜10月7日",
        description: "昼夜が等しくなる。燥邪を防ぎ、陰陽の調和を図る。",
        recommendedElements: ["metal", "earth"], recommendedNatures: ["neutral"],
        recommendedFlavors: ["sweet", "sour"], healthFocus: ["調和陰陽", "潤燥養陰", "健脾益肺"],
        avoidances: ["極端な性味", "過燥食材"], recommendedIngredients: [], order: 16
      },
      {
        name: "寒露", nameEn: "Cold Dew", period: "10月8日〜22日",
        description: "露が冷たくなる時期。腎気を収斂し、温養を始める。",
        recommendedElements: ["metal", "water"], recommendedNatures: ["neutral", "warm"],
        recommendedFlavors: ["sweet", "salty"], healthFocus: ["滋陰潤燥", "收斂腎気", "温養脾胃"],
        avoidances: ["辛散食材", "過度な寒涼"], recommendedIngredients: [], order: 17
      },
      {
        name: "霜降", nameEn: "Frost's Descent", period: "10月23日〜11月6日",
        description: "霜が降りる時期。腎陽を温養し、冬への準備を整える。",
        recommendedElements: ["metal", "water"], recommendedNatures: ["warm", "neutral"],
        recommendedFlavors: ["sweet", "salty"], healthFocus: ["溫養腎陽", "潤肺防燥", "健脾益氣"],
        avoidances: ["寒涼食材", "辛散過度"], recommendedIngredients: [], order: 18
      },
      {
        name: "立冬", nameEn: "Beginning of Winter", period: "11月7日〜21日",
        description: "冬の始まり。腎陽を補い、精気を蓄える時期。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "sweet"], healthFocus: ["補腎強身", "温陽散寒", "滋陰潤燥"],
        avoidances: ["生冷食品", "過度な寒涼"], recommendedIngredients: [], order: 19
      },
      {
        name: "小雪", nameEn: "Slight Snow", period: "11月22日〜12月6日",
        description: "雪が降り始める時期。腎陽を温補し、寒邪を防ぐ。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "sweet"], healthFocus: ["溫補腎陽", "禦寒保暖", "滋養精血"],
        avoidances: ["生冷瓜果", "寒涼飲食"], recommendedIngredients: [], order: 20
      },
      {
        name: "大雪", nameEn: "Great Snow", period: "12月7日〜21日",
        description: "大雪の時期。陽気を蓄え、腎精を養う。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "bitter"], healthFocus: ["蔵精納氣", "溫陽補腎", "滋陰降火"],
        avoidances: ["寒涼生冷", "辛辣燥烈"], recommendedIngredients: [], order: 21
      },
      {
        name: "冬至", nameEn: "Winter Solstice", period: "12月22日〜1月5日",
        description: "一年で最も夜が長い時期。陽気が生まれ始める重要な節気。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "neutral"],
        recommendedFlavors: ["salty", "sweet"], healthFocus: ["一陽初生", "補腎益精", "溫中散寒"],
        avoidances: ["過度な補養", "辛辣刺激"], recommendedIngredients: [], order: 22
      },
      {
        name: "小寒", nameEn: "Slight Cold", period: "1月6日〜19日",
        description: "寒さが本格化する時期。腎陽を温補し、精気を保護。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "sweet"], healthFocus: ["溫補腎陽", "固精保暖", "健脾益氣"],
        avoidances: ["生冷食物", "過度な發散"], recommendedIngredients: [], order: 23
      },
      {
        name: "大寒", nameEn: "Great Cold", period: "1月20日〜2月3日",
        description: "一年で最も寒い時期。温養を重視し、春への準備を整える。",
        recommendedElements: ["water", "fire"], recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "sweet"], healthFocus: ["溫陽散寒", "補腎益精", "調養脾胃"],
        avoidances: ["寒涼性質", "過分發散"], recommendedIngredients: [], order: 24
      }
    ];

    seasonsData.forEach(data => {
      const id = randomUUID();
      this.seasons.set(id, { ...data, id });
    });
  }

  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values()).filter(ingredient => ingredient.isActive);
  }

  async getIngredient(id: string): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async searchIngredients(query: string, filters?: { 
    nature?: string; 
    flavor?: string; 
    element?: string; 
    category?: string 
  }): Promise<Ingredient[]> {
    const ingredients = Array.from(this.ingredients.values()).filter(ingredient => ingredient.isActive);
    
    let filtered = ingredients;
    
    if (query) {
      filtered = filtered.filter(ingredient => 
        ingredient.name.toLowerCase().includes(query.toLowerCase()) ||
        ingredient.nameEn?.toLowerCase().includes(query.toLowerCase()) ||
        ingredient.scientificName?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (filters?.nature) {
      filtered = filtered.filter(ingredient => ingredient.nature === filters.nature);
    }
    
    if (filters?.flavor) {
      filtered = filtered.filter(ingredient => ingredient.flavor.includes(filters.flavor));
    }
    
    if (filters?.element) {
      filtered = filtered.filter(ingredient => ingredient.element === filters.element);
    }
    
    if (filters?.category) {
      filtered = filtered.filter(ingredient => ingredient.category === filters.category);
    }
    
    return filtered;
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const id = randomUUID();
    const newIngredient: Ingredient = { ...ingredient, id, isActive: true };
    this.ingredients.set(id, newIngredient);
    return newIngredient;
  }

  async getSeasons(): Promise<Season[]> {
    return Array.from(this.seasons.values()).sort((a, b) => a.order - b.order);
  }

  async getSeason(id: string): Promise<Season | undefined> {
    return this.seasons.get(id);
  }

  async getCurrentSeason(): Promise<Season | undefined> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    
    // Calculate which season we're currently in based on date
    const seasonRanges = [
      { name: "大寒", start: { month: 1, day: 20 }, end: { month: 2, day: 3 } },
      { name: "立春", start: { month: 2, day: 4 }, end: { month: 2, day: 18 } },
      { name: "雨水", start: { month: 2, day: 19 }, end: { month: 3, day: 5 } },
      { name: "啓蟄", start: { month: 3, day: 6 }, end: { month: 3, day: 20 } },
      { name: "春分", start: { month: 3, day: 21 }, end: { month: 4, day: 4 } },
      { name: "清明", start: { month: 4, day: 5 }, end: { month: 4, day: 19 } },
      { name: "穀雨", start: { month: 4, day: 20 }, end: { month: 5, day: 4 } },
      { name: "立夏", start: { month: 5, day: 5 }, end: { month: 5, day: 20 } },
      { name: "小満", start: { month: 5, day: 21 }, end: { month: 6, day: 5 } },
      { name: "芒種", start: { month: 6, day: 6 }, end: { month: 6, day: 20 } },
      { name: "夏至", start: { month: 6, day: 21 }, end: { month: 7, day: 6 } },
      { name: "小暑", start: { month: 7, day: 7 }, end: { month: 7, day: 22 } },
      { name: "大暑", start: { month: 7, day: 23 }, end: { month: 8, day: 6 } },
      { name: "立秋", start: { month: 8, day: 7 }, end: { month: 8, day: 22 } },
      { name: "処暑", start: { month: 8, day: 23 }, end: { month: 9, day: 7 } },
      { name: "白露", start: { month: 9, day: 8 }, end: { month: 9, day: 22 } },
      { name: "秋分", start: { month: 9, day: 23 }, end: { month: 10, day: 7 } },
      { name: "寒露", start: { month: 10, day: 8 }, end: { month: 10, day: 22 } },
      { name: "霜降", start: { month: 10, day: 23 }, end: { month: 11, day: 6 } },
      { name: "立冬", start: { month: 11, day: 7 }, end: { month: 11, day: 21 } },
      { name: "小雪", start: { month: 11, day: 22 }, end: { month: 12, day: 6 } },
      { name: "大雪", start: { month: 12, day: 7 }, end: { month: 12, day: 21 } },
      { name: "冬至", start: { month: 12, day: 22 }, end: { month: 12, day: 31 } },
      { name: "冬至", start: { month: 1, day: 1 }, end: { month: 1, day: 5 } },
      { name: "小寒", start: { month: 1, day: 6 }, end: { month: 1, day: 19 } }
    ];
    
    const currentSeason = seasonRanges.find(range => {
      const isInRange = (month === range.start.month && day >= range.start.day) || 
                       (month === range.end.month && day <= range.end.day) ||
                       (month > range.start.month && month < range.end.month);
      return isInRange;
    });
    
    if (currentSeason) {
      return Array.from(this.seasons.values()).find(season => season.name === currentSeason.name);
    }
    
    // Fallback to first season if calculation fails
    return Array.from(this.seasons.values()).sort((a, b) => a.order - b.order)[0];
  }

  async getSeasonalIngredients(season: Season): Promise<Ingredient[]> {
    const allIngredients = await this.getIngredients();
    
    // Filter ingredients based on season's recommendations
    return allIngredients.filter(ingredient => {
      // Check if ingredient's element matches season's recommended elements
      const elementMatch = season.recommendedElements?.includes(ingredient.element) || false;
      
      // Check if ingredient's nature matches season's recommended natures
      const natureMatch = season.recommendedNatures?.includes(ingredient.nature) || false;
      
      // Check if any of ingredient's flavors match season's recommended flavors
      const flavorMatch = season.recommendedFlavors?.some(flavor => 
        ingredient.flavor.includes(flavor)
      ) || false;
      
      // Check if ingredient is specifically recommended for this season
      const seasonMatch = ingredient.bestSeasons?.includes(season.name) || 
                         ingredient.bestSeasons?.includes("all") || false;
      
      // Return ingredient if it matches any of the criteria
      return elementMatch || natureMatch || flavorMatch || seasonMatch;
    }).sort((a, b) => {
      // Sort by relevance: season-specific > element match > nature match > flavor match
      const aSeasonMatch = a.bestSeasons?.includes(season.name) ? 4 : 0;
      const aElementMatch = season.recommendedElements?.includes(a.element) ? 3 : 0;
      const aNatureMatch = season.recommendedNatures?.includes(a.nature) ? 2 : 0;
      const aFlavorMatch = season.recommendedFlavors?.some(f => a.flavor.includes(f)) ? 1 : 0;
      
      const bSeasonMatch = b.bestSeasons?.includes(season.name) ? 4 : 0;
      const bElementMatch = season.recommendedElements?.includes(b.element) ? 3 : 0;
      const bNatureMatch = season.recommendedNatures?.includes(b.nature) ? 2 : 0;
      const bFlavorMatch = season.recommendedFlavors?.some(f => b.flavor.includes(f)) ? 1 : 0;
      
      const aScore = aSeasonMatch + aElementMatch + aNatureMatch + aFlavorMatch;
      const bScore = bSeasonMatch + bElementMatch + bNatureMatch + bFlavorMatch;
      
      return bScore - aScore; // Sort by relevance score (highest first)
    });
  }

  async createCombination(combination: InsertCombination): Promise<Combination> {
    const id = randomUUID();
    const newCombination: Combination = { 
      ...combination, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.combinations.set(id, newCombination);
    return newCombination;
  }

  async getCombination(id: string): Promise<Combination | undefined> {
    return this.combinations.get(id);
  }
}

export const storage = new MemStorage();
