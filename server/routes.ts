import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCombinationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ingredients routes
  app.get("/api/ingredients", async (_req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/ingredients/search", async (req, res) => {
    try {
      const { q, nature, flavor, element, category } = req.query;
      const ingredients = await storage.searchIngredients(
        q as string || "",
        {
          nature: nature as string,
          flavor: flavor as string,
          element: element as string,
          category: category as string
        }
      );
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to search ingredients" });
    }
  });

  app.get("/api/ingredients/:id", async (req, res) => {
    try {
      const ingredient = await storage.getIngredient(req.params.id);
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredient" });
    }
  });

  // Seasons routes
  app.get("/api/seasons", async (_req, res) => {
    try {
      const seasons = await storage.getSeasons();
      res.json(seasons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seasons" });
    }
  });

  app.get("/api/seasons/current", async (_req, res) => {
    try {
      const currentSeason = await storage.getCurrentSeason();
      if (!currentSeason) {
        return res.status(404).json({ message: "Current season not found" });
      }
      res.json(currentSeason);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current season" });
    }
  });

  // Combinations routes
  app.post("/api/combinations", async (req, res) => {
    try {
      const validatedData = insertCombinationSchema.parse(req.body);
      
      // Calculate TCM analysis
      const ingredients = await Promise.all(
        validatedData.ingredients.map(id => storage.getIngredient(id))
      );
      
      const validIngredients = ingredients.filter(Boolean);
      
      // Simple analysis calculations
      const yinYangBalance = calculateYinYangBalance(validIngredients);
      const temperatureBalance = calculateTemperatureBalance(validIngredients);
      const flavorBalance = calculateFlavorBalance(validIngredients);
      const elementBalance = calculateElementBalance(validIngredients);
      const overallScore = calculateOverallScore(yinYangBalance, temperatureBalance, flavorBalance, elementBalance);
      
      const combinationData = {
        ...validatedData,
        yinYangBalance,
        temperatureBalance,
        flavorBalance,
        elementBalance,
        effects: generateEffects(validIngredients),
        warnings: generateWarnings(validIngredients),
        suggestions: generateSuggestions(validIngredients),
        overallScore
      };
      
      const combination = await storage.createCombination(combinationData);
      res.json(combination);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid combination data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for TCM analysis
function calculateYinYangBalance(ingredients: any[]): number {
  let balance = 0;
  ingredients.forEach(ingredient => {
    switch (ingredient.nature) {
      case "hot": balance += 40; break;
      case "warm": balance += 20; break;
      case "neutral": balance += 0; break;
      case "cool": balance -= 20; break;
      case "cold": balance -= 40; break;
    }
  });
  return Math.max(-100, Math.min(100, Math.round(balance / ingredients.length)));
}

function calculateTemperatureBalance(ingredients: any[]): number {
  return calculateYinYangBalance(ingredients); // Same calculation for simplicity
}

function calculateFlavorBalance(ingredients: any[]): object {
  const flavors = { sweet: 0, sour: 0, bitter: 0, spicy: 0, salty: 0 };
  ingredients.forEach(ingredient => {
    ingredient.flavor.forEach((flavor: string) => {
      if (flavor in flavors) {
        flavors[flavor as keyof typeof flavors]++;
      }
    });
  });
  return flavors;
}

function calculateElementBalance(ingredients: any[]): object {
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  ingredients.forEach(ingredient => {
    if (ingredient.element in elements) {
      elements[ingredient.element as keyof typeof elements]++;
    }
  });
  return elements;
}

function calculateOverallScore(yinYang: number, temperature: number, flavorBalance: any, elementBalance: any): number {
  // Simple scoring algorithm
  let score = 70; // Base score
  
  // Penalty for extreme imbalance
  if (Math.abs(yinYang) > 50) score -= 15;
  if (Math.abs(temperature) > 50) score -= 15;
  
  // Bonus for balanced flavors and elements
  const flavorCount = Object.values(flavorBalance).filter(count => count > 0).length;
  const elementCount = Object.values(elementBalance).filter(count => count > 0).length;
  
  score += flavorCount * 3;
  score += elementCount * 4;
  
  return Math.max(0, Math.min(100, score));
}

function generateEffects(ingredients: any[]): string[] {
  const effects = new Set<string>();
  ingredients.forEach(ingredient => {
    ingredient.effects.forEach((effect: string) => effects.add(effect));
  });
  return Array.from(effects).slice(0, 5); // Limit to 5 effects
}

function generateWarnings(ingredients: any[]): string[] {
  const warnings: string[] = [];
  const natures = ingredients.map(i => i.nature);
  
  if (natures.filter(n => n === "cold" || n === "cool").length > natures.length * 0.7) {
    warnings.push("冷え性の方は温性食材を追加することを推奨");
  }
  
  if (natures.filter(n => n === "hot" || n === "warm").length > natures.length * 0.7) {
    warnings.push("熱性体質の方は涼性食材を追加することを推奨");
  }
  
  return warnings;
}

function generateSuggestions(ingredients: any[]): string[] {
  const suggestions: string[] = [];
  const elements = ingredients.map(i => i.element);
  
  if (!elements.includes("water")) {
    suggestions.push("水の要素（黒豆、昆布など）を追加してバランス改善");
  }
  
  if (!elements.includes("fire")) {
    suggestions.push("火の要素（トマト、赤唐辛子など）を追加して活力向上");
  }
  
  return suggestions;
}
