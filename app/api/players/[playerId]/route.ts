import {NextRequest, NextResponse} from 'next/server'
import {requireAuth} from '@/lib/auth'
import {handleApiError} from '@/lib/error-handler'
import {requirePlayerOwnership, deletePlayer, getRoomIdFromPlayer} from '@/lib/queries/players'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ playerId: string }> }
) {
    try {
        const userId = await requireAuth()
        const { playerId } = await params

        await requirePlayerOwnership(playerId, userId)

        const roomId = await getRoomIdFromPlayer(playerId)
        await deletePlayer(userId, roomId)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}