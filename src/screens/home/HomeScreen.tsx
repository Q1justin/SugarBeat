import { useState, useEffect } from 'react';
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
import { colors } from '../../theme/colors';
import { getWeeklyFoodLogs } from '../../services/supabase/queries/food';
import { getUserGoals } from '../../services/supabase/queries/user_goals';
import { formatTime } from '../../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface FoodLog {
    calories: number;
    id: string;
    name: string;
    protein: number;
    addedSugar: number;
    time: string;
}

interface UserGoal {
    created_at: string
    end_date: string | null
    goal_type: string
    id: string
    is_active: boolean | null
    start_date: string
    target_value: number
    timeframe: string
    updated_at: string
    user_id: string
}

export const HomeScreen = ({ navigation, route }: Props) => {
    const { user } = route.params; // Get the user from navigation params
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]); // This will hold the food logs for the selected date
    const [rawFoodEntries, setRawFoodEntries] = useState<any[]>([]); // Store the raw food entries for editing
    const [weeklyFoodLogs, setWeeklyFoodLogs] = useState<FoodLog[]>([]); // This will hold the food logs for this week
    const [userGoals, setUserGoals] = useState<UserGoal[]>([]); // To hold user goals data

    const calculateTotalSugar = (logs: FoodLog[]): number => {
        return logs.reduce((total, log) => total + log.addedSugar, 0);
    };

    const calculateTotalCalories = (logs: FoodLog[]): number => {
        return logs.reduce((total, log) => total + log.calories, 0);
    };

    const calculateTotalProtein = (logs: FoodLog[]): number => {
        return logs.reduce((total, log) => total + log.protein, 0);
    };

    // Goals data
    const sugarGoal = userGoals.find(goal => goal.goal_type === 'added_sugar')?.target_value;
    const currentSugarIntake = calculateTotalSugar(weeklyFoodLogs); // Calculate current intake from food logs
    const sugarProgressPercentage = sugarGoal ? Math.min(currentSugarIntake / sugarGoal, 1) : 0;

    const calorieGoal = userGoals.find(goal => goal.goal_type === 'calories')?.target_value;
    const currentCalorieIntake = calculateTotalCalories(foodLogs); // Calculate current intake from food logs
    const calorieProgressPercentage = calorieGoal ? Math.min(currentCalorieIntake / calorieGoal, 1) : 0;

    const proteinGoal = userGoals.find(goal => goal.goal_type === 'protein')?.target_value;
    const currentProteinIntake = calculateTotalProtein(foodLogs); // Calculate current intake from food logs
    const proteinProgressPercentage = proteinGoal ? Math.min(currentProteinIntake / proteinGoal, 1) : 0;

    useEffect(() => {
        const getGoals = async () => {
            return await getUserGoals(user.id);
        };

        getGoals()
        .then(data => {
            setUserGoals(data)
        })
        .catch(error => {
            console.error('Error fetching user goals:', error);
            Alert.alert('Error', 'Failed to fetch user goals');
        });
    }, [])

    useEffect(() => {
        const getWeeklyFoodEntries = async () => {
            return await getWeeklyFoodLogs(user.id, selectedDate);
        }

        // Fetch food entries for the selected date
        getWeeklyFoodEntries()
        .then(data => {
            const weeklyData = data.weeklyLogs;
            const formattedLogs = weeklyData.map(entry => {
                return {
                    calories: entry.calories || 0,
                    id: entry.id,
                    name: entry.name,
                    protein: entry.protein || 0,
                    addedSugar: entry.added_sugar,
                    time: formatTime(entry.consumed_at)
                }
            })
            // Set weekly logs
            setWeeklyFoodLogs(formattedLogs);
            // Set today's logs
            const todayFoodEntriesIds = data.todayLogs.map(entry => entry.id);
            setFoodLogs(formattedLogs.filter(log => todayFoodEntriesIds.includes(log.id)));
            // Store raw entries for editing
            setRawFoodEntries(data.todayLogs);
        })
        .catch(error => {
            console.error('Error fetching food entries:', error);
            Alert.alert('Error', 'Failed to fetch food entries');
        });
    }, [selectedDate])

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
                        <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={() => navigation.navigate('UserProfile', { user })}
                        >
                            <MaterialCommunityIcons name="account-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.headerButton}
                            onPress={handleSignOut}
                        >
                            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Picker Modal */}
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
                                    accentColor={colors.primary}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Goals Section */}
                    <Card style={styles.card} mode="elevated">
                        <Card.Title 
                            title="Goals" 
                            titleStyle={styles.cardTitle}
                        />
                        <Card.Content style={styles.cardContent}>
                            {
                                sugarGoal
                                ? <>
                                    <View style={styles.goalStats}>
                                        <Text style={styles.intakeText}>
                                            {currentSugarIntake}g / {sugarGoal}g
                                        </Text>
                                        <Text style={styles.remainingText}>
                                            {sugarGoal - currentSugarIntake}g remaining this week
                                        </Text>
                                    </View>
                                    <ProgressBar
                                        progress={sugarProgressPercentage}
                                        color={sugarProgressPercentage >= 1 ? colors.error : colors.progressGood}
                                        style={styles.progressBar}
                                    />
                                </>
                                : <></>
                            }
                            {
                                calorieGoal
                                ? <>
                                    <View style={styles.goalStats}>
                                        <Text style={styles.intakeText}>
                                            {currentCalorieIntake}kcal / {calorieGoal}kcal
                                        </Text>
                                        <Text style={styles.remainingText}>
                                            {(calorieGoal - currentCalorieIntake).toFixed(2)}kcal remaining today
                                        </Text>
                                    </View>
                                    <ProgressBar
                                        progress={calorieProgressPercentage}
                                        color={calorieProgressPercentage >= 1 ? colors.error : colors.progressGood}
                                        style={styles.progressBar}
                                    />
                                </>
                                : <></>
                            }
                            {
                                proteinGoal
                                ? <>
                                    <View style={styles.goalStats}>
                                        <Text style={styles.intakeText}>
                                            {(currentProteinIntake).toFixed(2)}g / {proteinGoal}g
                                        </Text>
                                        <Text style={styles.remainingText}>
                                            {(proteinGoal - currentProteinIntake).toFixed(2)}g remaining today
                                        </Text>
                                    </View>
                                    <ProgressBar
                                        progress={proteinProgressPercentage}
                                        color={proteinProgressPercentage >= 1 ? colors.error : colors.progressGood}
                                        style={styles.progressBar}
                                    />
                                </>
                                : <></>
                            }
                        </Card.Content>
                    </Card>

                    {/* Food Logs Section */}
                    <Card style={styles.card} mode="elevated">
                        <Card.Title 
                            title="Today's Food Log" 
                            titleStyle={styles.cardTitle}
                        />
                        <Card.Content style={styles.cardContent}>
                            {foodLogs.map((log, index) => {
                                const rawEntry = rawFoodEntries.find(entry => entry.id === log.id);
                                return (
                                    <TouchableOpacity 
                                        key={log.id} 
                                        style={styles.foodLogItem}
                                        onPress={() => {
                                            // Navigate to FoodPage with raw entry data for editing
                                            navigation.navigate('FoodPage', { 
                                                user, 
                                                foodEntry: rawEntry, // Pass the raw entry data 
                                                isLoggedFood: true // Flag to indicate this is editing an existing log
                                            });
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.foodName}>{log.name.length >= 30 ? `${log.name.slice(0, 30)}...` : log.name}</Text>
                                            <Text style={styles.foodTime}>{log.time}</Text>
                                        </View>
                                        <Text style={styles.sugarAmount}>{log.addedSugar}g added sugar</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </Card.Content>
                    </Card>
                </ScrollView>

                {/* Add Food FAB */}
                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => navigation.navigate('SearchFood', { user })}
                    color={colors.text.inverse}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        color: colors.text.primary,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 8,
    },
    card: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        color: colors.text.primary,
        fontSize: 20,
        fontWeight: '600',
    },
    cardContent: {
        backgroundColor: colors.cardBackground,
    },
    goalStats: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
    },
    intakeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    remainingText: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 4,
    },
    progressBar: {
        height: 7,
        borderRadius: 5,
    },
    foodLogItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.cardBackground,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.primary,
    },
    foodTime: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 2,
    },
    sugarAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.modalBackground,
        borderRadius: 16,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
    },
    modalCloseButton: {
        padding: 8,
        borderRadius: 8,
    },
    modalCloseText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
});
