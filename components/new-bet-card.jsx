import { useState } from 'react';
import { Card } from './card';

export function NewBetCard({ user, handleAddBet, submittingBet}) {
    const [newBet, setNewBet] = useState({ title: '', creator: '', stake: '', participantInput: '', notes: '' });

    return (
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
                    {submittingBet ? "Saving..." : "Place Bet"}
                </button>
            </form>
        </Card>
    );
}