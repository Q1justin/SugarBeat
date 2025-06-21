import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { getCurrentUser } from './src/services/supabase/auth';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { supabase } from './src/services/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SearchFoodScreen } from './src/screens/food/SearchFoodScreen';

// Screens on this app
export type RootStackParamList = {
    Login: undefined; // undefined means no params are expected
    Home: undefined;
    SearchFood: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        <NavigationContainer>
            <PaperProvider>
                <Stack.Navigator 
                    initialRouteName={user ? 'Home' : 'Login'}
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    {user ? (
                        <>
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen 
                                name="SearchFood" 
                                component={SearchFoodScreen}
                                options={{
                                headerShown: true,
                                title: 'Add Food',
                                headerShadowVisible: false,
                                presentation: 'modal',
                                headerStyle: {
                                    backgroundColor: '#fff',
                                },
                                }}
                            />
                        </>
                    ) : (
                        <Stack.Screen name="Login" component={LoginScreen} />
                    )}
                </Stack.Navigator>
            </PaperProvider>
        <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
