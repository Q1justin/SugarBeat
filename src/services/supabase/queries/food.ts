import { supabase } from '../client';
import { Database } from '../../../types/supabase';

// Type definitions for better autocomplete and type safety
type CustomFood = Database['public']['Tables']['custom_foods']['Row'];
type FoodEntry = Database['public']['Tables']['food_entries']['Row'];

// Get all food entries for a user on a specific date
export async function getFoodEntriesByDate(userId: string, date: Date): Promise<FoodEntry []> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
  
    const { data, error } = await supabase
    .from('food_entries')
    .select(`
        *,
        custom_foods (*),
        recipes (*)
    `)
    .eq('user_id', userId)
    .gte('consumed_at', startOfDay.toISOString())
    .lte('consumed_at', endOfDay.toISOString());

    if (error) throw error;
    return data;
}

// Add a new custom food
export async function addCustomFood(userId: string, food: Omit<CustomFood, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data, error } = await supabase
    .from('custom_foods')
    .insert({
        ...food,
        user_id: userId
    })
    .select()
    .single();

    if (error) throw error;
    return data;
}

// Log a food entry
export async function logFoodEntry(
  userId: string,
  entry: {
    customFoodId?: string;
    edamamFoodId?: string;
    recipeId?: string;
    servingSize: number;
    servingUnit: string;
  }
) {
    const { data, error } = await supabase
    .from('food_entries')
    .insert({
        user_id: userId,
        custom_food_id: entry.customFoodId,
        edamam_food_id: entry.edamamFoodId,
        recipe_id: entry.recipeId,
        serving_size: entry.servingSize,
        serving_unit: entry.servingUnit,
        consumed_at: new Date().toISOString()
    })
    .select()
    .single();

    if (error) throw error;
    return data;
}
