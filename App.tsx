import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { getCurrentUser } from './src/services/supabase/auth';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { supabase } from './src/services/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser(); // Only run once on mount
  }, []);

  // Listen for auth state changes like login/logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      // event is string like 'SIGNED_IN', 'SIGNED_OUT', etc.
      // sesssion is the current session object
      (event: AuthChangeEvent, session: Session | null) => {
        // Set user if there is one
        setUser(session?.user ?? null);
      }
    );

    return () => {
      // Clean up function to stop listening to auth changes
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? <HomeScreen /> : <LoginScreen />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
