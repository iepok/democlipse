import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {redirect} from 'next/navigation'
import {createGame, createPlayer, createRoom} from '@/lib/queries'
import {validateVariant} from "@/lib/game-variants"

export default async function NewRoomPage({ params }: { params: Promise<{ variant: string }> }) {
    const { variant } = await params
    const validVariant = validateVariant(variant)

    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect(`/api/auth/signin?callbackUrl=/room/new/${validVariant}`)
    }

    const { id: userId, email, name } = session.user

    const playerName = name || email?.split('@')[0] || ''
    const roomId = await createRoom()
    const gameId = await createGame(roomId, validVariant)
    await createPlayer(gameId, userId, playerName)

    redirect(`/room/${roomId}`)
}