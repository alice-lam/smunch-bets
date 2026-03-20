'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from 'components/card';
import { getData, pushData, updateData } from 'app/actions';
import { useAuth } from 'components/auth-context'

const sampleBets = [
    { id: 1, title: 'Connally makes SciOly state', creator: 'Alice', stake: '$20', status: 'In Progress', participants: ['Alice', 'Bob'] },
    { id: 2, title: 'It rains on Friday', creator: 'Bob', stake: 'Lunch', status: 'Completed', participants: ['Bob', 'Charlie'], notes: 'Bob: yes, Charlie: no' },
    { id: 3, title: 'New feature ships by end of sprint', creator: 'Charlie', stake: '1 shot', status: 'Cancelled', participants: ['Charlie'] }
];

const STATUS_OPTIONS = ['In Progress', 'Pending Punishment', 'Completed', 'Cancelled'];

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
    const { user } = useAuth();
    const isLoggedIn = user ? true : false;

    useEffect(() => {
        async function fetchData() {
            const data = await getData();            
            setBets(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    async function handleAddBet(e) {
        e.preventDefault();
        if (!newBet.title || !newBet.stake) return;

        const participants = newBet.participantInput
            ? newBet.participantInput.split(',').map((p) => p.trim()).filter(Boolean)
            : [];

        // Include the creator if not already listed
        if (!participants.some((p) => p.toLowerCase() === user.name.toLowerCase())) {
            participants.unshift(user.name);
        }
        const newBetEntry = { title: newBet.title, creator: user.name, stake: newBet.stake, participants, notes: newBet.notes, status: 'Pending Punishment' };
        const result = await pushData(newBetEntry);
        if(result.success) {
            setBets([...bets, newBetEntry]);
            setNewBet({ title: '', creator: '', stake: '', participantInput: '', notes: '' });
            setShowForm(false);
        }
    }

    function handleEditBet(bet) {
        setEditingBet({
            ...bet,
            participantInput: bet.participants ? bet.participants.join(', ') : ''
        });
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        if (!editingBet.title || !editingBet.creator || !editingBet.stake) return;

        const participants = editingBet.participantInput
            ? editingBet.participantInput.split(',').map((p) => p.trim()).filter(Boolean)
            : [];

        if (!participants.some((p) => p.toLowerCase() === editingBet.creator.toLowerCase())) {
            participants.unshift(editingBet.creator);
        }

        // Call the server action
         const result = await updateData(editingBet);
        if(result.success){
            setBets(bets.map((b) => b.id === editingBet.id ? { ...editingBet, participants } : b));
            setEditingBet(null);
        }
    }

    async function handleChangeStatus(betId, newStatus) {
        const betToUpdate = bets.find((b) => b.id === betId);
        if (!betToUpdate) return;

        const updatedBet = {
            ...betToUpdate,
            status: newStatus
        };

        const result = await updateData(updatedBet);
        if (result.success) {
            setBets(bets.map((b) => b.id === betId ? updatedBet : b));
        }
    }

    const updatedBets = isLoggedIn ? 
        bets.filter(bet => {
            const userName = user.name?.toLowerCase().trim();

            const isCreator = bet.creator?.toLowerCase().trim() === userName;
            const isParticipant = bet.participants?.some(participant => 
                participant.toLowerCase().trim() === userName
            );

            return isCreator || isParticipant;
        }) : bets;

    return (
        <>
           { !loading &&
           <div className="flex flex-col gap-8 sm:gap-12">
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h1>Current Bets</h1>
                        {isLoggedIn && 
                            <button className="btn btn-lg" onClick={() => setShowForm(!showForm)}>
                                {showForm ? 'Cancel' : '+ Add New Bet'}
                            </button>
                        }
                    </div>

                    {showForm && (
                        <Card title="New Bet">
                            <div className={`items-center rounded-full px-3 py-1 text-sm font-bold bg-blue-100 text-blue-800`} style={{ width: 'fit-content'}}>Created by: {user.name} </div>
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
                                    placeholder="What's at stake?"
                                    className="input"
                                    value={newBet.stake}
                                    onChange={(e) => setNewBet({ ...newBet, stake: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="People involved (comma-separated, first name and last initial, e.g. Alice L, Bob S)"
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
                    {!isLoggedIn || updatedBets.length === 0 ? (
                        <Card>
                            {!isLoggedIn && <p className="text-center text-neutral-400">Sign in to add and view your bets!</p>}
                            {isLoggedIn && updatedBets.length === 0 && <p className="text-center text-neutral-400">No bets yet. Feel free to create one!</p>}
                        </Card>
                    ) : (
                        updatedBets.map((bet) => (
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
                                                <h3 className="text-neutral-900 mb-1">{bet.title}</h3>
                                                <p className="text-blue-800 font-bold">
                                                    Created by {bet.creator} on {bet.updated_at?.toLocaleDateString()}
                                                </p>
                                                {bet.participants && bet.participants.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 my-2 text-neutral-600">
                                                        <span className="font-bold">Participants: </span>
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
                                                <div className="mt-1 text-neutral-600">
                                                    Stakes: 
                                                    <span className="mt-1 mx-2 text-neutral-500">{bet.stake}</span>
                                                </div>
                                                <div className="mt-1 text-neutral-600">
                                                    Additional Notes: 
                                                    <span className="mt-1 mx-2 text-neutral-500">{bet.notes}</span>
                                                </div>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
                                                    bet.status === 'In Progress'
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
                                        {isLoggedIn && 
                                            <BetMenu bet={bet} onEdit={handleEditBet} onChangeStatus={handleChangeStatus} />
                                        }
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
