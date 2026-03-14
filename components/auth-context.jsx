'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                const { getUser, handleAuthCallback } = await import('@netlify/identity');
                await handleAuthCallback();
                const currentUser = await getUser();
                setUser(currentUser);
            } catch {
                // Identity not configured or no user
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const handleLogin = useCallback(async (email, password) => {
        const { login } = await import('@netlify/identity');
        const loggedIn = await login(email, password);
        setUser(loggedIn);
        return loggedIn;
    }, []);

    const handleSignup = useCallback(async (email, password, name) => {
        const { signup } = await import('@netlify/identity');
        const newUser = await signup(email, password, { full_name: name });
        if (newUser.emailVerified) {
            setUser(newUser);
        }
        return newUser;
    }, []);

    const handleLogout = useCallback(async () => {
        const { logout } = await import('@netlify/identity');
        await logout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                showLoginModal,
                setShowLoginModal,
                handleLogin,
                handleSignup,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
