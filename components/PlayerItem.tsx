import {Player, PlayerStatus} from '@/lib/types'

export default function PlayerItem({player}: {player: Player}) {
    const renderByStatus = (status: PlayerStatus) => {
        switch (status) {
            case null:
                return <span className="text-gray-500">Waiting...</span>

            case 'ready':
                return <span className="text-green-600 text-sm font-medium">✓ Ready</span>

            case 'hidden':
                return <span className="text-gray-500">Hidden</span>

            case 'good':
                return <strong className="text-blue-600">Good</strong>

            case 'bad':
                return <strong className="text-red-600">Bad</strong>

            case 'joker':
                return <strong className="text-purple-600">Joker</strong>
        }
    }

    return (
        <div className="flex items-center justify-between">
            <span className="text-gray-900">{player.name}</span>
            {renderByStatus(player.status)}
        </div>
    )
}