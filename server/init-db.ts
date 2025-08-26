import { db } from "./db";
import { ingredients, seasons } from "@shared/schema";
import { type InsertIngredient, type InsertSeason } from "@shared/schema";

// 薬膳食典ー食物性味表 完全データベース（50音順）
const ingredientsData: InsertIngredient[] = [
  // あ行
  {
    id: "aonori",
    name: "あおのり",
    nameEn: "Green Laver",
    nameAlt: ["アオノリ", "青海苔"],
    scientificName: "Enteromorpha prolifera",
    category: "seaweed",
    nature: "cold",
    flavor: ["salty"],
    element: "water",
    meridians: ["kidney", "bladder"],
    effects: ["清熱利水", "軟堅散結"],
    contraindications: ["脾胃虚寒者慎用"],
    nutrition: { calories: 164, protein: 29.4, calcium: 490, iron: 77.0 },
    commonUses: ["お好み焼き", "たこ焼き", "ふりかけ"],
    preparationMethods: ["振りかける", "混ぜる"],
    bestSeasons: ["all"],
    synergisticWith: [],
    conflictsWith: []
  },
  {
    id: "akachimaki",
    name: "あかちまき",
    nameEn: "Red Rice Cake",
    nameAlt: ["赤ちまき", "アカチマキ"],
    scientificName: "Oryza sativa",
    category: "grain",
    nature: "neutral",
    flavor: ["sweet"],
    element: "earth",
    meridians: ["spleen", "stomach"],
    effects: ["補中益気", "健脾和胃"],
    contraindications: [],
    nutrition: { calories: 168, carbohydrates: 35.6, protein: 2.5 },
    commonUses: ["節句", "祭り", "お祝い"],
    preparationMethods: ["蒸す", "茹でる"],
    bestSeasons: ["spring"],
    synergisticWith: [],
    conflictsWith: []
  },
  {
    id: "azuki",
    name: "あずき",
    nameEn: "Azuki Bean",
    nameAlt: ["小豆", "アズキ"],
    scientificName: "Vigna angularis",
    category: "legume",
    nature: "neutral",
    flavor: ["sweet"],
    element: "earth",
    meridians: ["heart", "small_intestine"],
    effects: ["利水消腫", "解毒排膿", "清熱除湿"],
    contraindications: ["陰虚者慎用"],
    nutrition: { calories: 339, protein: 20.3, fiber: 17.8, folate: 130 },
    commonUses: ["あんこ", "ぜんざい", "赤飯"],
    preparationMethods: ["煮る", "蒸す", "炊く"],
    bestSeasons: ["autumn", "winter"],
    synergisticWith: [],
    conflictsWith: []
  },
  {
    id: "amachazuru",
    name: "あまちゃづる",
    nameEn: "Jiaogulan",
    nameAlt: ["甘茶蔓", "アマチャヅル"],
    scientificName: "Gynostemma pentaphyllum",
    category: "herb",
    nature: "cool",
    flavor: ["sweet", "bitter"],
    element: "wood",
    meridians: ["lung", "spleen", "kidney"],
    effects: ["益気健脾", "化痰止咳", "清熱解毒"],
    contraindications: ["妊婦禁用"],
    nutrition: { saponins: "高含有", amino_acids: "18種類" },
    commonUses: ["茶", "健康食品"],
    preparationMethods: ["煎じる", "浸出"],
    bestSeasons: ["all"],
    synergisticWith: [],
    conflictsWith: []
  },
  {
    id: "anzu",
    name: "あんず",
    nameEn: "Apricot",
    nameAlt: ["杏", "アンズ"],
    scientificName: "Prunus armeniaca",
    category: "fruit",
    nature: "warm",
    flavor: ["sweet", "sour"],
    element: "wood",
    meridians: ["lung", "large_intestine"],
    effects: ["潤肺止咳", "生津止渴"],
    contraindications: ["多食易生熱"],
    nutrition: { calories: 36, vitaminA: 150, betaCarotene: 1800 },
    commonUses: ["生食", "ジャム", "乾燥"],
    preparationMethods: ["生食", "煮る", "乾燥"],
    bestSeasons: ["summer"],
    synergisticWith: [],
    conflictsWith: []
  },
  
  // い行
  {
    id: "ichigo",
    name: "いちご",
    nameEn: "Strawberry",
    nameAlt: ["苺", "イチゴ"],
    scientificName: "Fragaria × ananassa",
    category: "fruit",
    nature: "cool",
    flavor: ["sweet", "sour"],
    element: "fire",
    meridians: ["lung", "spleen"],
    effects: ["潤肺生津", "健脾和胃", "涼血解毒"],
    contraindications: ["脾虚泄瀉者慎用"],
    nutrition: { calories: 34, vitaminC: 62, anthocyanins: "含有" },
    commonUses: ["生食", "ジャム", "ケーキ"],
    preparationMethods: ["生食", "煮る", "冷凍"],
    bestSeasons: ["spring"],
    synergisticWith: [],
    conflictsWith: []
  },
  {
    id: "ichijiku",
    name: "いちじく",
    nameEn: "Fig",
    nameAlt: ["無花果", "イチジク"],
    scientificName: "Ficus carica",
    category: "fruit",
    nature: "cool",
    flavor: ["sweet"],
    element: "earth",
    meridians: ["lung", "stomach", "large_intestine"],
    effects: ["清熱生津", "健脾開胃", "解毒消腫"],
    contraindications: ["脾虚便溏者慎用"],
    nutrition: { calories: 54, fiber: 1.9, potassium: 170 },
    commonUses: ["生食", "ドライフルーツ", "ジャム"],
    preparationMethods: ["生食", "乾燥", "煮る"],
    bestSeasons: ["autumn"],
    synergisticWith: [],
    conflictsWith: []
  }
];

const seasonsData: InsertSeason[] = [
  {
    name: "大寒",
    nameEn: "Great Cold",
    period: "January 20 - February 3",
    description: "寒邪が最も盛んな時期。陽気を温存し、体を温める食材を中心に摂る。",
    recommendedNatures: ["warm", "hot"],
    recommendedFlavors: ["spicy", "sweet"],
    recommendedElements: ["fire", "earth"],
    healthFocus: ["温陽", "補腎"],
    avoidances: ["寒涼食物", "生冷食物"],
    recommendedIngredients: [],
    order: 24
  },
  {
    name: "立春",
    nameEn: "Beginning of Spring", 
    period: "February 4 - February 18",
    description: "春の気が立ち始める。肝の働きが活発になり、肝を養い脾胃を健やかに保つ。",
    recommendedNatures: ["neutral", "warm"],
    recommendedFlavors: ["sweet", "sour"],
    recommendedElements: ["wood", "earth"],
    healthFocus: ["疏肝", "健脾"],
    avoidances: ["過量辛辣", "油膩厚味"],
    recommendedIngredients: [],
    order: 1
  }
];

async function initializeDatabase() {
  console.log("🌱 Initializing TCM database...");
  
  try {
    // Clear existing data (optional - for fresh start)
    await db.delete(ingredients);
    await db.delete(seasons);
    
    // Insert ingredients
    console.log("📋 Inserting ingredients...");
    for (const ingredient of ingredientsData) {
      await db.insert(ingredients).values(ingredient);
    }
    
    // Insert seasons
    console.log("🌸 Inserting seasons...");
    for (const season of seasonsData) {
      await db.insert(seasons).values(season);
    }
    
    const ingredientCount = await db.select().from(ingredients);
    const seasonCount = await db.select().from(seasons);
    
    console.log(`✅ Database initialized successfully!`);
    console.log(`   - ${ingredientCount.length} ingredients`);
    console.log(`   - ${seasonCount.length} seasons`);
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log("🎉 Database initialization complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database initialization failed:", error);
      process.exit(1);
    });
}

export { initializeDatabase };