import React, { useState } from 'react';
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

// Placeholder component for the favorites tab
const FavoritesTab = ({ user, navigation }: { user: any; navigation: Props['navigation'] }) => {
    return (
        <View style={styles.tabContent}>
            <Text style={styles.placeholder}>Favorites coming soon</Text>
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
