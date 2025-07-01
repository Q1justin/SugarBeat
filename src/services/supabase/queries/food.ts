import { supabase } from '../client';
import { Database } from '../../../types/supabase';

// Type definitions for better autocomplete and type safety
type CustomFood = Database['public']['Tables']['custom_foods']['Row'];
type FoodEntry = Database['public']['Tables']['food_entries']['Row'];
type Favorite = Database['public']['Tables']['favorites']['Row'];

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
    calories: number;
    customFoodId?: string;
    edamamFoodId?: string;
    name: string;
    protein: number;
    recipeId?: string;
    servingSize: number;
    servingUnit: string;
    addedSugar: number;
  }
) {
    const { data, error } = await supabase
    .from('food_entries')
    .insert({
        user_id: userId,
        calories: entry.calories,
        custom_food_id: entry.customFoodId,
        edamam_food_id: entry.edamamFoodId,
        name: entry.name,
        protein: entry.protein,
        recipe_id: entry.recipeId,
        serving_size: entry.servingSize,
        serving_unit: entry.servingUnit,
        added_sugar: entry.addedSugar,
        consumed_at: new Date().toISOString()
    })
    .select()
    .single();

    if (error) throw error;
    return data;
}

// Get all food entries for a user in a specific week
export async function getWeeklyFoodLogs(userId: string, date: Date): Promise<{weeklyLogs: FoodEntry[]; todayLogs: FoodEntry[]}> {
    // Find the Monday of the week (go backwards until we hit Monday)
    const startOfWeek = new Date(date);
    startOfWeek.setHours(0, 0, 0, 0);
    while (startOfWeek.getDay() !== 1) { // 1 is Monday
        startOfWeek.setDate(startOfWeek.getDate() - 1);
    }

    // Find the Sunday of the week (go forward until we hit Sunday)
    const endOfWeek = new Date(date);
    endOfWeek.setHours(23, 59, 59, 999);
    while (endOfWeek.getDay() !== 0) { // 0 is Sunday
        endOfWeek.setDate(endOfWeek.getDate() + 1);
    }

    // Set up the specific date bounds for passed in date
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
    .gte('consumed_at', startOfWeek.toISOString())
    .lte('consumed_at', endOfWeek.toISOString());

    if (error) throw error;
    // Split the data into weekly and today's logs
    const todayLogs = data.filter(entry => {
        const entryDate = new Date(entry.consumed_at);
        return entryDate >= startOfDay && entryDate <= endOfDay;
    });

    return {
        weeklyLogs: data,
        todayLogs
    };
}

// Get all favorite foods for a user
export async function getFavoritesByUserId(userId: string): Promise<Favorite[]> {
    console.log(userId)
    const { data, error } = await supabase
        .from('favorites')
        .select(`
            *,
            custom_foods (*),
            recipes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}
