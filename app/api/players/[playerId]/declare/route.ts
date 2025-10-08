import {NextRequest, NextResponse} from 'next/server';
import {
    getRoom,
    requirePlayerOwnership,
    getRoomIdFromPlayer,
    validateGameStarted,
    completeGame
} from '@/lib/queries';
import {requireAuth} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";
import {BadRequestError} from "@/lib/errors";
import {GAME_VARIANTS} from "@/lib/game-variants";
import type {Winner} from "@/lib/types";

export async function POST(
    request: NextRequest,
    { params }: { params: { playerId: string } }
) {
    try {
        const userId = await requireAuth()
        const { playerId } = params;
        const body = await request.json()
        const { declaration } = body as { declaration: Winner }

        if (declaration !== 'goodTeam' && declaration !== 'badTeam') {
            throw new BadRequestError('Declaration must be "goodTeam" or "badTeam"')
        }

        await requirePlayerOwnership(playerId, userId)
        const roomId = await getRoomIdFromPlayer(playerId)
        await validateGameStarted(roomId)

        let room = await getRoom(roomId, userId)

        if (room.variant !== 'apocalypse') {
            throw new BadRequestError('Declarations are only allowed in apocalypse variant')
        }

        if (room.winner !== null) {
            throw new BadRequestError('Game already has a winner')
        }

        const variantConfig = GAME_VARIANTS[room.variant]
        const winner = variantConfig.findWinner(room, declaration)

        if (winner === null) {
            throw new BadRequestError('Declaration does not determine a winner yet')
        }

        await completeGame(roomId, winner)
        room = await getRoom(roomId, userId)

        return NextResponse.json({ room, status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}