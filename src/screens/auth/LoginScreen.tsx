import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../../services/supabase/auth';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    // Basic validation on user input presence
    if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
    }

    try {
        setLoading(true);
        if (isSignUp) {
            await signUpWithEmail(email, password);
            Alert.alert('Success', 'Please check your email to confirm your account');
        } else {
            // Login case
            await signInWithEmail(email, password);
        }
        // On success, we'll handle navigation in App.tsx
    } 
    catch (error: any) {
        Alert.alert('Error', error.message || `Failed to ${isSignUp ? 'sign up' : 'sign in'}`);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
    >
        <View style={styles.form}>
            <Text style={styles.title}>SugarBeat</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity 
                style={styles.button}
                onPress={handleAuth}
                disabled={loading} // Disable button while loading
            >
                <Text style={styles.buttonText}>
                    {
                        loading 
                        ? 'Processing...' 
                        : isSignUp 
                        ? 'Sign Up' 
                        : 'Sign In'
                    }
                </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.switchButton}
                onPress={() => setIsSignUp(!isSignUp)}
            >
                <Text style={styles.switchButtonText}>
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Text>
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    form: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
        button: {
        height: 50,
        backgroundColor: '#2563eb',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        padding: 10,
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#2563eb',
        fontSize: 14,
    },
});
