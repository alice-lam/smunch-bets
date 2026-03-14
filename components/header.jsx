import Link from 'next/link';

export function Header() {
    return (
        <nav className="flex items-center gap-4 pt-6 pb-12 sm:pt-12 md:pb-24">
            <Link href="/" className="no-underline hover:opacity-80 transition">
                <h2 className="text-white font-bold tracking-tight">Smunch Bets</h2>
            </Link>
        </nav>
    );
}
