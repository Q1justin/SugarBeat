import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Text, Card, TextInput, Button, Menu } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import type { FoodItem } from '../../services/api/usda';

const getNutrientValue = (food: FoodItem, nutrientId: number): number => {
    const nutrient = food.foodNutrients.find(n => n.nutrientId === nutrientId);
    return nutrient?.value ?? 0;
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
];

type ServingUnit = typeof SERVING_UNITS[number]['value'];

type Props = NativeStackScreenProps<RootStackParamList, 'FoodPage'>;

export const FoodPage = ({ route, navigation }: Props) => {
    const { food } = route.params;
    console.log("FOOD")
    console.log(food)
    const [servingSize, setServingSize] = useState(food.servingSize?.toString() ?? '100');
    const [servingUnit, setServingUnit] = useState<ServingUnit>(
        food.servingSizeUnit as ServingUnit ?? 'g'
    );
    const [menuVisible, setMenuVisible] = useState(false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Handle serving size input change
    const handleServingSizeChange = (text: string) => {
        // Only allow numbers and decimal point
        const filtered = text.replace(/[^0-9.]/g, '');
        setServingSize(filtered);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title
                    title={food.description}
                    subtitle={food.foodCategory}
                    titleStyle={styles.title}
                    subtitleStyle={styles.subtitle}
                />
                <Card.Content>
                    {/* Serving Size Input Section */}
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

                    <View style={styles.nutrientSection}>
                        <NutrientRow label="Total Sugars" value={getNutrientValue(food, 2000)} unit="g" />
                        <NutrientRow label="Added Sugars" value={getNutrientValue(food, 1235)} unit="g" />
                        <NutrientRow label="Calories" value={getNutrientValue(food, 1008)} unit="kcal" />
                        <NutrientRow label="Carbohydrates" value={getNutrientValue(food, 1005)} unit="g" />
                        <NutrientRow label="Protein" value={getNutrientValue(food, 1003)} unit="g" />
                        <NutrientRow label="Fat" value={getNutrientValue(food, 1004)} unit="g" />
                    </View>

                    {/* Log Food Button */}
                    <Button
                        mode="contained"
                        onPress={() => console.log('Log food pressed')}
                        style={styles.logButton}
                        contentStyle={styles.logButtonContent}
                    >
                        Log Food
                    </Button>
                </Card.Content>
            </Card>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        margin: 16,
        backgroundColor: colors.cardBackground,
    },
    title: {
        color: colors.text.primary,
        fontSize: 20,
        fontWeight: '600',
    },
    subtitle: {
        color: colors.text.secondary,
        fontSize: 14,
    },
    servingSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 8,
    },
    servingInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    servingSizeInput: {
        flex: 1,
        maxWidth: 100,
        backgroundColor: colors.cardBackground,
    },
    inputOutline: {
        borderColor: colors.border,
    },
    unitButton: {
        borderColor: colors.border,
        minWidth: 100,
        height: 56, // Match TextInput height
    },
    unitButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    menuContent: {
        backgroundColor: colors.cardBackground,
    },
    menuItemTitle: {
        color: colors.text.primary,
    },
    nutrientSection: {
        marginTop: 16,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    nutrientLabel: {
        color: colors.text.primary,
        fontSize: 16,
    },
    nutrientValue: {
        color: colors.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    logButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        marginTop: 8,
    },
    logButtonContent: {
        paddingVertical: 8,
    },
});
