import {NextRequest, NextResponse} from 'next/server';
import {generateEntryCode, requireRoomMembership, validateGameNotStarted} from '@/lib/queries';
import {requireAuth} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const userId = await requireAuth()
        const { roomId } = await params

        await requireRoomMembership(roomId, userId)
        await validateGameNotStarted(roomId)

        await generateEntryCode(roomId)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}