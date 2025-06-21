import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Searchbar, List, Text, IconButton } from 'react-native-paper';
import { searchFoods, type FoodItem } from '../../services/api/usda';
import { colors } from '../../theme/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchFood'>;

export const SearchFoodScreen = ({ navigation }: Props) => {
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

    const renderFoodItem = ({ item }: { item: FoodItem }) => (
        <List.Item
            title={item.description}
            description={item.foodCategory}
            onPress={() => {
            // TODO: Navigate to food details screen
            console.log('Selected food:', item);
            }}
            right={props => (
            <List.Icon {...props} icon="chevron-right" />
            )}
        />
    );

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
            <View style={styles.content}>
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
                                title={item.description}
                                description={item.foodCategory}
                                onPress={() => {
                                    navigation.navigate('FoodPage', { food: item });
                                }}
                                titleStyle={styles.itemTitle}
                                descriptionStyle={styles.itemDescription}
                                style={styles.listItem}
                                right={props => (
                                    <List.Icon {...props} icon="chevron-right" color={colors.primary} />
                                )}
                            />
                        )}
                        keyExtractor={item => item.fdcId.toString()}
                        contentContainerStyle={styles.list}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </View>
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
    content: {
        flex: 1,
        backgroundColor: colors.background,
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
});
