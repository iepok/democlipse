import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {redirect} from 'next/navigation'
import LoginButton from './LoginButton'
import HomeForm from './HomeForm'
import {getUserActiveGame} from "@/lib/queries/redirects";

export default async function Home() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <LoginButton />
    }

    const activeGame = await getUserActiveGame(session.user.id)

    if (activeGame && !activeGame.revealed) {
        redirect(`/room/${activeGame.roomId}`)
    }

    const defaultName = session.user.email?.split('@')[0] || ''
    return (
        <div>
            <HomeForm defaultName={defaultName} />
            {activeGame?.revealed && (
                <a href={`/room/${activeGame.roomId}`}>
                    Return to Room
                </a>
            )}
        </div>
    )
}