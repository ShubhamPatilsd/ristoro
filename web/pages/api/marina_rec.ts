import { restaurantData } from "@/util/restaurantData";
import type { NextApiRequest, NextApiResponse } from "next";

type MenuItem = {
  name: string;
  price: number;
  description: string;
  isSpecial: boolean;
  dietaryInfo: string[];
  tasteProfile: string[];
  ingredientProfile: string[];
  timeRestrict: boolean;
  restrictions?: {
    days: {
      start: string;
      end: string;
    };
    hours: {
      start: string;
      end: string;
    };
  };
};

let menuItems: MenuItem[] = [];

for (const restaurant of restaurantData.restaurants) {
  const newData = restaurant.menu.map((thing) => {
    return { ...thing, restaurant: restaurant };
  });
  menuItems = [...menuItems, ...newData];
}

function isCompatibleDiet(itemDiet: string, userDiet: string): boolean {
  if (itemDiet === userDiet) return true;
  if (userDiet === "Vegetarian" && itemDiet === "Vegan") return true;
  if (userDiet === "Vegetarian" && itemDiet === "Vegetarian Possible")
    return true;
  if (userDiet === "Vegan" && itemDiet === "Vegan") return true;
  return false;
}

function calculateMatchScore(
  item: MenuItem,
  flavors: string[],
  ingredients: string[],
  restrictions: string[]
): number {
  let score = 0;

  // Check flavor matches
  flavors.forEach((flavor) => {
    if (
      item.tasteProfile.some((taste) =>
        taste.toLowerCase().includes(flavor.toLowerCase())
      )
    ) {
      score += 1;
    }
  });

  // Check ingredient matches
  ingredients.forEach((ingredient) => {
    if (
      item.ingredientProfile.some((ing) =>
        ing.toLowerCase().includes(ingredient.toLowerCase())
      ) ||
      item.description.toLowerCase().includes(ingredient.toLowerCase())
    ) {
      score += 1;
    }
  });

  // Check restriction matches
  const restrictionMatch = restrictions.every((restriction) =>
    item.dietaryInfo.some((diet) => isCompatibleDiet(diet, restriction))
  );
  if (restrictionMatch) score += restrictions.length;

  return score;
}

function suggestMenuItems(
  flavors: string[],
  ingredients: string[],
  restrictions: string[],
  limit: number = 10
): MenuItem[] {
  // Calculate scores for all items
  const scoredItems = menuItems.map((item) => ({
    item,
    score: calculateMatchScore(item, flavors, ingredients, restrictions),
  }));

  // Sort items by score in descending order
  scoredItems.sort((a, b) => b.score - a.score);

  // Return top N items
  return scoredItems.slice(0, limit).map((scoredItem) => scoredItem.item);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { flavors, ingredients, restrictions } = JSON.parse(req.body);

    // Validate input
    if (
      !Array.isArray(flavors) ||
      !Array.isArray(ingredients) ||
      !Array.isArray(restrictions)
    ) {
      return res.status(400).json({
        error:
          "Invalid input format. Flavors, ingredients, and restrictions must be arrays.",
      });
    }

    const suggestions = suggestMenuItems(flavors, ingredients, restrictions);

    if (suggestions.length > 0) {
      res.status(200).json({ suggestions });
    } else {
      res.status(404).json({ message: "No matching items found" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid JSON in request body" });
  }
}
