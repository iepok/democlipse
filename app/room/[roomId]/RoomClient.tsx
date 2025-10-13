'use client'

import {useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {Room, Player} from '@/lib/types'
import {GAME_VARIANTS} from '@/lib/game-variants'
import GameTitle from '@/components/GameTitle'
import RoomEntryCode from '@/components/RoomEntryCode'
import PlayersList from '@/components/PlayersList'
import CurrentPlayerSection from '@/components/CurrentPlayerSection'
import WinMessage from '@/components/WinMessage'

export default function RoomClient({game, currentPlayer}: {
    game: Room
    currentPlayer: Player
}) {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => router.refresh(), 20000)
        return () => clearInterval(interval)
    }, [router])

    const maxPlayers = GAME_VARIANTS[game.variant].maxPlayers
    const isRoomFull = game.players.length >= maxPlayers
    const canGenerateCode = !game.entryCode && !isRoomFull
    const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <GameTitle variant={game.variant} />

                <RoomEntryCode
                    roomId={game.roomId}
                    entryCode={game.entryCode}
                    canGenerateCode={canGenerateCode}
                />

                {game.completedAt && <WinMessage game={game} />}

                <PlayersList players={otherPlayers} />

                <CurrentPlayerSection
                    player={currentPlayer}
                />
            </div>
        </div>
    )
}