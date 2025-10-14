import {NextRequest, NextResponse} from 'next/server';
import {
    revealCard,
    getRoom,
    requirePlayerOwnership,
    getRoomIdFromPlayer,
    validateGameStarted,
    validateCardNotRevealed, completeGame
} from '@/lib/queries';
import {requireAuth} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";
import {GAME_VARIANTS} from "@/lib/game-variants";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    try {
        const userId = await requireAuth()
        const { playerId } = await params;

        await requirePlayerOwnership(playerId, userId)
        const roomId = await getRoomIdFromPlayer(playerId)
        await validateGameStarted(roomId)
        await validateCardNotRevealed(playerId)

        await revealCard(playerId)
        const room = await getRoom(roomId, userId)

        // Check win condition
        const variantConfig = GAME_VARIANTS[room.variant]
        const winner = variantConfig.findWinner(room, null)

        if (winner !== null) {
            await completeGame(roomId, winner)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}