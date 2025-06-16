import 'react-native-url-polyfill/auto'; //Polyfill to provide modern functionality to older envs that don't support react native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// Ensure the environment variables are set
const supabaseUrl = 'https://qqglnlbkktjtuqruiosn.supabase.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZ2xubGJra3RqdHVxcnVpb3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTMyMTMsImV4cCI6MjA2NTUyOTIxM30.12jTHWRyBQyzvxU4TWjduRmG8QbtZz6nzMWRveclYKk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage to persist the session
    autoRefreshToken: true, // Automatically refresh the token when it expires
    persistSession: true, // Keep the session between app restarts
    detectSessionInUrl: false, // Don't look for the session in URL (mobile app)
  },
});

// Helper function to check if we have a session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
