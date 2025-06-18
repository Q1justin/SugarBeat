import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { getFoodEntriesByDate } from './src/services/supabase/queries/food';
import { signInWithEmail, getCurrentUser } from './src/services/supabase/auth';

export default function App() {  const handleTestPress = async () => {
    try {
      // First try to sign in
      await signInWithEmail('q1justindok@gmail.com', 'justlikeQ1');
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      const userId = user.id;
      const entries = await getFoodEntriesByDate(userId, new Date());

      Alert.alert(
        'Query Results', 
        `Found ${entries.length} entries\n\nCheck console for full details`
      );
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch food entries');
    }
  };

  return (
    <View style={styles.container}>
      <Text>SugarBeat App</Text>
      <Button 
        title="TEST Endpoint"
        onPress={handleTestPress}
      />
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
