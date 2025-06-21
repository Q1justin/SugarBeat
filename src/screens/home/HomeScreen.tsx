import React, { useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    Modal,
} from 'react-native';
import { Text, FAB, Card, ProgressBar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from '../../services/supabase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Dummy data for demonstration
    const dailyGoal = 25; // grams
    const currentIntake = 10; // grams
    const progressPercentage = Math.min(currentIntake / dailyGoal, 1);

    const dummyFoodLogs = [
        { id: 1, name: 'Banana', sugar: 14, time: '8:30 AM' },
        { id: 2, name: 'Coffee with sugar', sugar: 8, time: '9:00 AM' },
        { id: 3, name: 'Apple', sugar: 10, time: '2:30 PM' },
    ];

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign out');
        }
    };

    const onDateChange = (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.dateSection}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialCommunityIcons name="calendar" size={24} color="#2563eb" />
                        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSignOut}>
                        <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Date Picker Modal for both platforms */}
                {showDatePicker && (
                    <Modal
                        transparent={true}
                        animationType="fade"
                        visible={showDatePicker}
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select Date</Text>
                                    <TouchableOpacity 
                                        onPress={() => setShowDatePicker(false)}
                                        style={styles.modalCloseButton}
                                    >
                                        <Text style={styles.modalCloseText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="inline"
                                onChange={onDateChange}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                <ScrollView style={styles.scrollView}>
                    {/* Goals Section */}
                    <Card style={styles.card}>
                        <Card.Title title="Daily Sugar Goal" />
                        <Card.Content>
                            <View style={styles.goalStats}>
                                <Text style={styles.intakeText}>
                                {currentIntake}g / {dailyGoal}g
                                </Text>
                                <Text style={styles.remainingText}>
                                {dailyGoal - currentIntake}g remaining
                                </Text>
                            </View>
                            <ProgressBar
                                progress={progressPercentage}
                                color={progressPercentage >= 1 ? '#ef4444' : '#2563eb'}
                                style={styles.progressBar}
                            />
                        </Card.Content>
                    </Card>

                    {/* Food Logs Section */}
                    <Card style={styles.card}>
                        <Card.Title title="Today's Food Log" />
                        <Card.Content>
                        {dummyFoodLogs.map((log) => (
                            <View key={log.id} style={styles.foodLogItem}>
                            <View>
                                <Text style={styles.foodName}>{log.name}</Text>
                                <Text style={styles.foodTime}>{log.time}</Text>
                            </View>
                            <Text style={styles.sugarAmount}>{log.sugar}g sugar</Text>
                            </View>
                        ))}
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Add Food FAB */}
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => navigation.navigate('SearchFood')}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        paddingTop: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        color: '#1f2937',
    },
    scrollView: {
        flex: 1,
    },
    card: {
        margin: 16,
        marginBottom: 8,
    },
    goalStats: {
        marginBottom: 8,
    },
    intakeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    remainingText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    foodLogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    foodName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    foodTime: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    sugarAmount: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2563eb',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2563eb',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    modalCloseButton: {
        padding: 8,
    },
    modalCloseText: {
        color: '#2563eb',
        fontSize: 16,
        fontWeight: '500',
    },
});
