'use client';

import Link from 'next/link';
import { useAuth } from './auth-context';

export function Header() {
    const { user, loading, setShowLoginModal, handleLogout } = useAuth();

    return (
        <nav className="flex items-center justify-between gap-4 pt-6 pb-12 sm:pt-12 md:pb-24">
            <Link href="/" className="no-underline hover:opacity-80 transition">
                <h2 className="text-white font-bold tracking-tight">Smunch Bets</h2>
            </Link>
            <div className="flex items-center gap-3">
                {loading ? null : user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm" title={user.name || user.email}>
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-white/70 hover:text-white no-underline transition cursor-pointer"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="btn"
                    >
                        Log In
                    </button>
                )}
            </div>
        </nav>
    );
}
