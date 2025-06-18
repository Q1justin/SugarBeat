import { supabase } from './client';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        // Session missing is expected after logout
        if (error instanceof Error && error.message.includes('Auth session missing')) {
            return null;
        }
        // Re-throw unexpected errors
        throw error;
    }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
