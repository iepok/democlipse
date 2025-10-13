'use client'

import {useRouter} from 'next/navigation'
import {Room, Winner, PlayerStatus} from '@/lib/types'

const getWinner = (winner: Winner) => {
    if (winner === 'goodTeam') return 'Good Team Wins!'
    if (winner === 'badTeam') return 'Bad Team Wins!'
    if (winner === 'jokerTeam') return 'Joker Wins!'
    if (winner === 'all') return 'Everyone Wins!'
    if (winner === 'none') return 'No Winners'
    return 'Game Over'
}

const getCard = (status: PlayerStatus) => {
    if (status === 'good') return 'Good'
    if (status === 'bad') return 'Bad'
    if (status === 'joker') return 'Joker'
    return 'Unknown'
}

export default function ResultsState({ game }: { game: Room }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Game Over</h1>

                <div className="border border-black rounded p-4 mb-6">
                    <h2 className="font-bold text-xl">{getWinner(game.winner)}</h2>
                </div>

                <div className="border border-black rounded p-4 mb-6">
                    <h2 className="font-bold mb-2">All Cards</h2>
                    {game.players.map(p => (
                        <div key={p.id} className="mb-1">
                            {p.name}: <strong>{getCard(p.status)}</strong>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => router.push('/')}
                    className="border border-black rounded px-6 py-2 bg-white hover:bg-gray-100"
                >
                    Back to Home
                </button>
            </div>
        </div>
    )
}