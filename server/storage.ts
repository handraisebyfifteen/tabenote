import { type Ingredient, type InsertIngredient, type Season, type InsertSeason, type Combination, type InsertCombination } from "@shared/schema";
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
  
  // Combinations
  createCombination(combination: InsertCombination): Promise<Combination>;
  getCombination(id: string): Promise<Combination | undefined>;
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
      }
    ];

    ingredientsData.forEach(data => {
      const id = randomUUID();
      this.ingredients.set(id, { ...data, id, isActive: true });
    });

    // Initialize 24 seasonal periods data
    const seasonsData: InsertSeason[] = [
      {
        name: "立春",
        nameEn: "Beginning of Spring",
        period: "2月4日〜18日",
        description: "春の始まり。陽気が初めて動き出す時期。肝の働きを整え、気の流れを良くする。",
        recommendedElements: ["wood", "fire"],
        recommendedNatures: ["neutral", "slightly_warm"],
        recommendedFlavors: ["sweet", "sour"],
        healthFocus: ["疏肝理気", "養血柔肝", "健脾和胃"],
        avoidances: ["過度な辛味", "生冷食品"],
        recommendedIngredients: [],
        order: 1
      },
      {
        name: "立冬",
        nameEn: "Beginning of Winter",
        period: "11月7日〜21日",
        description: "冬の始まり。体を温め、腎の働きを補う食材を重視する時期です。",
        recommendedElements: ["water", "fire"],
        recommendedNatures: ["warm", "hot"],
        recommendedFlavors: ["salty", "sweet"],
        healthFocus: ["補腎強身", "温陽散寒", "滋陰潤燥"],
        avoidances: ["生冷食品", "過度な寒涼性食材"],
        recommendedIngredients: [],
        order: 19
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
    // For demo purposes, return "立冬" (Beginning of Winter)
    return Array.from(this.seasons.values()).find(season => season.name === "立冬");
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
