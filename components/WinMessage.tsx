import {Room, Winner, PlayerStatus} from '@/lib/types'
import Button from './Button'
import {useRouter} from 'next/navigation'

const getWinner = (winner: Winner) => {
    if (winner === 'goodTeam') return 'Good Team Wins!'
    if (winner === 'badTeam') return 'Bad Team Wins!'
    if (winner === 'jokerTeam') return 'Joker Wins!'
    if (winner === 'all') return 'Everyone Wins!'
    if (winner === 'none') return 'No Winners'
    return 'Game Over'
}

export default function WinMessage({game}: {game: Room}) {
    const router = useRouter()

    return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-center mb-4">{getWinner(game.winner)}</h2>
            <Button onClick={() => router.push('/')} className="w-full">
                Back to Home
            </Button>
        </div>
    )
}