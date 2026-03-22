'use client';

import { useState, useEffect, Fragment } from 'react';
import { getData, pushData, updateData } from 'db/actions';
import { BetCard } from 'components/bet-card';
import { NewBetCard } from 'components/new-bet-card';
import { EditBetCard } from 'components/edit-bet-card';
import { Card } from 'components/card';
import { useAuth } from 'components/auth-context'

const sampleBets = [
    { id: 1, title: 'Connally makes SciOly state', creator: 'Alice', stake: '$20', status: 'In Progress', participants: ['Alice', 'Bob'] },
    { id: 2, title: 'It rains on Friday', creator: 'Bob', stake: 'Lunch', status: 'Completed', participants: ['Bob', 'Charlie'], notes: 'Bob: yes, Charlie: no' },
    { id: 3, title: 'New feature ships by end of sprint', creator: 'Charlie', stake: '1 shot', status: 'Cancelled', participants: ['Charlie'] }
];

export default function Page() {
    const [bets, setBets] = useState(sampleBets);
    const [showForm, setShowForm] = useState(false);
    const [editingBet, setEditingBet] = useState(null);
    const [submittingBet, setSubmittingBet] = useState(false);
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
        if (submittingBet) return;

        setSubmittingBet(true);

        const participants = newBet.participantInput
            ? newBet.participantInput.split(',').map((p) => p.trim()).filter(Boolean)
            : [];

        // Include the creator if not already listed
        if (!participants.some((p) => p.toLowerCase() === user.name.toLowerCase())) {
            participants.unshift(user.name);
        }
        const newBetEntry = { title: newBet.title, creator: user.name, stake: newBet.stake, participants, notes: newBet.notes, status: 'In Progress' };
        const result = await pushData(newBetEntry);
        if(result.success) {
            setBets([...bets, newBetEntry]);
            setNewBet({ title: '', creator: '', stake: '', participantInput: '', notes: '' });
            setShowForm(false);
        }
        setSubmittingBet(false);
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
                        <NewBetCard user={user} handleAddBet={handleAddBet} submittingBet={submittingBet}/>
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
                            <Fragment key={bet.id}>
                                {editingBet && editingBet.id === bet.id ? (
                                    <EditBetCard editingBet={editingBet} setEditingBet={setEditingBet} handleSaveEdit={handleSaveEdit} />
                                ) : (
                                    <BetCard bet={bet} handleEditBet={handleEditBet} handleChangeStatus={handleChangeStatus} />
                                )}
                            </Fragment>
                        ))
                    )}
                </section>
            </div>
            }
        </>
    );
}
