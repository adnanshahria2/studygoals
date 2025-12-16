import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

type AuthMode = 'signin' | 'create';

export const LoginScreen: React.FC = () => {
    const { signIn, createAccount, isLoading, error } = useAuth();
    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Basic validation
        if (!email.trim()) {
            setLocalError('Please enter your email');
            return;
        }
        if (!email.includes('@')) {
            setLocalError('Please enter a valid email');
            return;
        }
        if (!password.trim()) {
            setLocalError('Please enter your password');
            return;
        }

        if (mode === 'create') {
            // Additional validation for create account
            if (password.length < 6) {
                setLocalError('Password must be at least 6 characters');
                return;
            }
            if (password !== confirmPassword) {
                setLocalError('Passwords do not match');
                return;
            }
            await createAccount(email.trim(), password);
        } else {
            await signIn(email.trim(), password);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setLocalError('');
        setConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Study
                            <span className="bg-gradient-to-r from-accent-green to-accent-blue bg-clip-text text-transparent">
                                Goals
                            </span>
                        </h1>
                        <p className="text-gray-400">
                            {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
                        </p>
                    </div>

                    {/* Auth Mode Tabs */}
                    <div className="flex mb-6 bg-bg-hover rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => switchMode('signin')}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${mode === 'signin'
                                    ? 'bg-accent-blue text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode('create')}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${mode === 'create'
                                    ? 'bg-accent-green text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                placeholder="your@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
                                placeholder="••••••••"
                                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                            />
                        </div>

                        {mode === 'create' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-bg-hover border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 transition-all"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>
                        )}

                        {(localError || error) && (
                            <div className="p-3 bg-accent-red/10 border border-accent-red/50 rounded-lg text-accent-red text-sm">
                                {localError || error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        {mode === 'signin'
                            ? "Don't have an account? Click 'Create Account' above."
                            : 'Already have an account? Click "Sign In" above.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};
