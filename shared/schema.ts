import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ingredients = pgTable("ingredients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  nameAlt: text("name_alt").array(), // alternative names in hiragana, katakana, and other variations
  scientificName: text("scientific_name"),
  category: text("category").notNull(), // vegetable, fruit, grain, protein, spice, herb
  
  // TCM Properties
  nature: text("nature").notNull(), // hot, warm, neutral, cool, cold
  flavor: text("flavor").array().notNull(), // sweet, sour, bitter, spicy, salty
  element: text("element").notNull(), // wood, fire, earth, metal, water
  meridians: text("meridians").array().notNull(), // liver, heart, spleen, lung, kidney, etc.
  
  // Effects and Properties
  effects: text("effects").array().notNull(),
  contraindications: text("contraindications").array(),
  
  // Nutritional Information
  nutrition: jsonb("nutrition"), // calories, vitamins, minerals per 100g
  
  // Functional Components
  functionalComponents: text("functional_components").array(), // specific bioactive compounds
  
  // Usage Information
  commonUses: text("common_uses").array(),
  preparationMethods: text("preparation_methods").array(),
  
  // Seasonal Information
  bestSeasons: text("best_seasons").array(),
  
  // Compatibility
  synergisticWith: text("synergistic_with").array(), // ingredient IDs
  conflictsWith: text("conflicts_with").array(), // ingredient IDs
  
  isActive: boolean("is_active").default(true),
});

export const seasons = pgTable("seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  period: text("period").notNull(), // e.g., "11月7日〜21日"
  description: text("description").notNull(),
  
  // TCM Recommendations
  recommendedElements: text("recommended_elements").array(),
  recommendedNatures: text("recommended_natures").array(),
  recommendedFlavors: text("recommended_flavors").array(),
  
  // Health Focus
  healthFocus: text("health_focus").array(),
  avoidances: text("avoidances").array(),
  
  // Recommended Ingredients
  recommendedIngredients: text("recommended_ingredients").array(), // ingredient IDs
  
  order: integer("order").notNull(),
});

export const combinations = pgTable("combinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ingredients: text("ingredients").array().notNull(), // ingredient IDs
  
  // Analysis Results
  yinYangBalance: integer("yin_yang_balance"), // -100 (very yin) to 100 (very yang)
  temperatureBalance: integer("temperature_balance"), // -100 (very cold) to 100 (very hot)
  flavorBalance: jsonb("flavor_balance"), // distribution of five flavors
  elementBalance: jsonb("element_balance"), // distribution of five elements
  
  // Effects and Recommendations
  effects: text("effects").array(),
  warnings: text("warnings").array(),
  suggestions: text("suggestions").array(),
  
  overallScore: integer("overall_score"), // 0-100
  
  createdAt: text("created_at").default(sql`now()`),
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  isActive: true,
});

export const insertSeasonSchema = createInsertSchema(seasons).omit({
  id: true,
});

export const insertCombinationSchema = createInsertSchema(combinations).omit({
  id: true,
  createdAt: true,
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;
export type Combination = typeof combinations.$inferSelect;
export type InsertCombination = z.infer<typeof insertCombinationSchema>;
