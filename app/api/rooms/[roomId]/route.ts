import {NextRequest, NextResponse} from 'next/server';
import {
    createPlayer,
    getGameIdFromRoom,
    getRoom,
    validatePlayerJoin
} from '@/lib/queries';
import {requireAuth, validateName} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function GET(
    request: NextRequest,
    { params }: { params: { roomId: string } },
) {
    try {
        const userId = await requireAuth()
        const { roomId } = params
        
        const room = await getRoom(roomId, userId)

        return NextResponse.json({ room }, { status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const userId = await requireAuth()
        const { name } = await request.json()
        const validName = validateName(name)
        const { roomId } = params

        const gameId = await getGameIdFromRoom(roomId)

        await validatePlayerJoin(roomId, userId)

        await createPlayer(gameId, userId, validName)
        const room = await getRoom(roomId, userId);

        return NextResponse.json({ room }, { status: 201 });
    } catch (error) {
        return handleApiError(error)
    }
}