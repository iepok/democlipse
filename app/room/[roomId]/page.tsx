import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {redirect} from 'next/navigation'
import {createPlayer, deletePlayer, getRoom} from '@/lib/queries'
import RoomClient from './RoomClient'
import {getUserOtherRoom} from "@/lib/queries/redirects";

export default async function RoomPage({ params }: { params: { roomId: string } }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect(`/api/auth/signin?callbackUrl=/room/${params.roomId}`)
    }

    const { id: userId, email } = session.user

    const room = await getRoom(params.roomId, userId)

    const currentPlayer = room.players.find(p => p.userId === userId)
    if (currentPlayer) {
        return <RoomClient game={room} currentPlayer={currentPlayer} />
    }

    if (room.startedAt) {
        redirect('/')
    }

    // Target is lobby - check for other room conflict
    const otherRoom = await getUserOtherRoom(userId, params.roomId)

    if (otherRoom) {
        if (otherRoom.started && !otherRoom.revealed) {
            // Active unrevealed - redirect with banner
            redirect(`/room/${otherRoom.roomId}?attemptedJoin=${params.roomId}`)
        }

        if (!otherRoom.started) {
            // Other lobby - delete old player first
            await deletePlayer(userId, otherRoom.roomId)
        }

        // If revealed or deleted - fall through to join
    }

    const defaultName = email?.split('@')[0] || ''
    await createPlayer(room.gameId, userId, defaultName)

    const newRoom = await getRoom(params.roomId, userId)
    const newPlayer = newRoom.players.find(p => p.userId === userId)!
    return <RoomClient game={newRoom} currentPlayer={newPlayer} />
}