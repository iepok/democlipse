import {getServerSession} from 'next-auth'
import {authOptions, requireAuth} from '@/lib/auth'
import {notFound, redirect} from 'next/navigation'
import {createPlayer, deletePlayer, getLastPlayerName, getRoom} from '@/lib/queries'
import RoomClient from './RoomClient'
import {getUserActiveGame, getUserOtherRoom} from "@/lib/queries/redirects";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect(`/api/auth/signin?callbackUrl=/room/${roomId}`)
    }

    const { id: userId, name, email } = session.user

    let room
    try {
        room = await getRoom(roomId, userId)
    } catch (_) {
        notFound()
    }

    const currentPlayer = room.players.find(p => p.userId === userId)
    if (currentPlayer) {
        return <RoomClient game={room} currentPlayer={currentPlayer} />
    }

    if (room.startedAt) {
        redirect('/')
    }

    // Target is lobby - check for other room conflict
    const otherRoom = await getUserOtherRoom(userId, roomId)

    if (otherRoom) {
        if (otherRoom.started && !otherRoom.revealed) {
            // Active unrevealed - redirect with banner
            redirect(`/room/${otherRoom.roomId}?attemptedJoin=${roomId}`)
        }

        if (!otherRoom.started) {
            // Other lobby - delete old player first
            await deletePlayer(userId, otherRoom.roomId)
        }

        // If revealed or deleted - fall through to join
    }

    const lastUsedName = await getLastPlayerName(userId)
    const defaultName = lastUsedName || name || email?.split('@')[0] || ''

    await createPlayer(room.gameId, userId, defaultName)

    const newRoom = await getRoom(roomId, userId)
    const newPlayer = newRoom.players.find(p => p.userId === userId)!
    return <RoomClient game={newRoom} currentPlayer={newPlayer} />
}
