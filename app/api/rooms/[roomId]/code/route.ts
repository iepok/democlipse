import {NextRequest, NextResponse} from 'next/server';
import {generateEntryCode, getRoom, requireRoomMembership, validateGameNotStarted} from '@/lib/queries';
import {requireAuth} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function POST(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const userId = await requireAuth()
        const { roomId } = params

        await requireRoomMembership(roomId, userId)
        await validateGameNotStarted(roomId)

        await generateEntryCode(roomId)
        const room = await getRoom(roomId, userId)

        return NextResponse.json({ room }, { status: 200 })
    } catch (error) {
        return handleApiError(error)
    }
}