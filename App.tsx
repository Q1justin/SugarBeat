import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { colors } from './src/theme/colors';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { getCurrentUser } from './src/services/supabase/auth';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { supabase } from './src/services/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SearchFoodScreen } from './src/screens/food/SearchFoodScreen';
import { FoodPage } from './src/screens/food/FoodPage';
import { CreateCustomScreen } from './src/screens/food/CreateCustomScreen';
import { CreateRecipeScreen } from './src/screens/recipes/CreateRecipeScreen';
import { UserProfileScreen } from './src/screens/profile/UserProfileScreen';
import { FriendFoodLogScreen } from './src/screens/profile/FriendFoodLogScreen';
import type { FoodItem } from './src/services/api/edamam';

// Screens on this app
export type RootStackParamList = {
    Login: undefined; // undefined means no params are expected
    Home: {
        user: any
    };
    SearchFood: {
        user: any
    };
    FoodPage: {
        user: any,
        food?: FoodItem;  // The food item to display (for new foods)
        foodEntry?: any;  // The food entry to edit (for existing logged foods)
        isLoggedFood?: boolean; // Whether this is a food that was already logged
    };
    CreateCustom: {
        user: any
    };
    CreateRecipe: {
        user: any
    };
    UserProfile: {
        user: any
    };
    FriendFoodLog: {
        friend: any;
        currentUser: any;
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Paper theme
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        primaryContainer: colors.primaryLight,
        background: colors.background,
        surface: colors.cardBackground,
        surfaceVariant: colors.modalBackground,
        error: colors.error,
        onSurface: colors.text.primary,
        onSurfaceVariant: colors.text.secondary,
        elevation: {
            level0: colors.background,
            level1: colors.cardBackground,
            level2: colors.cardBackground,
            level3: colors.cardBackground,
            level4: colors.cardBackground,
            level5: colors.cardBackground,
        },
    },
};

const navigationTheme = {
    ...NavigationDefaultTheme,
    dark: false,
    colors: {
        ...NavigationDefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.cardBackground,
        text: colors.text.primary,
        border: colors.border,
    },
};

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
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            <PaperProvider theme={theme}>
                <View style={styles.appContainer}>
                    <Stack.Navigator 
                        initialRouteName={user ? "Home" : "Login"}
                        screenOptions={{
                            headerShown: false,
                            contentStyle: {
                                backgroundColor: colors.background,
                            }
                        }}
                    >
                        {user ? (
                            <>
                                <Stack.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
                                <Stack.Screen
                                    name="SearchFood" 
                                    component={SearchFoodScreen}
                                    initialParams={{ user }}
                                    options={{
                                        headerShown: true,
                                        title: 'Add Food',
                                        headerShadowVisible: false,
                                        presentation: 'modal',
                                        headerStyle: {
                                            backgroundColor: colors.cardBackground,
                                        },
                                        headerTintColor: colors.text.primary,
                                    }}
                                />
                                <Stack.Screen 
                                    name="FoodPage" 
                                    component={FoodPage}
                                    initialParams={{ user }}
                                    options={{
                                        headerShown: true,
                                        headerShadowVisible: false,
                                        headerStyle: {
                                            backgroundColor: colors.cardBackground,
                                        },
                                        headerTintColor: colors.text.primary,
                                    }}
                                />
                                <Stack.Screen 
                                    name="CreateCustom" 
                                    component={CreateCustomScreen}
                                    initialParams={{ user }}
                                    options={{
                                        headerShown: true,
                                        title: 'Create Custom Food',
                                        headerShadowVisible: false,
                                        presentation: 'modal',
                                        headerStyle: {
                                            backgroundColor: colors.cardBackground,
                                        },
                                        headerTintColor: colors.text.primary,
                                    }}
                                />
                                <Stack.Screen 
                                    name="CreateRecipe" 
                                    component={CreateRecipeScreen}
                                    initialParams={{ user }}
                                    options={{
                                        headerShown: true,
                                        title: 'Create Recipe',
                                        headerShadowVisible: false,
                                        presentation: 'modal',
                                        headerStyle: {
                                            backgroundColor: colors.cardBackground,
                                        },
                                        headerTintColor: colors.text.primary,
                                    }}
                                />
                                <Stack.Screen 
                                    name="UserProfile" 
                                    component={UserProfileScreen}
                                    initialParams={{ user }}
                                    options={{
                                        headerShown: false,
                                    }}
                                />
                                <Stack.Screen 
                                    name="FriendFoodLog" 
                                    component={FriendFoodLogScreen}
                                    options={{
                                        headerShown: false,
                                    }}
                                />
                            </>
                        ) : (
                            <Stack.Screen name="Login" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </View>
            </PaperProvider>
            <StatusBar style="dark" backgroundColor={colors.background} />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingText: {
        color: colors.text.primary,
        fontSize: 18,
    },
});
