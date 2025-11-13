import {NextRequest, NextResponse} from 'next/server';
import {getRoomIdFromCode} from '@/lib/queries';
import {requireAuth} from "@/lib/auth";
import {handleApiError} from "@/lib/error-handler";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        await requireAuth()
        const { code } = await params
        const { roomId } = await getRoomIdFromCode(code)
        return NextResponse.json({ roomId })
    } catch (error) {
        return handleApiError(error)
    }
}