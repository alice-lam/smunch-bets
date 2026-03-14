'use client';

import { useState } from 'react';
import { Card } from 'components/card';

const sampleBets = [
    { id: 1, title: 'Team A wins the championship', creator: 'Alice', stake: '$20', status: 'Active', participants: ['Alice', 'Bob'] },
    { id: 2, title: 'It rains on Friday', creator: 'Bob', stake: 'Lunch', status: 'Active', participants: ['Bob', 'Charlie'] },
    { id: 3, title: 'New feature ships by end of sprint', creator: 'Charlie', stake: '$10', status: 'Pending', participants: ['Charlie'] }
];

export default function Page() {
    const [bets, setBets] = useState(sampleBets);
    const [showForm, setShowForm] = useState(false);
    const [newBet, setNewBet] = useState({ title: '', creator: '', stake: '', participantInput: '' });

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

        setBets([...bets, { id: Date.now(), title: newBet.title, creator: newBet.creator, stake: newBet.stake, participants, status: 'Active' }]);
        setNewBet({ title: '', creator: '', stake: '', participantInput: '' });
        setShowForm(false);
    }

    return (
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
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-neutral-900">{bet.title}</h3>
                                    <p className="text-sm text-neutral-500">
                                        Created by {bet.creator} &middot; Stake: {bet.stake}
                                    </p>
                                    {bet.participants && bet.participants.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {bet.participants.map((p) => (
                                                <span
                                                    key={p}
                                                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0 ${
                                        bet.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {bet.status}
                                </span>
                            </div>
                        </Card>
                    ))
                )}
            </section>
        </div>
    );
}
