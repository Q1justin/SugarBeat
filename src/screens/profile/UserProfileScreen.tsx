import { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { Text, Card, Button, Divider, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import { signOut } from '../../services/supabase/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = ({ route, navigation }: Props) => {
    const { user } = route.params;
    
    // User profile state
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            // Navigation will be handled automatically by auth state change
                        } catch (error) {
                            console.error('Error signing out:', error);
                            Alert.alert('Error', 'Failed to sign out. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement account deletion
                        Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
                    },
                },
            ]
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        iconColor={colors.text.primary}
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.content}>
                    {/* Profile Information Card */}
                    <Card style={styles.card}>
                        <Card.Title
                            title="Profile Information"
                            titleStyle={styles.cardTitle}
                        />
                        <Card.Content>
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Email</Text>
                                <Text style={styles.fieldValue}>{email}</Text>
                                <Text style={styles.fieldNote}>
                                    Email cannot be changed from this screen
                                </Text>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>Member Since</Text>
                                <Text style={styles.fieldValue}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Account Actions Card */}
                    <Card style={styles.card}>
                        <Card.Title
                            title="Account Actions"
                            titleStyle={styles.cardTitle}
                        />
                        <Card.Content>
                            <Button
                                mode="outlined"
                                onPress={handleSignOut}
                                style={[styles.actionButton, styles.signOutButton]}
                                contentStyle={styles.buttonContent}
                                icon="logout"
                            >
                                Sign Out
                            </Button>
                            
                            <Divider style={styles.divider} />
                            
                            <Button
                                mode="outlined"
                                onPress={handleDeleteAccount}
                                style={[styles.actionButton, styles.deleteButton]}
                                contentStyle={styles.buttonContent}
                                buttonColor="transparent"
                                textColor={colors.error}
                                icon="delete-forever"
                            >
                                Delete Account
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40, // Same width as IconButton to center the title
    },
    content: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: colors.cardBackground,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        color: colors.text.primary,
    },
    fieldNote: {
        fontSize: 12,
        color: colors.text.secondary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    actionButton: {
        marginVertical: 4,
    },
    signOutButton: {
        borderColor: colors.primary,
    },
    deleteButton: {
        borderColor: colors.error,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    divider: {
        marginVertical: 12,
        backgroundColor: colors.border,
    },
});
