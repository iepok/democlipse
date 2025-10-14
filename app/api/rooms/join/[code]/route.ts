import {NextRequest, NextResponse} from 'next/server';
import {
    createPlayer,
    getGameAndRoomIdFromCode,
    validatePlayerJoin
} from '@/lib/queries';
import {requireAuth, validateName} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const userId = await requireAuth()
        const { name } = await request.json()
        const validName = validateName(name)
        const { code } = await params

        const { gameId, roomId } = await getGameAndRoomIdFromCode(code)

        await validatePlayerJoin(roomId, userId)

        await createPlayer(gameId, userId, validName)

        return NextResponse.json({ roomId }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}