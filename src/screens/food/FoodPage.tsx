import { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Text, Card, TextInput, Button, Menu, FAB, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import type { FoodItem } from '../../services/api/edamam';
import { logFoodEntry, updateFoodEntry, addToFavorites, removeFromFavorites, isFoodFavorited } from '../../services/supabase/queries/food';

// Convert FoodEntry to FoodItem format for editing
const convertFoodEntryToFoodItem = (foodEntry: any): FoodItem => {
    // Check if it's from custom_foods, recipes, or Edamam
    if (foodEntry.custom_foods) {
        const customFood = foodEntry.custom_foods;
        return {
            foodId: customFood.id,
            label: customFood.name,
            category: 'Custom Food',
            nutrients: {
                sugar: { quantity: customFood.nutrition_values?.sugar?.quantity || 0, unit: 'g' },
                addedSugar: { quantity: foodEntry.added_sugar || 0, unit: 'g' },
                calories: { quantity: foodEntry.calories || 0, unit: 'kcal' },
                protein: { quantity: foodEntry.protein || 0, unit: 'g' },
                carbs: { quantity: customFood.nutrition_values?.carbs?.quantity || 0, unit: 'g' },
                fat: { quantity: customFood.nutrition_values?.fat?.quantity || 0, unit: 'g' },
                sodium: { quantity: customFood.nutrition_values?.sodium?.quantity || 0, unit: 'mg' },
                fiber: { quantity: customFood.nutrition_values?.fiber?.quantity || 0, unit: 'g' },
            },
            servingSizes: [],
            servingSize: foodEntry.serving_size || 100,
            servingSizeUnit: foodEntry.serving_unit || 'g',
            image: undefined,
        };
    } else if (foodEntry.recipes) {
        const recipe = foodEntry.recipes;
        return {
            foodId: recipe.id,
            label: recipe.name,
            category: 'Recipe',
            nutrients: {
                sugar: { quantity: 0, unit: 'g' },
                addedSugar: { quantity: foodEntry.added_sugar || 0, unit: 'g' },
                calories: { quantity: foodEntry.calories || 0, unit: 'kcal' },
                protein: { quantity: foodEntry.protein || 0, unit: 'g' },
                carbs: { quantity: 0, unit: 'g' },
                fat: { quantity: 0, unit: 'g' },
                sodium: { quantity: 0, unit: 'mg' },
                fiber: { quantity: 0, unit: 'g' },
            },
            servingSizes: [],
            servingSize: foodEntry.serving_size || 1,
            servingSizeUnit: foodEntry.serving_unit || 'serving',
            image: undefined,
        };
    } else {
        // Assume it's from Edamam
        return {
            foodId: foodEntry.edamam_food_id || '',
            label: foodEntry.name,
            category: 'Food Database',
            nutrients: {
                sugar: { quantity: 0, unit: 'g' },
                addedSugar: { quantity: foodEntry.added_sugar || 0, unit: 'g' },
                calories: { quantity: foodEntry.calories || 0, unit: 'kcal' },
                protein: { quantity: foodEntry.protein || 0, unit: 'g' },
                carbs: { quantity: 0, unit: 'g' },
                fat: { quantity: 0, unit: 'g' },
                sodium: { quantity: 0, unit: 'mg' },
                fiber: { quantity: 0, unit: 'g' },
            },
            servingSizes: [],
            servingSize: foodEntry.serving_size || 100,
            servingSizeUnit: foodEntry.serving_unit || 'g',
            image: undefined,
        };
    }
};

const getNutrientValue = (food: FoodItem, nutrientKey: keyof typeof food.nutrients): number => {
    return food.nutrients[nutrientKey]?.quantity ?? 0;
};

const NutrientRow = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
    <View style={styles.nutrientRow}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>{value.toFixed(1)} {unit}</Text>
    </View>
);

const EditableNutrientRow = ({
    label, 
    value, 
    unit, 
    onChangeText 
}: { 
    label: string; 
    value: string; 
    unit: string; 
    onChangeText: (text: string) => void; 
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
            />
            <Text style={styles.nutrientUnit}>{unit}</Text>
        </View>
    </View>
);

const SERVING_UNITS = {
    'Gram': 'g',
    'Milliliter': 'ml',
    'Ounce': 'oz',
    'Cup': 'cup',
    'Tablespoon': 'tbsp',
} as const;

type Props = NativeStackScreenProps<RootStackParamList, 'FoodPage'>;

type ScaledNutrients = {
    addedSugar: number;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    sodium: number;
    fiber: number;
};

export const FoodPage = ({ route, navigation }: Props) => {
    const { food, foodEntry, isLoggedFood, user } = route.params;
    
    // Convert foodEntry to FoodItem format if we're editing an existing entry
    const currentFood = foodEntry ? convertFoodEntryToFoodItem(foodEntry) : food;
    
    if (!currentFood) {
        throw new Error('No food data provided');
    }
    
    const [originalServingSize] = useState(currentFood?.servingSizes.length > 0 ? currentFood?.servingSizes[0].quantity : currentFood.servingSize || 100);
    const [servingSize, setServingSize] = useState(originalServingSize?.toString() || "0");
    const [servingUnit, setServingUnit] = useState(currentFood?.servingSizes.length > 0 ? currentFood?.servingSizes[0].label : currentFood.servingSizeUnit || 'g');
    const [menuVisible, setMenuVisible] = useState(false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [addedSugarValue, setAddedSugarValue] = useState(getNutrientValue(currentFood, 'addedSugar').toString() || "0");
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [scaledNutrients, setScaledNutrients] = useState<ScaledNutrients>({
        addedSugar: getNutrientValue(currentFood, 'addedSugar'),
        calories: getNutrientValue(currentFood, 'calories'),
        carbs: getNutrientValue(currentFood, 'carbs'),
        protein: getNutrientValue(currentFood, 'protein'),
        fat: getNutrientValue(currentFood, 'fat'),
        sodium: getNutrientValue(currentFood, 'sodium'),
        fiber: getNutrientValue(currentFood, 'fiber'),
    });

    const checkFavoriteStatus = async () => {
        try {
            const favoriteStatus = await isFoodFavorited(
                user.id,
                currentFood.category === 'Custom Food' ? undefined : currentFood.foodId,
                currentFood.category === 'Custom Food' ? currentFood.foodId : undefined
            );
            setIsFavorite(favoriteStatus);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    // Check if food is favorited on component mount
    useEffect(() => {
        checkFavoriteStatus();
    }, []);

    const handleFavoriteToggle = async () => {
        setFavoriteLoading(true);
        try {
            if (isFavorite) {
                // Remove from favorites
                await removeFromFavorites(
                    user.id,
                    currentFood.category === 'Custom Food' ? undefined : currentFood.foodId,
                    currentFood.category === 'Custom Food' ? currentFood.foodId : undefined
                );
                setIsFavorite(false);
            } else {
                // Add to favorites
                await addToFavorites(user.id, {
                    name: currentFood.label,
                    edamamFoodId: currentFood.category === 'Custom Food' ? undefined : currentFood.foodId,
                    customFoodId: currentFood.category === 'Custom Food' ? currentFood.foodId : undefined,
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Handle serving size input change
    const handleServingSizeTextChange = (value: string) => {
        setServingSize(value);
    };

    // Calculate and update nutrients when user finishes editing serving size
    const handleServingSizeBlur = () => {
        // Calculate scaling factor based on original serving size
        const newServingSize = parseFloat(servingSize) || 0;
        const scalingFactor = newServingSize / originalServingSize;

        // Update added sugar value based on scaling
        const newAddedSugarValue = getNutrientValue(currentFood, 'addedSugar') * scalingFactor;
        setAddedSugarValue(newAddedSugarValue.toString());

        // Scale all nutrients by the scaling factor
        setScaledNutrients({
            addedSugar: newAddedSugarValue,
            calories: getNutrientValue(currentFood, 'calories') * scalingFactor,
            carbs: getNutrientValue(currentFood, 'carbs') * scalingFactor,
            protein: getNutrientValue(currentFood, 'protein') * scalingFactor,
            fat: getNutrientValue(currentFood, 'fat') * scalingFactor,
            sodium: getNutrientValue(currentFood, 'sodium') * scalingFactor,
            fiber: getNutrientValue(currentFood, 'fiber') * scalingFactor,
        });
    };

    // Handle sugar input change
    const handleSugarChange = (value: string) => {
        setAddedSugarValue(value);
        // Update the scaled nutrients with the new sugar value
        setScaledNutrients(prev => ({
            ...prev,
            addedSugar: parseFloat(value) || 0,
        }));
    };

    const handleFoodLog = async () => {
        try {
            // Check if we're editing an existing entry
            if (isLoggedFood && foodEntry) {
                // Update existing food entry
                const updateData = {
                    servingSize: parseFloat(servingSize),
                    servingUnit: servingUnit,
                    calories: scaledNutrients.calories,
                    addedSugar: parseFloat(addedSugarValue) || 0,
                    protein: scaledNutrients.protein,
                };
                
                await updateFoodEntry(foodEntry.id, updateData);
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
                return;
            }
            
            // Create new food entry
            // Determine the food type and set appropriate ID
            let edamamFoodId = undefined;
            let customFoodId = undefined;
            let recipeId = undefined;

            // Check if this is a custom food based on category
            if (currentFood.category === 'Custom Food') {
                customFoodId = currentFood.foodId;
            }
            // Check if this is a recipe based on category
            else if (currentFood.category === 'Recipe') {
                recipeId = currentFood.foodId;
            }
            // Otherwise, assume it's from Edamam
            else {
                edamamFoodId = currentFood.foodId;
            }

            const logEntry = {
                name: currentFood.label || "",
                edamamFoodId,
                customFoodId,
                recipeId,
                servingSize: parseFloat(servingSize),
                servingUnit: servingUnit,
                calories: scaledNutrients.calories,
                addedSugar: parseFloat(addedSugarValue) || 0,
                protein: scaledNutrients.protein,
            };

            await logFoodEntry(user.id, logEntry);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('Error logging food:', error);
        }
    };

    const getStandardUnit = (apiUnit: string): string => {
        // Find the matching key (case-insensitive)
        const match = Object.entries(SERVING_UNITS).find(
            ([key]) => key.toLowerCase() === apiUnit.toLowerCase()
        );
        // Return the abbreviated value if found, otherwise return original
        return match ? match[1] : apiUnit;
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <Card style={styles.card}>
                    <Card.Title
                        title={currentFood.label}
                        subtitle={currentFood.category}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        left={props => 
                            currentFood.image ? (
                                <Image 
                                    source={{ uri: currentFood.image }} 
                                    style={styles.foodImage} 
                                />
                            ) : null
                        }
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
                        <View style={styles.servingSection}>
                            <Text style={styles.sectionTitle}>Serving Size</Text>
                            <View style={styles.servingInputRow}>
                                <TextInput
                                    mode="outlined"
                                    value={servingSize}
                                    onChangeText={handleServingSizeTextChange}
                                    onBlur={handleServingSizeBlur}
                                    keyboardType="decimal-pad"
                                    style={styles.servingSizeInput}
                                    outlineStyle={styles.inputOutline}
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                        handleServingSizeBlur();
                                    }}
                                />
                                <View>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setMenuVisible(true)}
                                        style={styles.unitButton}
                                        contentStyle={styles.unitButtonContent}
                                        onLayout={(event) => {
                                            const { x, y, width, height } = event.nativeEvent.layout;
                                            setButtonLayout({ x, y, width, height });
                                        }}
                                    >
                                        {getStandardUnit(servingUnit) ?? servingUnit}
                                        <MaterialIcons 
                                            name="arrow-drop-down" 
                                            size={24} 
                                            color={colors.text.primary}
                                            style={{ marginLeft: 4 }}
                                        />
                                    </Button>
                                    <Menu
                                        visible={menuVisible}
                                        onDismiss={() => setMenuVisible(false)}
                                        anchor={buttonLayout}
                                    >
                                        {currentFood?.servingSizes.map((unit) => (
                                            <Menu.Item
                                                key={unit.label}
                                                onPress={() => {
                                                    setServingUnit(unit.label);
                                                    setMenuVisible(false);
                                                }}
                                                title={unit.label}
                                            />
                                        ))}
                                    </Menu>
                                </View>
                            </View>
                        </View>

                        {/* Nutrition Facts Section */}
                        <View style={styles.nutrientSection}>
                            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                            <View style={styles.nutrientsContainer}>
                                <EditableNutrientRow
                                    label="Added Sugar"
                                    value={addedSugarValue}
                                    unit="g"
                                    onChangeText={handleSugarChange}
                                />
                                <NutrientRow
                                    label="Calories"
                                    value={scaledNutrients.calories}
                                    unit="kcal"
                                />
                                <NutrientRow
                                    label="Carbs"
                                    value={scaledNutrients.carbs}
                                    unit="g"
                                />
                                <NutrientRow
                                    label="Protein"
                                    value={scaledNutrients.protein}
                                    unit="g"
                                />
                                <NutrientRow
                                    label="Fat"
                                    value={scaledNutrients.fat}
                                    unit="g"
                                />
                                <NutrientRow
                                    label="Sodium"
                                    value={scaledNutrients.sodium}
                                    unit="mg"
                                />
                                <NutrientRow
                                    label="Fiber"
                                    value={scaledNutrients.fiber}
                                    unit="g"
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
                <FAB
                    icon={isLoggedFood ? "content-save" : "plus"}
                    label={isLoggedFood ? "Save Changes" : "Log Food"}
                    style={styles.fab}
                    onPress={handleFoodLog}
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
    foodImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    servingSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    servingInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    servingSizeInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    inputOutline: {
        borderColor: colors.border,
    },
    unitButton: {
        borderColor: colors.border,
    },
    unitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nutrientSection: {
        gap: 8,
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
    },
    nutrientValue: {
        fontSize: 16,
        color: colors.text.secondary,
    },
    editableNutrientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        minWidth: 20,
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
