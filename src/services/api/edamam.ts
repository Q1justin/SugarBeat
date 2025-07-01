// Edamam API configuration
const APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
const APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;
const BASE_URL = 'https://api.edamam.com/api/food-database/v2';

export type NutrientInfo = {
    sugar: { label: string; quantity: number; unit: string; };
    addedSugar: { label: string; quantity: number; unit: string; };
    calories: { label: string; quantity: number; unit: string; };
    protein: { label: string; quantity: number; unit: string; };
    fat: { label: string; quantity: number; unit: string; };
    carbs: { label: string; quantity: number; unit: string; };
};

export type FoodItem = {
    foodId: string;
    label: string;
    category: string;
    nutrients: NutrientInfo;
    servingSizes: Array<{
        uri: string;
        label: string;
        quantity: number;
    }>;
    servingSize?: number;
    servingSizeUnit?: string;
    image?: string;
};

export type SearchResponse = {
    hints: Array<{
        food: {
            foodId: string;
            label: string;
            category: string;
            nutrients: {
                ENERC_KCAL: number;
                PROCNT: number;
                FAT: number;
                CHOCDF: number;
                SUGAR: number;
                SUGAR_ADDED: number;
            };
            servingSizes?: Array<{
                uri: string;
                label: string;
                quantity: number;
            }>;
            image?: string;
        };
    }>;
};

/**
 * Search for foods in the Edamam database
 * @param query The search term (e.g., "apple", "chicken breast")
 */
export async function searchFoods(query: string): Promise<FoodItem[]> {
    if (!APP_ID || !APP_KEY) {
        throw new Error('Missing Edamam API configuration. Please check your environment variables.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(`Edamam API error: ${response.status} ${response.statusText}`);
        }

        const data: SearchResponse = await response.json();
        
        return data.hints.map(hint => ({
            foodId: hint.food.foodId,
            label: hint.food.label,
            category: hint.food.category,
            nutrients: {
                sugar: { 
                    label: 'Total Sugars', 
                    quantity: hint.food.nutrients.SUGAR,
                    unit: 'g'
                },
                addedSugar: { 
                    label: 'Added Sugars', 
                    quantity: hint.food.nutrients.SUGAR_ADDED || 0,
                    unit: 'g'
                },
                calories: { 
                    label: 'Energy', 
                    quantity: hint.food.nutrients.ENERC_KCAL,
                    unit: 'kcal'
                },
                protein: { 
                    label: 'Protein', 
                    quantity: hint.food.nutrients.PROCNT,
                    unit: 'g'
                },
                fat: { 
                    label: 'Fat', 
                    quantity: hint.food.nutrients.FAT,
                    unit: 'g'
                },
                carbs: { 
                    label: 'Carbohydrates', 
                    quantity: hint.food.nutrients.CHOCDF,
                    unit: 'g'
                },
            },
            servingSizes: hint.food.servingSizes || [],
            servingSize: 100, // Default to 100g if no serving size provided
            servingSizeUnit: 'g',
            image: hint.food.image,
        }));
    } catch (error) {
        console.error('Error searching foods:', error);
        throw error;
    }
}

export function getNutrientValue(food: FoodItem, nutrientKey: keyof NutrientInfo): number {
    return food.nutrients[nutrientKey]?.quantity ?? 0;
}

export function getNutrientUnit(food: FoodItem, nutrientKey: keyof NutrientInfo): string {
    return food.nutrients[nutrientKey]?.unit ?? 'g';
}

/**
 * Get a specific food item by its ID from the Edamam database
 * @param foodId The unique food ID from Edamam
 */
export async function getFoodById(foodId: string): Promise<FoodItem | null> {
    if (!APP_ID || !APP_KEY) {
        throw new Error('Missing Edamam API configuration. Please check your environment variables.');
    }

    try {
        const response = await fetch(
            `${BASE_URL}/nutrients?app_id=${APP_ID}&app_key=${APP_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: [
                        {
                            quantity: 100,
                            measureURI: "http://www.edamam.com/ontologies/edamam.owl#Measure_gram",
                            foodId: foodId
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return null; // Food not found
            }
            throw new Error(`Edamam API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract food data from the nutrients response
        if (data.ingredients && data.ingredients.length > 0) {
            const ingredient = data.ingredients[0];
            const parsed = ingredient.parsed[0];
            
            return {
                foodId: parsed.foodId,
                label: parsed.food,
                category: parsed.foodCategory || '',
                nutrients: {
                    sugar: { 
                        label: 'Total Sugars', 
                        quantity: data.totalNutrients?.SUGAR?.quantity || 0,
                        unit: 'g'
                    },
                    addedSugar: { 
                        label: 'Added Sugars', 
                        quantity: data.totalNutrients?.SUGAR_ADDED?.quantity || 0,
                        unit: 'g'
                    },
                    calories: { 
                        label: 'Energy', 
                        quantity: data.totalNutrients?.ENERC_KCAL?.quantity || 0,
                        unit: 'kcal'
                    },
                    protein: { 
                        label: 'Protein', 
                        quantity: data.totalNutrients?.PROCNT?.quantity || 0,
                        unit: 'g'
                    },
                    fat: { 
                        label: 'Fat', 
                        quantity: data.totalNutrients?.FAT?.quantity || 0,
                        unit: 'g'
                    },
                    carbs: { 
                        label: 'Carbohydrates', 
                        quantity: data.totalNutrients?.CHOCDF?.quantity || 0,
                        unit: 'g'
                    },
                },
                servingSizes: ingredient.measures || [],
                servingSize: 100,
                servingSizeUnit: 'g',
                image: undefined, // Nutrients endpoint doesn't return images
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting food by ID:', error);
        throw error;
    }
}
