import {NextRequest, NextResponse} from 'next/server';
import {
    createPlayer,
    getGameAndRoomIdFromCode,
    getRoom,
    validatePlayerJoin
} from '@/lib/queries';
import {requireAuth, validateName} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function POST(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const userId = await requireAuth()
        const { name } = await request.json()
        const validName = validateName(name)
        const { code } = params

        const { gameId, roomId } = await getGameAndRoomIdFromCode(code)

        await validatePlayerJoin(roomId, userId)

        await createPlayer(gameId, userId, validName)
        const room = await getRoom(roomId, userId)

        return NextResponse.json({ room }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}