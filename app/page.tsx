import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {redirect} from 'next/navigation'
import LoginButton from '../components/LoginButton'
import LogoutButton from '../components/LogoutButton'
import HomeForm from '../components/HomeForm'
import {getUserActiveGame} from "@/lib/queries/redirects";
import {getLastPlayerName} from "@/lib/queries";

export default async function Home() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <LoginButton />
    }

    const { id: userId, name, email } = session?.user

    const activeGame = await getUserActiveGame(userId)

    if (activeGame && !activeGame.revealed) {
        redirect(`/room/${activeGame.roomId}`)
    }

    const lastUsedName = await getLastPlayerName(userId)
    const defaultName = lastUsedName || name || email?.split('@')[0] || ''

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                <div className="flex justify-end mb-4">
                    <LogoutButton />
                </div>

                <HomeForm defaultName={defaultName} />

                {activeGame?.revealed && (
                    <div className="mt-4 text-center">
                        <a
                            href={`/room/${activeGame.roomId}`}
                            className="text-blue-600 hover:text-blue-700 underline"
                        >
                            Return to Room
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}