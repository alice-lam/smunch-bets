import { ActionMenu } from './action-menu';
import { Card } from './card';

export function BetCard({ bet, handleEditBet, handleChangeStatus }) {
    return (
        <Card key={bet.id}>
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
                            <p className="mt-1 text-neutral-500">{bet.notes}</p>
                        </div>
                    </div>
                    <div
                        className={`inline-flex justify-center rounded-full mt-3 px-3 py-2 text-xs font-bold shrink-0 ${
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
                    </div>
                </div>
                <ActionMenu bet={bet} onEdit={handleEditBet} onChangeStatus={handleChangeStatus} />
            </div>
        </Card>
    );
}