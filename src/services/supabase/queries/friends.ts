import { supabase } from '../client';
import { Database } from '../../../types/supabase';

// Type definitions
type FriendConnection = Database['public']['Tables']['friend_connections']['Row'];

export interface Friend {
    id: string;
    email: string;
    display_name?: string;
    connection_status: string;
    connection_id: string;
    connected_since: string;
}

// Get all friends for a user (accepted connections)
export async function getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) throw error;

    // For now, return mock data since we can't easily query auth.users
    // In a real app, you'd need to store user profile data in a separate table
    const friends: Friend[] = data.map((connection, index) => {
        const friendId = connection.requester_id === userId 
            ? connection.addressee_id 
            : connection.requester_id;

        return {
            id: friendId,
            email: `friend${index + 1}@example.com`, // Mock email
            display_name: `Friend ${index + 1}`, // Mock display name
            connection_status: connection.status,
            connection_id: connection.id,
            connected_since: connection.created_at,
        };
    });

    // Add some mock friends for testing (you can remove this later)
    if (friends.length === 0) {
        return [
            {
                id: 'mock-friend-1',
                email: 'john.doe@example.com',
                display_name: 'John Doe',
                connection_status: 'accepted',
                connection_id: 'mock-connection-1',
                connected_since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            },
            {
                id: 'mock-friend-2',
                email: 'jane.smith@example.com',
                display_name: 'Jane Smith',
                connection_status: 'accepted',
                connection_id: 'mock-connection-2',
                connected_since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            },
        ];
    }

    return friends;
}

// Get pending friend requests (received)
export async function getPendingFriendRequests(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .eq('addressee_id', userId)
        .eq('status', 'pending');

    if (error) throw error;

    // For now, return mock data
    const requests: Friend[] = data.map((connection, index) => ({
        id: connection.requester_id,
        email: `requester${index + 1}@example.com`, // Mock email
        display_name: `Requester ${index + 1}`, // Mock display name
        connection_status: connection.status,
        connection_id: connection.id,
        connected_since: connection.created_at,
    }));

    // Add a mock pending request for testing (you can remove this later)
    if (requests.length === 0) {
        return [
            {
                id: 'mock-requester-1',
                email: 'alex.wilson@example.com',
                display_name: 'Alex Wilson',
                connection_status: 'pending',
                connection_id: 'mock-pending-1',
                connected_since: new Date().toISOString(),
            },
        ];
    }

    return requests;
}
