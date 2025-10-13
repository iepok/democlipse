'use client'

import {useRouter} from 'next/navigation'
import {Room, Player} from '@/lib/types'
import {GAME_VARIANTS} from '@/lib/game-variants'
import GameTitle from '@/components/GameTitle'
import RoomEntryCode from '@/components/RoomEntryCode'
import PlayersList from '@/components/PlayersList'
import CurrentPlayerSection from '@/components/CurrentPlayerSection'

export default function LobbyState({ game, currentPlayer }: {
    game: Room
    currentPlayer: Player
}) {
    const router = useRouter()

    const handleReady = async () => {
        await fetch(`/api/players/${currentPlayer.id}/ready`, {method: 'POST', body: JSON.stringify({ name: currentPlayer.name })})
        router.refresh()
    }

    const handleGenerateCode = async () => {
        await fetch(`/api/rooms/${game.roomId}/code`, {method: 'POST'})
        router.refresh()
    }

    const maxPlayers = GAME_VARIANTS[game.variant].maxPlayers
    const isRoomFull = game.players.length >= maxPlayers
    const canGenerateCode = !game.entryCode && !isRoomFull
    const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id)

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <GameTitle variant={game.variant} />
                <RoomEntryCode
                    entryCode={game.entryCode}
                    onGenerateCode={handleGenerateCode}
                    canGenerateCode={canGenerateCode}
                />
                <PlayersList players={otherPlayers} />
                <CurrentPlayerSection player={currentPlayer} onReady={handleReady} />
            </div>
        </div>
    )
}