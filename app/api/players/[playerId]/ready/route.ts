import {NextRequest, NextResponse} from 'next/server';
import {
    getGameReadyInfo,
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

        const info = await getGameReadyInfo(playerId)
        const totalPlayers = info.playerIds.length
        const allOthersReady = info.totalReady === totalPlayers - 1
        const hasMinPlayers = totalPlayers >= GAME_VARIANTS[info.gameVariant].minPlayers

        if (allOthersReady && hasMinPlayers) {
            const cards = GAME_VARIANTS[info.gameVariant].distributeCards(totalPlayers)
            await startGameAndDistributeCards(roomId, info.playerIds, cards)
        } else {
            await markPlayerReady(playerId, validName)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}
