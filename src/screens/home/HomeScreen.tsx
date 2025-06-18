import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { getFoodEntriesByDate } from '../../services/supabase/queries/food';
import { getCurrentUser, signOut } from '../../services/supabase/auth';

export const HomeScreen = () => {
  const handleTestPress = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const entries = await getFoodEntriesByDate(user.id, new Date());
      console.log('Food entries:', entries);
      
      Alert.alert(
        'Query Results',
        `Found ${entries.length} entries\n\nCheck console for full details`
      );
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch entries');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // App.tsx will automatically update the UI
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Test Food Entries"
          onPress={handleTestPress}
        />
        <View style={styles.buttonSpacing} />
        <Button 
          title="Sign Out"
          onPress={handleSignOut}
          color="#dc2626"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonSpacing: {
    height: 16,
  },
});
