// USDA FoodData Central API configuration
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY;
const BASE_URL = process.env.EXPO_PUBLIC_USDA_URL;

// Types for the API response
export type NutrientInfo = {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
};

export type FoodItem = {
    fdcId: number;
    description: string;
    foodCategory: string;
    servingSize?: number;
    servingSizeUnit?: string;
    foodNutrients: NutrientInfo[];
};

export type SearchResponse = {
    totalHits: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    foods: FoodItem[];
};

// Nutrient IDs for sugar-related nutrients
const NUTRIENT_IDS = {
    TOTAL_SUGARS: 2000,  // "Sugars, total including NLEA"
    ADDED_SUGARS: 1235,  // "Sugars, added"
    CARBOHYDRATES: 1005, // "Carbohydrate, by difference"
    FIBER: 1079,         // "Fiber, total dietary"
    PROTEIN: 1003,       // "Protein"
    FAT: 1004,          // "Total lipid (fat)"
    ENERGY: 1008,        // "Energy" (kcal)
} as const;

/**
 * Search for foods in the USDA database
 * @param query The search term (e.g., "apple", "chicken breast")
 * @param pageSize Number of results per page (default: 50)
 * @param pageNumber Page number (default: 1)
 */
export async function searchFoods(query: string, pageSize: number = 50, pageNumber: number = 1): Promise<FoodItem[]> {
    if (!USDA_API_KEY) {
        throw new Error('Missing USDA API key. Please check your environment variables.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${pageNumber}`
        );

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();
        return data.foods;
    } catch (error) {
        console.error('Error searching foods:', error);
        throw error;
    }
}

/**
 * Extract sugar information from a food item
 * @param food The food item from USDA API
 */
export function extractSugarInfo(food: FoodItem) {
    const findNutrient = (nutrientId: number) => food.foodNutrients.find(n => n.nutrientId === nutrientId)?.value ?? 0;

    return {
        description: food.description,
        category: food.foodCategory,
        servingSize: food.servingSize ?? 100,
        servingSizeUnit: food.servingSizeUnit ?? 'g',
        nutrients: {
            calories: findNutrient(NUTRIENT_IDS.ENERGY),
            totalSugars: findNutrient(NUTRIENT_IDS.TOTAL_SUGARS),
            addedSugars: findNutrient(NUTRIENT_IDS.ADDED_SUGARS),
            carbohydrates: findNutrient(NUTRIENT_IDS.CARBOHYDRATES),
            fiber: findNutrient(NUTRIENT_IDS.FIBER),
            protein: findNutrient(NUTRIENT_IDS.PROTEIN),
            fat: findNutrient(NUTRIENT_IDS.FAT),
        }
    };
}

/**
 * Get detailed information about a specific food by its FDC ID
 * @param fdcId The food data central ID
 */
export async function getFoodDetails(fdcId: number): Promise<FoodItem> {
    if (!USDA_API_KEY) {
        throw new Error('Missing USDA API key. Please check your environment variables.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting food details:', error);
        throw error;
    }
}
