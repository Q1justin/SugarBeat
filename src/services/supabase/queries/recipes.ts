import { supabase } from '../client';
import { Database } from '../../../types/supabase';

// Type definitions for better autocomplete and type safety
type Recipe = Database['public']['Tables']['recipes']['Row'];

// Get shared recipes from friends
export async function getFriendsSharedRecipes(userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        amount,
        unit,
        custom_foods (*),
        usda_food_id
      )
    `)
    .eq('is_shared', true)
    .filter('user_id', 'in', (
      supabase
        .from('friend_connections')
        .select('addressee_id, requester_id')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')
    ).select(`case 
      when requester_id = '${userId}' then addressee_id 
      else requester_id 
      end`));

  if (error) throw error;
  return data;
}
