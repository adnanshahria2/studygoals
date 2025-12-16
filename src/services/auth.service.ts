import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, sanitizeEmail } from './firebase';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
    isNewUser?: boolean;
}

// Sign in existing user
export const signIn = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    try {
        const userId = sanitizeEmail(email);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { success: false, error: 'No account found with this email. Please create an account first.' };
        }

        const userData = userSnap.data();
        if (userData.password === password) {
            return {
                success: true,
                user: {
                    email: userData.email,
                    displayName: userData.displayName || email.split('@')[0],
                    createdAt: userData.createdAt
                }
            };
        } else {
            return { success: false, error: 'Incorrect password. Please try again.' };
        }
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Sign in failed. Please try again.' };
    }
};

// Create new account
export const createAccount = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    try {
        const userId = sanitizeEmail(email);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
        }

        // Validate password strength
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long.' };
        }

        const newUser = {
            email: email.toLowerCase(),
            password: password, // Plaintext as requested
            displayName: email.split('@')[0],
            createdAt: Date.now()
        };
        await setDoc(userRef, newUser);

        return {
            success: true,
            isNewUser: true,
            user: {
                email: newUser.email,
                displayName: newUser.displayName,
                createdAt: newUser.createdAt
            }
        };
    } catch (error) {
        console.error('Create account error:', error);
        return { success: false, error: 'Account creation failed. Please try again.' };
    }
};

// Get stored session
export const getStoredSession = (): User | null => {
    const stored = localStorage.getItem('lft_user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
};

// Store session
export const storeSession = (user: User): void => {
    localStorage.setItem('lft_user', JSON.stringify(user));
};

// Clear session
export const clearSession = (): void => {
    localStorage.removeItem('lft_user');
};
