import { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    FlatList,
} from 'react-native';
import { Text, Card, Button, Divider, IconButton, List, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { colors } from '../../theme/colors';
import { signOut } from '../../services/supabase/auth';
import { getFriends, getPendingFriendRequests, type Friend } from '../../services/supabase/queries/friends';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = ({ route, navigation }: Props) => {
    const { user } = route.params;
    
    // User profile state
    const [email, setEmail] = useState(user?.email || '');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Friends state
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(true);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setFriendsLoading(true);
            const [friendsData, requestsData] = await Promise.all([
                getFriends(user.id),
                getPendingFriendRequests(user.id)
            ]);
            setFriends(friendsData);
            setPendingRequests(requestsData);
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setFriendsLoading(false);
        }
    };
    
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

                    {/* Friends Section */}
                    <Card style={styles.card}>
                        <Card.Title
                            title={`Friends (${friends.length})`}
                            titleStyle={styles.cardTitle}
                            right={props => (
                                <IconButton
                                    icon="account-plus"
                                    size={20}
                                    iconColor={colors.primary}
                                    onPress={() => {
                                        // TODO: Add friend functionality
                                        Alert.alert('Coming Soon', 'Add friend functionality will be available soon!');
                                    }}
                                />
                            )}
                        />
                        <Card.Content>
                            {friendsLoading ? (
                                <Text style={styles.loadingText}>Loading friends...</Text>
                            ) : (
                                <>
                                    {/* Pending Friend Requests */}
                                    {pendingRequests.length > 0 && (
                                        <View style={styles.pendingSection}>
                                            <Text style={styles.sectionSubtitle}>Pending Requests ({pendingRequests.length})</Text>
                                            {pendingRequests.map((request) => (
                                                <View key={request.connection_id} style={styles.friendItem}>
                                                    <View style={styles.friendInfo}>
                                                        <MaterialCommunityIcons 
                                                            name="account-circle" 
                                                            size={32} 
                                                            color={colors.primary} 
                                                        />
                                                        <View style={styles.friendDetails}>
                                                            <Text style={styles.friendName}>
                                                                {request.display_name || request.email}
                                                            </Text>
                                                            <Text style={styles.friendEmail}>{request.email}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                            <Divider style={styles.sectionDivider} />
                                        </View>
                                    )}

                                    {/* Friends List */}
                                    {friends.length > 0 ? (
                                        <View style={styles.friendsList}>
                                            <Text style={styles.sectionSubtitle}>Your Friends</Text>
                                            {friends.map((friend) => (
                                                <View key={friend.connection_id} style={styles.friendItem}>
                                                    <View style={styles.friendInfo}>
                                                        <MaterialCommunityIcons 
                                                            name="account-circle" 
                                                            size={32} 
                                                            color={colors.primary} 
                                                        />
                                                        <View style={styles.friendDetails}>
                                                            <Text style={styles.friendName}>
                                                                {friend.display_name || friend.email}
                                                            </Text>
                                                            <Text style={styles.friendEmail}>{friend.email}</Text>
                                                            <Text style={styles.friendSince}>
                                                                Friends since {new Date(friend.connected_since).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <MaterialCommunityIcons 
                                                name="account-group" 
                                                size={48} 
                                                color={colors.text.secondary} 
                                            />
                                            <Text style={styles.emptyStateText}>No friends yet</Text>
                                            <Text style={styles.emptyStateSubtext}>
                                                Add friends to share your nutrition journey!
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
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
    loadingText: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingVertical: 16,
    },
    pendingSection: {
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    sectionDivider: {
        marginVertical: 16,
        backgroundColor: colors.border,
    },
    friendsList: {
        // Container for friends list
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: colors.background,
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    friendDetails: {
        marginLeft: 12,
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    friendEmail: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    friendSince: {
        fontSize: 12,
        color: colors.text.secondary,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.secondary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
});
