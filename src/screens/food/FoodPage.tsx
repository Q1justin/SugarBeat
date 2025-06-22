import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Text, Card, TextInput, Button, Menu, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import type { FoodItem } from '../../services/api/edamam';
import { logFoodEntry } from '../../services/supabase/queries/food';

const getNutrientValue = (food: FoodItem, nutrientKey: keyof typeof food.nutrients): number => {
    return food.nutrients[nutrientKey]?.quantity ?? 0;
};

const NutrientRow = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
    <View style={styles.nutrientRow}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>{value.toFixed(1)} {unit}</Text>
    </View>
);

// Common serving units
const SERVING_UNITS = [
    { value: 'g', label: 'g' },
    { value: 'ml', label: 'ml' },
    { value: 'oz', label: 'oz' },
    { value: 'cup', label: 'cup' },
    { value: 'tbsp', label: 'tbsp' }
] as const;

type ServingUnit = typeof SERVING_UNITS[number]['value'];

type Props = NativeStackScreenProps<RootStackParamList, 'FoodPage'>;

export const FoodPage = ({ route, navigation }: Props) => {
    const { food, isLoggedFood, user } = route.params;
    const [servingSize, setServingSize] = useState(food.servingSize?.toString() ?? '100');
    const [servingUnit, setServingUnit] = useState<ServingUnit>(
        (food.servingSizeUnit as ServingUnit) ?? 'g'
    );
    const [menuVisible, setMenuVisible] = useState(false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Handle serving size input change
    const handleServingSizeChange = (text: string) => {
        // Only allow numbers and decimal point
        const filtered = text.replace(/[^0-9.]/g, '');
        setServingSize(filtered);
    };

    const handleFoodLog = async () => {
        const foodEntry = {
            edamamFoodId: food.foodId,
            // recipeId
            servingSize: Number(servingSize),
            servingUnit: servingUnit
        }
        await logFoodEntry(user.id, foodEntry)
        .then(data => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        })
        .catch(error => {
            console.error('Error logging food:', error);
            // Optionally show an error message to the user
        });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <Card style={styles.card}>
                    <Card.Title
                        title={food.label}
                        subtitle={food.category}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subtitle}
                        left={props => 
                            food.image ? (
                                <Image 
                                    source={{ uri: food.image }} 
                                    style={styles.foodImage} 
                                />
                            ) : null
                        }
                    />
                    <Card.Content>
                        <View style={styles.servingSection}>
                            <Text style={styles.sectionTitle}>Serving Size</Text>
                            <View style={styles.servingInputRow}>
                                <TextInput
                                    mode="outlined"
                                    value={servingSize}
                                    onChangeText={handleServingSizeChange}
                                    keyboardType="decimal-pad"
                                    style={styles.servingSizeInput}
                                    outlineStyle={styles.inputOutline}
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
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
                                        {servingUnit}
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
                                        {SERVING_UNITS.map((unit) => (
                                            <Menu.Item
                                                key={unit.value}
                                                onPress={() => {
                                                    setServingUnit(unit.value);
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
                            <NutrientRow 
                                label="Total Sugars" 
                                value={getNutrientValue(food, 'SUGAR')} 
                                unit="g" 
                            />
                            <NutrientRow 
                                label="Calories" 
                                value={getNutrientValue(food, 'ENERC_KCAL')} 
                                unit="kcal" 
                            />
                            <NutrientRow 
                                label="Carbohydrates" 
                                value={getNutrientValue(food, 'CHOCDF')} 
                                unit="g" 
                            />
                            <NutrientRow 
                                label="Protein" 
                                value={getNutrientValue(food, 'PROCNT')} 
                                unit="g" 
                            />
                            <NutrientRow 
                                label="Fat" 
                                value={getNutrientValue(food, 'FAT')} 
                                unit="g" 
                            />
                        </View>
                    </Card.Content>
                </Card>
                <FAB
                    icon="plus"
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
