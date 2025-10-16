import {NextRequest, NextResponse} from 'next/server';
import {
    getPlayersForReadyCheck,
    getRoomIdFromPlayer,
    markPlayerReady,
    requirePlayerOwnership, startGameAndDistributeCards,
    validateGameNotStarted
} from '@/lib/queries';
import {requireAuth, validateName} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";
import {GAME_VARIANTS} from "@/lib/game-variants";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    try {
        const userId = await requireAuth()
        const { name } = await request.json()
        const validName = validateName(name)
        const { playerId } = await params

        await requirePlayerOwnership(playerId, userId)
        const roomId = await getRoomIdFromPlayer(playerId)
        await validateGameNotStarted(roomId)

        const { players, gameVariant } = await getPlayersForReadyCheck(playerId)
        const variantConfig = GAME_VARIANTS[gameVariant]

        const allOthersReady = players
            .filter(p => p.id !== playerId)
            .every(p => p.status === 'ready')
        const playerCount = players.length;
        const hasMinPlayers = playerCount >= variantConfig.minPlayers

        if (allOthersReady && hasMinPlayers) {
            const playerIds = players.map(p => p.id)
            const cards = variantConfig.distributeCards(playerCount)
            await startGameAndDistributeCards(roomId, playerIds, cards)
        } else {
            await markPlayerReady(playerId, validName)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}
