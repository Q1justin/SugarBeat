import { supabase } from '../client';
import { Database } from '../../../types/supabase';

// Type definitions for better autocomplete and type safety
type UserGoals = Database['public']['Tables']['user_goals']['Row'];

// Get all food entries for a user on a specific date
export async function getUserGoals(userId: string): Promise<UserGoals []> {
  
    const { data, error } = await supabase
    .from('user_goals')
    .select(`
        *
    `)
    .eq('user_id', userId)

    if (error) throw error;
    return data;
}
