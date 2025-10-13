import {Player} from '@/lib/types'
import PlayerItem from './PlayerItem'

export default function PlayersList({players}: {players: Player[]}) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="font-semibold mb-4 text-gray-700">Players</h2>
            <div className="space-y-3">
                {players.map(p => (
                    <PlayerItem key={p.id} player={p} />
                ))}
                {players.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                        Waiting for other players...
                    </p>
                )}
            </div>
        </div>
    )
}