import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = ['In Progress', 'Pending Punishment', 'Completed', 'Cancelled'];

export function ActionMenu({ bet, onEdit, onChangeStatus }) {
    const [open, setOpen] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
                setShowStatusMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative shrink-0" ref={menuRef}>
            <button
                onClick={() => { setOpen(!open); setShowStatusMenu(false); }}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                aria-label="Bet options"
            >
                <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
                    <circle cx="2" cy="2" r="2" />
                    <circle cx="2" cy="8" r="2" />
                    <circle cx="2" cy="14" r="2" />
                </svg>
            </button>
            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-10">
                    <button
                        onClick={() => { onEdit(bet); setOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                        Edit Bet
                    </button>
                    <button
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-between"
                    >
                        Change Status
                        <svg className={`w-3 h-3 transition-transform ${showStatusMenu ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    {showStatusMenu && (
                        <div className="border-t border-neutral-100">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => { onChangeStatus(bet.id, status); setOpen(false); setShowStatusMenu(false); }}
                                    className={`w-full text-left px-6 py-1.5 text-sm transition-colors ${
                                        bet.status === status ? 'text-primary font-semibold bg-neutral-50' : 'text-neutral-600 hover:bg-neutral-50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}