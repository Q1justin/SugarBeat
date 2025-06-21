import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Searchbar, List, Text } from 'react-native-paper';
import { searchFoods, type FoodItem } from '../../services/api/usda';

export const SearchFoodScreen = () => {
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
      <View style={styles.content}>
        <Searchbar
          placeholder="Search for a food..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={onSearch}
          style={styles.searchBar}
        />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : foods.length === 0 ? (
          <View style={styles.centered}>
            <Text>Search for food to get started</Text>
          </View>
        ) : (
          <FlatList
            data={foods}
            renderItem={renderFoodItem}
            keyExtractor={item => item.fdcId.toString()}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    marginHorizontal: 16,
  },
});
