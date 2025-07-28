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

/*
 * FRIENDS SYSTEM IMPLEMENTATION NOTES:
 * 
 * Current implementation uses the friend_connections table to manage friendships.
 * Due to Supabase RLS restrictions, we cannot directly query auth.users from client-side.
 * 
 * Current approach:
 * - Uses simplified user display names based on user ID prefixes
 * - All functions now query real data from friend_connections table
 * - No more mock data fallbacks
 * 
 * Future improvements could include:
 * 1. Create a user_profiles table for storing display names, avatars, etc.
 * 2. Implement RPC functions for secure user data access
 * 3. Add user search functionality by email/username
 * 4. Add notification system for friend requests
 */

// Get all friends for a user (accepted connections)
export async function getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase
        .from('friend_connections')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) throw error;

    if (!data || data.length === 0) {
        return [];
    }

    // Map connections to friends
    // Note: Since we can't easily access auth.users from client-side due to RLS,
    // we'll use a simplified approach with user IDs and generate display names
    const friends: Friend[] = data.map(connection => {
        const friendId = connection.requester_id === userId 
            ? connection.addressee_id 
            : connection.requester_id;
        
        // Generate a friendlier display based on the user ID
        const userPrefix = friendId.slice(0, 8);
        
        return {
            id: friendId,
            email: `user-${userPrefix}@app.com`, // Simplified email representation
            display_name: `User ${userPrefix}`, // Simplified display name
            connection_status: connection.status,
            connection_id: connection.id,
            connected_since: connection.created_at,
        };
    });

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

    if (!data || data.length === 0) {
        return [];
    }

    // Map requests to friends with simplified user data
    const requests: Friend[] = data.map(connection => {
        const userPrefix = connection.requester_id.slice(0, 8);
        
        return {
            id: connection.requester_id,
            email: `user-${userPrefix}@app.com`, // Simplified email representation
            display_name: `User ${userPrefix}`, // Simplified display name
            connection_status: connection.status,
            connection_id: connection.id,
            connected_since: connection.created_at,
        };
    });

    return requests;
}

// Send a friend request
export async function sendFriendRequest(requesterId: string, addresseeId: string): Promise<void> {
    // Check if connection already exists
    const { data: existingConnection, error: checkError } = await supabase
        .from('friend_connections')
        .select('*')
        .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`)
        .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingConnection) {
        throw new Error('Friend connection already exists');
    }
    
    // Create the friend request
    const { error } = await supabase
        .from('friend_connections')
        .insert({
            requester_id: requesterId,
            addressee_id: addresseeId,
            status: 'pending'
        });
    
    if (error) throw error;
}

// Accept a friend request
export async function acceptFriendRequest(connectionId: string): Promise<void> {
    const { error } = await supabase
        .from('friend_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
    
    if (error) throw error;
}

// Reject a friend request
export async function rejectFriendRequest(connectionId: string): Promise<void> {
    const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', connectionId);
    
    if (error) throw error;
}

// Remove a friend (delete the connection)
export async function removeFriend(connectionId: string): Promise<void> {
    const { error } = await supabase
        .from('friend_connections')
        .delete()
        .eq('id', connectionId);
    
    if (error) throw error;
}
