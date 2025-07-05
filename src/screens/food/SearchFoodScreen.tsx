import { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Searchbar, List, Text, IconButton, SegmentedButtons, FAB } from 'react-native-paper';
import { searchFoods, getFoodById, convertCustomFoodToFoodItem, type FoodItem } from '../../services/api/edamam';
import { getFavoritesByUserId, searchCustomFoods } from '../../services/supabase/queries/food';
import { colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchFood'>;

// Separate component for the search tab
const SearchTab = ({ user, navigation }: { user: any; navigation: Props['navigation'] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            // Search both Edamam API and custom foods in parallel
            const [edamamResults, customFoodResults] = await Promise.all([
                searchFoods(searchQuery),
                searchCustomFoods(user.id, searchQuery)
            ]);

            // Format Edamam results
            const formattedEdamamResults = edamamResults.map(item => ({
                ...item,
                nutrients: {
                    sugar: { quantity: item.nutrients.sugar.quantity, unit: item.nutrients.sugar.unit },
                    addedSugar: { quantity: item.nutrients.addedSugar.quantity, unit: item.nutrients.addedSugar.unit },
                    calories: { quantity: item.nutrients.calories.quantity, unit: item.nutrients.calories.unit },
                    protein: { quantity: item.nutrients.protein.quantity, unit: item.nutrients.protein.unit },
                    carbs: { quantity: item.nutrients.carbs.quantity, unit: item.nutrients.carbs.unit },
                    fat: { quantity: item.nutrients.fat.quantity, unit: item.nutrients.fat.unit },
                },
                servingSizes: item.servingSizes || [],
            }));

            // Convert custom foods to FoodItem format
            const formattedCustomResults = customFoodResults.map(customFood => {
                return convertCustomFoodToFoodItem(customFood)
            });

            // Combine results with custom foods first (user's own foods prioritized)
            const allResults = [...formattedCustomResults, ...formattedEdamamResults];
            
            setFoods(allResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search foods');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.tabContent}>
            <Searchbar
                placeholder="Search for a food..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={onSearch}
                style={styles.searchBar}
                iconColor={colors.primary}
                placeholderTextColor={colors.text.disabled}
                inputStyle={styles.searchInput}
            />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.error}>{error}</Text>
                </View>
            ) : foods.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.placeholder}>Search for food to get started</Text>
                </View>
            ) : (
                <FlatList
                    data={foods}
                    renderItem={({ item }) => (
                        <List.Item
                            title={item.label}
                            description={item.category}
                            onPress={() => {
                                navigation.navigate('FoodPage', { food: item, user });
                            }}
                            titleStyle={styles.itemTitle}
                            descriptionStyle={styles.itemDescription}
                            style={styles.listItem}
                            left={props => 
                                item.image ? (
                                    <View style={styles.imageContainer}>
                                        <Image 
                                            source={{ uri: item.image }} 
                                            style={styles.foodImage}
                                        />
                                    </View>
                                ) : (
                                    <List.Icon {...props} icon="food" />
                                )
                            }
                            right={props => (
                                <List.Icon {...props} icon="chevron-right" color={colors.primary} />
                            )}
                        />
                    )}
                    keyExtractor={item => `${item.foodId}_${item.label}`}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
};

// Component for the favorites tab
const FavoritesTab = ({ user, navigation }: { user: any; navigation: Props['navigation'] }) => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            const favoritesData = await getFavoritesByUserId(user.id);
            setFavorites(favoritesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleFavoritePress = async (favorite: any) => {
        // Convert favorite to FoodItem format for compatibility
        let foodItem: FoodItem | null = null;

        if (favorite.edamam_food_id) {
            // For Edamam foods, we'll need to reconstruct the food item
            // This is a simplified version - you might want to store more data

            const edamamFood = await getFoodById(favorite.edamam_food_id);

            if (!edamamFood) {
                console.error('Food not found in Edamam database:', favorite.edamam_food_id);
                return;
            }
            
            foodItem = {
                foodId: favorite.edamam_food_id,
                label: favorite.name,
                nutrients: {
                    sugar: { quantity: edamamFood.nutrients.sugar.quantity, unit: edamamFood.nutrients.sugar.unit },
                    addedSugar: { quantity: edamamFood.nutrients.addedSugar.quantity, unit: edamamFood.nutrients.addedSugar.unit },
                    calories: { quantity: edamamFood.nutrients.calories.quantity, unit: edamamFood.nutrients.calories.unit },
                    protein: { quantity: edamamFood.nutrients.protein.quantity, unit: edamamFood.nutrients.protein.unit },
                    carbs: { quantity: edamamFood.nutrients.carbs.quantity, unit: edamamFood.nutrients.carbs.unit },
                    fat: { quantity: edamamFood.nutrients.fat.quantity, unit: edamamFood.nutrients.fat.unit }
                },
                category: '',
                image: undefined,
                servingSize: edamamFood.servingSize,
                servingSizeUnit: edamamFood.servingSizeUnit,
                servingSizes: []
            } as FoodItem;
        } else if (favorite.custom_foods) {
            // For custom foods, convert to FoodItem format
            const customFood = favorite.custom_foods;
            const nutritionValues = customFood.nutrition_values;
            
            foodItem = {
                foodId: customFood.id,
                label: customFood.name,
                nutrients: {
                    sugar: { quantity: nutritionValues.sugar, unit: customFood.serving_unit },
                    addedSugar: { quantity: nutritionValues.addedSugar, unit: customFood.serving_unit },
                    calories: { quantity: nutritionValues.calories, unit: 'kcal' },
                    protein: { quantity: nutritionValues.protein, unit: customFood.serving_unit },
                    carbs: { quantity: nutritionValues.carbs, unit: customFood.serving_unit },
                    fat: { quantity: nutritionValues.fat, unit: customFood.serving_unit }
                },
                category: 'Custom Food',
                image: undefined,
                servingSize: customFood.serving_size || 100,
                servingSizeUnit: customFood.serving_unit || 'g',
                servingSizes: []
            } as FoodItem;
        }

        if (foodItem) {
            navigation.navigate('FoodPage', {
                food: foodItem,
                isLoggedFood: false,
                user: user
            });
        }
    };

    const renderFavoriteItem = ({ item }: { item: any }) => {
        let title = '';
        let subtitle = '';

        if (item.custom_foods) {
            title = item.custom_foods.name;
            subtitle = 'Custom Food';
        } else if (item.recipes) {
            title = item.recipes.name;
            subtitle = 'Recipe';
        } else if (item.edamam_food_id) {
            title = item.name;
            subtitle = 'Food Database';
        }

        return (
            <List.Item
                title={title}
                description={subtitle}
                onPress={() => handleFavoritePress(item)}
                style={styles.listItem}
                titleStyle={styles.itemTitle}
                descriptionStyle={styles.itemDescription}
                left={() => (
                    <View style={styles.itemIcon}>
                        <IconButton 
                            icon="heart" 
                            size={24} 
                            iconColor={colors.primary}
                        />
                    </View>
                )}
                right={() => (
                    <IconButton 
                        icon="chevron-right" 
                        size={24} 
                        iconColor={colors.text.secondary}
                    />
                )}
            />
        );
    };

    if (loading) {
        return (
            <View style={[styles.tabContent, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.placeholder}>Loading favorites...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.tabContent, styles.centered]}>
                <Text style={styles.placeholder}>{error}</Text>
                <IconButton
                    icon="refresh"
                    size={24}
                    onPress={loadFavorites}
                    iconColor={colors.primary}
                />
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={[styles.tabContent, styles.centered]}>
                <IconButton 
                    icon="heart-outline" 
                    size={48} 
                    iconColor={colors.text.disabled}
                />
                <Text style={styles.placeholder}>No favorites yet</Text>
                <Text style={styles.placeholder}>Add foods to your favorites to see them here</Text>
            </View>
        );
    }

    return (
        <View style={styles.tabContent}>
            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export const SearchFoodScreen = ({ route, navigation }: Props) => {
    const { user } = route.params;
    const [activeTab, setActiveTab] = useState('search');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <IconButton
                    icon="close"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                    iconColor={colors.text.primary}
                />
            </View>
            <View style={styles.tabContainer}>
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={setActiveTab}
                    buttons={[
                        { value: 'search', label: 'Search' },
                        { value: 'favorites', label: 'Favorites' }
                    ]}
                    style={styles.segmentedButtons}
                />
            </View>
            {activeTab === 'search' ? (
                <SearchTab user={user} navigation={navigation} />
            ) : (
                <FavoritesTab user={user} navigation={navigation} />
            )}
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => {
                    navigation.navigate('CreateCustom', { user });
                }}
                color={colors.text.inverse}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 1,
        paddingHorizontal: 8,
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        margin: 0,
        padding: 0,
        width: 32,
        height: 32,
    },
    searchBar: {
        margin: 16,
        elevation: 2,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchInput: {
        color: colors.text.primary,
    },
    list: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    listItem: {
        backgroundColor: colors.cardBackground,
        marginVertical: 4,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    error: {
        color: colors.error,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    placeholder: {
        color: colors.text.secondary,
        fontSize: 16,
    },
    itemTitle: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    itemDescription: {
        color: colors.text.secondary,
        fontSize: 14,
    },
    itemIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    separator: {
        height: 8,
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: colors.cardBackground,
    },
    foodImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    tabContainer: {
        backgroundColor: colors.cardBackground,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    segmentedButtons: {
        backgroundColor: colors.cardBackground,
    },
    tabContent: {
        flex: 1,
        backgroundColor: colors.background,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: colors.primary,
        borderRadius: 28,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
});
