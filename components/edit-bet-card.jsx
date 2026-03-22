import { Card } from './card';

export function EditBetCard({ editingBet, setEditingBet, handleSaveEdit }) {

    return (
        <Card>
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
        </Card>
    );
}