'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'components/card';
import { getData } from 'app/actions';

const sampleBets = [
    { id: 1, title: 'Connally makes SciOly state', creator: 'Alice', stake: '$20', status: 'Pending', participants: ['Alice', 'Bob'] },
    { id: 2, title: 'It rains on Friday', creator: 'Bob', stake: 'Lunch', status: 'Completed', participants: ['Bob', 'Charlie'], notes: 'Bob: yes, Charlie: no' },
    { id: 3, title: 'New feature ships by end of sprint', creator: 'Charlie', stake: '1 shot', status: 'Cancelled', participants: ['Charlie'] }
];

const STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

function BetMenu({ bet, onEdit, onChangeStatus }) {
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
        <div className="relative shrink-0" style={{ alignSelf: 'center'}} ref={menuRef}>
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

export default function Page() {
    const [bets, setBets] = useState(sampleBets);
    const [showForm, setShowForm] = useState(false);
    const [newBet, setNewBet] = useState({ title: '', creator: '', stake: '', participantInput: '', notes: '' });
    const [editingBet, setEditingBet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const data = await getData();
            console.log(data);
            setBets(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    function handleAddBet(e) {
        e.preventDefault();
        if (!newBet.title || !newBet.creator || !newBet.stake) return;

        const participants = newBet.participantInput
            ? newBet.participantInput.split(',').map((p) => p.trim()).filter(Boolean)
            : [];

        // Include the creator if not already listed
        if (!participants.some((p) => p.toLowerCase() === newBet.creator.toLowerCase())) {
            participants.unshift(newBet.creator);
        }

        setBets([...bets, { id: Date.now(), title: newBet.title, creator: newBet.creator, stake: newBet.stake, participants, notes: newBet.notes, status: 'Active' }]);
        setNewBet({ title: '', creator: '', stake: '', participantInput: '', notes: '' });
        setShowForm(false);
    }

    function handleEditBet(bet) {
        setEditingBet({
            ...bet,
            participantInput: bet.participants ? bet.participants.join(', ') : ''
        });
    }

    function handleSaveEdit(e) {
        e.preventDefault();
        if (!editingBet.title || !editingBet.creator || !editingBet.stake) return;

        const participants = editingBet.participantInput
            ? editingBet.participantInput.split(',').map((p) => p.trim()).filter(Boolean)
            : [];

        if (!participants.some((p) => p.toLowerCase() === editingBet.creator.toLowerCase())) {
            participants.unshift(editingBet.creator);
        }

        setBets(bets.map((b) => b.id === editingBet.id ? { ...editingBet, participants } : b));
        setEditingBet(null);
    }

    function handleChangeStatus(betId, newStatus) {
        setBets(bets.map((b) => b.id === betId ? { ...b, status: newStatus } : b));
    }

    return (
        <>
           { !loading && 
           <div className="flex flex-col gap-8 sm:gap-12">
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1>Current Bets</h1>
                        <button className="btn btn-lg" onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ Add New Bet'}
                        </button>
                    </div>

                    {showForm && (
                        <Card title="New Bet">
                            <form onSubmit={handleAddBet} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="What's the bet?"
                                    className="input"
                                    value={newBet.title}
                                    onChange={(e) => setNewBet({ ...newBet, title: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="input"
                                    value={newBet.creator}
                                    onChange={(e) => setNewBet({ ...newBet, creator: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="What's at stake?"
                                    className="input"
                                    value={newBet.stake}
                                    onChange={(e) => setNewBet({ ...newBet, stake: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="People involved (comma-separated, e.g. Alice, Bob)"
                                    className="input"
                                    value={newBet.participantInput}
                                    onChange={(e) => setNewBet({ ...newBet, participantInput: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Additional notes, conditions, and positions"
                                    className="input"
                                    value={newBet.notes}
                                    onChange={(e) => setNewBet({ ...newBet, notes: e.target.value })}
                                />
                                <button type="submit" className="btn btn-lg">
                                    Place Bet
                                </button>
                            </form>
                        </Card>
                    )}
                </section>

                <section className="flex flex-col gap-4">
                    {bets.length === 0 ? (
                        <Card>
                            <p className="text-center text-neutral-400">No bets yet. Be the first to add one!</p>
                        </Card>
                    ) : (
                        bets.map((bet) => (
                            <Card key={bet.id}>
                                {editingBet && editingBet.id === bet.id ? (
                                    <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            placeholder="What's the bet?"
                                            className="input"
                                            value={editingBet.title}
                                            onChange={(e) => setEditingBet({ ...editingBet, title: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            className="input"
                                            value={editingBet.creator}
                                            onChange={(e) => setEditingBet({ ...editingBet, creator: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="What's at stake?"
                                            className="input"
                                            value={editingBet.stake}
                                            onChange={(e) => setEditingBet({ ...editingBet, stake: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="People involved (comma-separated)"
                                            className="input"
                                            value={editingBet.participantInput}
                                            onChange={(e) => setEditingBet({ ...editingBet, participantInput: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Additional notes, conditions, and positions"
                                            className="input"
                                            value={editingBet.notes}
                                            onChange={(e) => setEditingBet({ ...editingBet, notes: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn btn-lg">Save</button>
                                            <button type="button" className="btn btn-lg" style={{ background: '#e5e5e5', color: '#525252' }} onClick={() => setEditingBet(null)}>Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-start gap-2 sm:gap-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex-1 min-w-0">
                                            <div>
                                                <h3 className="text-neutral-900">{bet.title}</h3>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    Created by {bet.creator} &middot; Stake: {bet.stake}
                                                </p>
                                                {bet.participants && bet.participants.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {bet.participants.map((p) => (
                                                            <span
                                                                key={p}
                                                                className="inline-flex items-center rounded-sm bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-600"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-4 text-neutral-600">Notes: {bet.notes}</div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
                                                    bet.status === 'Active'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : bet.status === 'Completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : bet.status === 'Cancelled'
                                                        ? 'bg-neutral-100 text-neutral-600'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {bet.status}
                                            </span>
                                        </div>
                                        <BetMenu bet={bet} onEdit={handleEditBet} onChangeStatus={handleChangeStatus} />
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </section>
            </div>
            }
        </>
    );
}
