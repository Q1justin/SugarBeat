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

type Props = NativeStackScreenProps<RootStackParamList, 'CreateRecipe'>;

export const CreateRecipeScreen = ({ route, navigation }: Props) => {
    const { user } = route.params;
    
    // Form state
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [servings, setServings] = useState('1');
    const [ingredients, setIngredients] = useState<string[]>(['']);
    const [instructions, setInstructions] = useState<string[]>(['']);
    
    const [saving, setSaving] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, '']);
    };

    const updateIngredient = (index: number, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
        }
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const updateInstruction = (index: number, value: string) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const removeInstruction = (index: number) => {
        if (instructions.length > 1) {
            setInstructions(instructions.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        if (!recipeName.trim()) {
            // TODO: Show error message
            return;
        }

        setSaving(true);
        try {
            // TODO: Implement recipe saving logic
            console.log('Saving recipe:', {
                name: recipeName,
                description,
                servings: parseInt(servings),
                ingredients: ingredients.filter(ing => ing.trim()),
                instructions: instructions.filter(inst => inst.trim()),
                isFavorite
            });
            
            navigation.goBack();
        } catch (error) {
            console.error('Error saving recipe:', error);
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
                        title="Create Recipe"
                        subtitle="Enter recipe details"
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
                        {/* Recipe Name Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recipe Name</Text>
                            <TextInput
                                mode="outlined"
                                value={recipeName}
                                onChangeText={setRecipeName}
                                style={styles.nameInput}
                                outlineStyle={styles.inputOutline}
                                placeholder="Enter recipe name"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>

                        {/* Description Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <TextInput
                                mode="outlined"
                                value={description}
                                onChangeText={setDescription}
                                style={styles.descriptionInput}
                                outlineStyle={styles.inputOutline}
                                placeholder="Enter recipe description (optional)"
                                multiline
                                numberOfLines={3}
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>

                        {/* Servings Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Servings</Text>
                            <TextInput
                                mode="outlined"
                                value={servings}
                                onChangeText={setServings}
                                keyboardType="numeric"
                                style={styles.servingsInput}
                                outlineStyle={styles.inputOutline}
                                placeholder="1"
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>

                        {/* Ingredients Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Ingredients</Text>
                                <IconButton
                                    icon="plus"
                                    size={20}
                                    onPress={addIngredient}
                                    iconColor={colors.primary}
                                />
                            </View>
                            {ingredients.map((ingredient, index) => (
                                <View key={index} style={styles.ingredientRow}>
                                    <TextInput
                                        mode="outlined"
                                        value={ingredient}
                                        onChangeText={(value) => updateIngredient(index, value)}
                                        style={styles.ingredientInput}
                                        outlineStyle={styles.inputOutline}
                                        placeholder={`Ingredient ${index + 1}`}
                                        returnKeyType="done"
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                    {ingredients.length > 1 && (
                                        <IconButton
                                            icon="close"
                                            size={20}
                                            onPress={() => removeIngredient(index)}
                                            iconColor={colors.error}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Instructions Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Instructions</Text>
                                <IconButton
                                    icon="plus"
                                    size={20}
                                    onPress={addInstruction}
                                    iconColor={colors.primary}
                                />
                            </View>
                            {instructions.map((instruction, index) => (
                                <View key={index} style={styles.instructionRow}>
                                    <Text style={styles.stepNumber}>{index + 1}.</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={instruction}
                                        onChangeText={(value) => updateInstruction(index, value)}
                                        style={styles.instructionInput}
                                        outlineStyle={styles.inputOutline}
                                        placeholder={`Step ${index + 1}`}
                                        multiline
                                        returnKeyType="done"
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                    {instructions.length > 1 && (
                                        <IconButton
                                            icon="close"
                                            size={20}
                                            onPress={() => removeInstruction(index)}
                                            iconColor={colors.error}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>
                <FAB
                    icon={saving ? "loading" : "check"}
                    style={styles.fab}
                    onPress={handleSave}
                    disabled={saving || !recipeName.trim()}
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
        flex: 1,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    nameInput: {
        backgroundColor: colors.cardBackground,
    },
    descriptionInput: {
        backgroundColor: colors.cardBackground,
    },
    servingsInput: {
        backgroundColor: colors.cardBackground,
        width: 100,
    },
    inputOutline: {
        borderColor: colors.border,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ingredientInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    stepNumber: {
        fontSize: 16,
        color: colors.text.secondary,
        marginRight: 8,
        marginTop: 16,
        minWidth: 20,
    },
    instructionInput: {
        flex: 1,
        backgroundColor: colors.cardBackground,
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
