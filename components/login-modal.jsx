'use client';

import { useState } from 'react';
import { useAuth } from './auth-context';

export function LoginModal() {
    const { showLoginModal, setShowLoginModal, handleLogin, handleSignup } = useAuth();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!showLoginModal) return null;

    function resetForm() {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setMessage('');
    }

    function closeModal() {
        resetForm();
        setShowLoginModal(false);
        setIsSignup(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isSignup) {
                const user = await handleSignup(email, password, name);
                if (user.emailVerified) {
                    closeModal();
                } else {
                    setMessage('Check your email to confirm your account.');
                }
            } else {
                await handleLogin(email, password);
                closeModal();
            }
        } catch (err) {
            if (err.status === 401) {
                setError('Invalid email or password.');
            } else if (err.status === 403) {
                setError('Signups are not allowed for this site.');
            } else if (err.status === 422) {
                setError('Invalid input. Check your email and password.');
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="fixed inset-0 bg-black/60" />
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 no-underline"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <h3 className="text-neutral-900 mb-6">{isSignup ? 'Create Account' : 'Log In'}</h3>

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {isSignup && (
                        <input
                            type="text"
                            placeholder="Full name"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button type="submit" className="btn btn-lg" disabled={loading}>
                        {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-neutral-500">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                            setMessage('');
                        }}
                        className="text-primary font-semibold no-underline hover:opacity-80 cursor-pointer"
                    >
                        {isSignup ? 'Log In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
}
