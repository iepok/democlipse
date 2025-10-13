'use client'

import {useRouter} from 'next/navigation'
import {Room, Player, PlayerStatus} from '@/lib/types'

const getCard = (status: PlayerStatus) => {
    if (status === 'good') return 'Good'
    if (status === 'bad') return 'Bad'
    if (status === 'joker') return 'Joker'
    return 'Unknown'
}

export default function GameState({ game, currentPlayer }: {
    game: Room
    currentPlayer: Player
}) {
    const router = useRouter()

    const handleReveal = async () => {
        await fetch(`/api/players/${currentPlayer.id}/reveal`, { method: 'POST' })
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Game Active</h1>

                <div className="border border-black rounded p-4 mb-6">
                    <h2 className="font-bold mb-2">Your Card</h2>
                    <p className="text-xl font-bold">{getCard(currentPlayer.status)}</p>
                </div>

                <div className="border border-black rounded p-4 mb-6">
                    <h2 className="font-bold mb-2">Other Players</h2>
                    {game.players.filter(p => p.id !== currentPlayer.id).map(p => (
                        <div key={p.id} className="flex items-center gap-2 mb-1">
                            <span>{p.name}:</span>
                            {p.revealedAt ? (
                                <strong>{getCard(p.status)}</strong>
                            ) : (
                                <span className="text-gray-500">Hidden</span>
                            )}
                        </div>
                    ))}
                </div>

                {!currentPlayer.revealedAt ? (
                    <button
                        onClick={handleReveal}
                        className="border border-black rounded px-6 py-2 bg-white hover:bg-gray-100"
                    >
                        Reveal Card
                    </button>
                ) : (
                    <p className="text-gray-600">Waiting for game to end...</p>
                )}
            </div>
        </div>
    )
}