import {NextRequest, NextResponse} from "next/server";
import {isGameStarted} from "@/lib/queries";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params
        const started = await isGameStarted(roomId)
        return NextResponse.json({ joinable: started === false })
    } catch (error) {
        return NextResponse.json({ joinable: false }, { status: 500 })
    }
}
