import {NextRequest, NextResponse} from 'next/server';
import {createGame, createPlayer, createRoom, validateUserNotInOpenGame} from '@/lib/queries';
import {requireAuth, validateName} from '@/lib/auth'
import {handleApiError} from "@/lib/error-handler";
import {validateVariant} from "@/lib/game-variants";

export async function POST(request: NextRequest) {
    try {
        const userId = await requireAuth()
        const { name, variant } = await request.json()
        const validName = validateName(name)
        const validVariant = validateVariant(variant)

        await validateUserNotInOpenGame(userId)

        const roomId = await createRoom()
        const gameId = await createGame(roomId, validVariant)
        await createPlayer(gameId, userId, validName)

        return NextResponse.json({ roomId }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}