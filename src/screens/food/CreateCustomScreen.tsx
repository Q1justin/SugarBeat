import { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Text, Card, TextInput, FAB, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import { addCustomFood, addToFavorites } from '../../services/supabase/queries/food';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCustom'>;

const EditableNutrientRow = ({ 
    label, 
    value, 
    unit, 
    onChangeText,
    placeholder 
}: { 
    label: string; 
    value: string; 
    unit: string; 
    onChangeText: (text: string) => void;
    placeholder?: string;
}) => (
    <View style={styles.nutrientRow}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <View style={styles.editableNutrientContainer}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                keyboardType="decimal-pad"
                style={styles.editableNutrientInput}
                mode="outlined"
                dense
                outlineStyle={styles.editableInputOutline}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                placeholder={placeholder || "0"}
            />
            <Text style={styles.nutrientUnit}>{unit}</Text>
        </View>
    </View>
);

export const CreateCustomScreen = ({ route, navigation }: Props) => {
    const { user } = route.params;
    
    // Form state
    const [foodName, setFoodName] = useState('');
    const [servingSize, setServingSize] = useState('100');
    const [servingUnit, setServingUnit] = useState('g');
    const [calories, setCalories] = useState('');
    const [sugar, setSugar] = useState('');
    const [carbs, setCarbs] = useState('');
    const [protein, setProtein] = useState('');
    const [fat, setFat] = useState('');
    const [sodium, setSodium] = useState('');
    const [fiber, setFiber] = useState('');
    
    const [saving, setSaving] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    const handleSave = async () => {
        if (!foodName.trim()) {
            // TODO: Show error message
            return;
        }

        setSaving(true);
        try {
            const customFood = {
                name: foodName.trim(),
                serving_size: parseFloat(servingSize) || 100,
                serving_unit: servingUnit,
                is_shared: false,
                nutrition_values: {
                    calories: { label: 'Energy', quantity: parseFloat(calories) || 0, unit: 'kcal' },
                    sugar: { label: 'Sugar', quantity: parseFloat(sugar) || 0, unit: 'g' },
                    carbs: { label: 'Carbohydrates', quantity: parseFloat(carbs) || 0, unit: 'g' },
                    protein: { label: 'Protein', quantity: parseFloat(protein) || 0, unit: 'g' },
                    fat: { label: 'Fat', quantity: parseFloat(fat) || 0, unit: 'g' },
                    sodium: { label: 'Sodium', quantity: parseFloat(sodium) || 0, unit: 'mg' },
                    fiber: { label: 'Fiber', quantity: parseFloat(fiber) || 0, unit: 'g' },
                }
            };

            const newCustomFood = await addCustomFood(user.id, customFood);
            
            // If favorite is toggled, add to favorites
            if (isFavorite && newCustomFood) {
                await addToFavorites(user.id, {
                    name: foodName.trim(),
                    customFoodId: newCustomFood.id,
                });
            }
            
            navigation.goBack();
        } catch (error) {
            console.error('Error saving custom food:', error);
            // TODO: Show error message
        } finally {
            setSaving(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <Card style={styles.card}>
                    <Card.Title
                        title="Create Custom Food"
                        subtitle="Enter nutrition information"
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        right={props => (
                            <IconButton
                                icon={isFavorite ? "star" : "star-outline"}
                                size={24}
                                iconColor={isFavorite ? colors.primary : colors.text.secondary}
                                onPress={handleFavoriteToggle}
                                disabled={favoriteLoading}
                            />
                        )}
                    />
                    <Card.Content>
                        {/* Food Name Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Food Name</Text>
                            <TextInput
                                mode="outlined"
                                value={foodName}
                                onChangeText={setFoodName}
                                style={styles.nameInput}
                                outlineStyle={styles.inputOutline}
                                placeholder="Enter food name"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>

                        {/* Serving Size Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Serving Size</Text>
                            <View style={styles.servingInputRow}>
                                <TextInput
                                    mode="outlined"
                                    value={servingSize}
                                    onChangeText={setServingSize}
                                    keyboardType="decimal-pad"
                                    style={styles.servingSizeInput}
                                    outlineStyle={styles.inputOutline}
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                                <TextInput
                                    mode="outlined"
                                    value={servingUnit}
                                    onChangeText={setServingUnit}
                                    style={styles.servingUnitInput}
                                    outlineStyle={styles.inputOutline}
                                    placeholder="unit"
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                />
                            </View>
                        </View>

                        {/* Nutrition Facts Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                            <View style={styles.nutrientsContainer}>
                                <EditableNutrientRow
                                    label="Calories"
                                    value={calories}
                                    unit="kcal"
                                    onChangeText={setCalories}
                                />
                                <EditableNutrientRow
                                    label="Sugar"
                                    value={sugar}
                                    unit="g"
                                    onChangeText={setSugar}
                                />
                                <EditableNutrientRow
                                    label="Carbs"
                                    value={carbs}
                                    unit="g"
                                    onChangeText={setCarbs}
                                />
                                <EditableNutrientRow
                                    label="Protein"
                                    value={protein}
                                    unit="g"
                                    onChangeText={setProtein}
                                />
                                <EditableNutrientRow
                                    label="Fat"
                                    value={fat}
                                    unit="g"
                                    onChangeText={setFat}
                                />
                                <EditableNutrientRow
                                    label="Sodium"
                                    value={sodium}
                                    unit="mg"
                                    onChangeText={setSodium}
                                />
                                <EditableNutrientRow
                                    label="Fiber"
                                    value={fiber}
                                    unit="g"
                                    onChangeText={setFiber}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
                <FAB
                    icon={saving ? "loading" : "check"}
                    style={styles.fab}
                    onPress={handleSave}
                    disabled={saving || !foodName.trim()}
                    color={colors.text.inverse}
                />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    card: {
        backgroundColor: colors.cardBackground,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        color: colors.text.primary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    nameInput: {
        backgroundColor: colors.cardBackground,
    },
    servingInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    servingSizeInput: {
        flex: 2,
        backgroundColor: colors.cardBackground,
    },
    servingUnitInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    inputOutline: {
        borderColor: colors.border,
    },
    nutrientsContainer: {
        gap: 12,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    nutrientLabel: {
        fontSize: 16,
        color: colors.text.primary,
        flex: 1,
    },
    editableNutrientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        justifyContent: 'flex-end',
    },
    editableNutrientInput: {
        width: 80,
        height: 40,
        backgroundColor: colors.cardBackground,
        fontSize: 16,
    },
    editableInputOutline: {
        borderColor: colors.border,
        borderWidth: 1,
    },
    nutrientUnit: {
        fontSize: 16,
        color: colors.text.secondary,
        minWidth: 30,
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
