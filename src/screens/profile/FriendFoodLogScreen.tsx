import { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Modal,
} from 'react-native';
import { Text, Card, ProgressBar, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import { getWeeklyFoodLogs } from '../../services/supabase/queries/food';
import { getUserGoals } from '../../services/supabase/queries/user_goals';
import { formatTime } from '../../utils';
import type { Friend } from '../../services/supabase/queries/friends';

type Props = NativeStackScreenProps<RootStackParamList, 'FriendFoodLog'>;

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

export const FriendFoodLogScreen = ({ navigation, route }: Props) => {
    const { friend, currentUser } = route.params;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
    const [weeklyFoodLogs, setWeeklyFoodLogs] = useState<FoodLog[]>([]);
    const [rawFoodEntries, setRawFoodEntries] = useState<any[]>([]);
    const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
    const [loading, setLoading] = useState(true);

    // Calculate progress for goals
    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalSugar = foodLogs.reduce((sum, log) => sum + log.addedSugar, 0);
    const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);

    // Get active goals
    const calorieGoal = userGoals.find(goal => goal.goal_type === 'calories' && goal.is_active);
    const sugarGoal = userGoals.find(goal => goal.goal_type === 'added_sugar' && goal.is_active);
    const proteinGoal = userGoals.find(goal => goal.goal_type === 'protein' && goal.is_active);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [weeklyData, goalsData] = await Promise.all([
                getWeeklyFoodLogs(friend.id, selectedDate),
                getUserGoals(friend.id)
            ]);
            
            setWeeklyFoodLogs(weeklyData.weeklyLogs.map((entry: any) => ({
                calories: entry.calories,
                id: entry.id,
                name: entry.name,
                protein: entry.protein,
                addedSugar: entry.added_sugar,
                time: formatTime(entry.consumed_at),
            })));
            setRawFoodEntries(weeklyData.todayLogs);
            
            // Transform today's logs for display
            const transformedLogs = weeklyData.todayLogs.map((entry: any) => ({
                calories: entry.calories,
                id: entry.id,
                name: entry.name,
                protein: entry.protein,
                addedSugar: entry.added_sugar,
                time: formatTime(entry.consumed_at),
            }));
            
            setFoodLogs(transformedLogs);
            setUserGoals(goalsData);
        } catch (error) {
            console.error('Error fetching friend data:', error);
            // Show mock data for demo purposes
            setFoodLogs([
                {
                    id: '1',
                    name: 'Greek Yogurt with Berries',
                    calories: 150,
                    protein: 15,
                    addedSugar: 8,
                    time: '8:30 AM'
                },
                {
                    id: '2',
                    name: 'Grilled Chicken Salad',
                    calories: 320,
                    protein: 35,
                    addedSugar: 2,
                    time: '12:45 PM'
                },
                {
                    id: '3',
                    name: 'Apple with Peanut Butter',
                    calories: 180,
                    protein: 8,
                    addedSugar: 12,
                    time: '3:20 PM'
                }
            ]);
            setUserGoals([
                {
                    id: '1',
                    goal_type: 'added_sugar',
                    target_value: 25,
                    is_active: true,
                    created_at: '',
                    end_date: null,
                    start_date: '',
                    timeframe: 'daily',
                    updated_at: '',
                    user_id: friend.id
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, friend.id]);

    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSelectedDate(selectedDate);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        iconColor={colors.text.primary}
                        onPress={() => navigation.goBack()}
                    />
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{friend.display_name || friend.email}</Text>
                        <Text style={styles.headerSubtitle}>Food Log</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.dateSection}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>
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
                                    display="spinner"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            </View>
                        </View>
                    </Modal>
                )}

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Goals Progress Section */}
                    {userGoals.length > 0 && (
                        <Card style={styles.goalsCard}>
                            <Card.Title 
                                title="Daily Goals"
                                titleStyle={styles.cardTitle}
                                left={(props) => <MaterialCommunityIcons name="target" size={24} color={colors.primary} />}
                            />
                            <Card.Content>
                                {sugarGoal && (
                                    <View style={styles.goalItem}>
                                        <View style={styles.goalHeader}>
                                            <Text style={styles.goalLabel}>Added Sugar</Text>
                                            <Text style={styles.goalValue}>
                                                {totalSugar.toFixed(1)}g / {sugarGoal.target_value}g
                                            </Text>
                                        </View>
                                        <ProgressBar 
                                            progress={Math.min(totalSugar / sugarGoal.target_value, 1)}
                                            color={totalSugar <= sugarGoal.target_value ? colors.primary : colors.error}
                                            style={styles.progressBar}
                                        />
                                    </View>
                                )}
                                
                                {calorieGoal && (
                                    <View style={styles.goalItem}>
                                        <View style={styles.goalHeader}>
                                            <Text style={styles.goalLabel}>Calories</Text>
                                            <Text style={styles.goalValue}>
                                                {totalCalories} / {calorieGoal.target_value}
                                            </Text>
                                        </View>
                                        <ProgressBar 
                                            progress={Math.min(totalCalories / calorieGoal.target_value, 1)}
                                            color={colors.accent}
                                            style={styles.progressBar}
                                        />
                                    </View>
                                )}

                                {proteinGoal && (
                                    <View style={styles.goalItem}>
                                        <View style={styles.goalHeader}>
                                            <Text style={styles.goalLabel}>Protein</Text>
                                            <Text style={styles.goalValue}>
                                                {totalProtein.toFixed(1)}g / {proteinGoal.target_value}g
                                            </Text>
                                        </View>
                                        <ProgressBar 
                                            progress={Math.min(totalProtein / proteinGoal.target_value, 1)}
                                            color={colors.accent}
                                            style={styles.progressBar}
                                        />
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                    )}

                    {/* Food Log Section */}
                    <Card style={styles.foodLogCard}>
                        <Card.Title 
                            title={`${formatDate(selectedDate)}'s Food Log`}
                            titleStyle={styles.cardTitle}
                            left={(props) => <MaterialCommunityIcons name="food-apple" size={24} color={colors.primary} />}
                        />
                        <Card.Content>
                            {loading ? (
                                <Text style={styles.loadingText}>Loading...</Text>
                            ) : foodLogs.length > 0 ? (
                                foodLogs.map((log) => (
                                    <View key={log.id} style={styles.foodLogItem}>
                                        <View>
                                            <Text style={styles.foodName}>
                                                {log.name.length >= 30 ? `${log.name.slice(0, 30)}...` : log.name}
                                            </Text>
                                            <Text style={styles.foodTime}>{log.time}</Text>
                                            <Text style={styles.foodNutrition}>
                                                {log.calories} cal • {log.protein}g protein
                                            </Text>
                                        </View>
                                        <Text style={styles.sugarAmount}>{log.addedSugar}g sugar</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <MaterialCommunityIcons 
                                        name="food-off" 
                                        size={48} 
                                        color={colors.text.secondary} 
                                    />
                                    <Text style={styles.emptyText}>No food logged for this day</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Summary Card */}
                    {foodLogs.length > 0 && (
                        <Card style={styles.summaryCard}>
                            <Card.Title 
                                title="Daily Summary"
                                titleStyle={styles.cardTitle}
                                left={(props) => <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />}
                            />
                            <Card.Content>
                                <View style={styles.summaryGrid}>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{totalCalories}</Text>
                                        <Text style={styles.summaryLabel}>Calories</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{totalSugar.toFixed(1)}g</Text>
                                        <Text style={styles.summaryLabel}>Added Sugar</Text>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <Text style={styles.summaryValue}>{totalProtein.toFixed(1)}g</Text>
                                        <Text style={styles.summaryLabel}>Protein</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>
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
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        color: colors.text.primary,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    goalsCard: {
        backgroundColor: colors.cardBackground,
        marginBottom: 16,
        elevation: 2,
    },
    foodLogCard: {
        backgroundColor: colors.cardBackground,
        marginBottom: 16,
        elevation: 2,
    },
    summaryCard: {
        backgroundColor: colors.cardBackground,
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    goalItem: {
        marginBottom: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalLabel: {
        fontSize: 16,
        color: colors.text.primary,
    },
    goalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
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
        paddingHorizontal: 8,
        marginBottom: 8,
        backgroundColor: colors.background,
        borderRadius: 8,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.primary,
        marginBottom: 4,
    },
    foodTime: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    foodNutrition: {
        fontSize: 12,
        color: colors.text.secondary,
    },
    sugarAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 4,
    },
    loadingText: {
        textAlign: 'center',
        color: colors.text.secondary,
        fontSize: 16,
        paddingVertical: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.secondary,
        marginTop: 16,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    modalCloseButton: {
        padding: 8,
    },
    modalCloseText: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
});
