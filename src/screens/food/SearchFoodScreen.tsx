import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Searchbar, List, Text, IconButton, SegmentedButtons } from 'react-native-paper';
import { searchFoods, type FoodItem } from '../../services/api/edamam';
import { getFavoritesByUserId } from '../../services/supabase/queries/food';
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
            const results = await searchFoods(searchQuery);
            setFoods(results);
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

    const handleFavoritePress = (favorite: any) => {
        // Convert favorite to FoodItem format for compatibility
        let foodItem: FoodItem | null = null;

        if (favorite.edamam_food_id) {
            // For Edamam foods, we'll need to reconstruct the food item
            // This is a simplified version - you might want to store more data
            foodItem = {
                foodId: favorite.edamam_food_id,
                label: favorite.name,
                nutrients: {
                    SUGAR: { label: 'Sugar', quantity: 0, unit: 'g' },
                    SUGAR_ADDED: { label: 'Added Sugar', quantity: 0, unit: 'g' },
                    ENERC_KCAL: { label: 'Energy', quantity: 0, unit: 'kcal' },
                    PROCNT: { label: 'Protein', quantity: 0, unit: 'g' },
                    CHOCDF: { label: 'Carbs', quantity: 0, unit: 'g' },
                    FAT: { label: 'Fat', quantity: 0, unit: 'g' }
                },
                category: '',
                image: undefined,
                servingSize: 100,
                servingSizeUnit: 'g',
                servingSizes: []
            } as FoodItem;
        } else if (favorite.custom_foods) {
            // For custom foods, convert to FoodItem format
            const customFood = favorite.custom_foods;
            foodItem = {
                foodId: customFood.id,
                label: customFood.name,
                nutrients: customFood.nutrition_values || {
                    SUGAR: { label: 'Sugar', quantity: 0, unit: 'g' },
                    SUGAR_ADDED: { label: 'Added Sugar', quantity: 0, unit: 'g' },
                    ENERC_KCAL: { label: 'Energy', quantity: 0, unit: 'kcal' },
                    PROCNT: { label: 'Protein', quantity: 0, unit: 'g' },
                    CHOCDF: { label: 'Carbs', quantity: 0, unit: 'g' },
                    FAT: { label: 'Fat', quantity: 0, unit: 'g' }
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
            title = item.edamam_food_id; // You might want to store the actual name
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
});
