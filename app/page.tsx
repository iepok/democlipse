import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { pool } from '@/lib/db'
import LoginButton from './LoginButton'
import HomeForm from './HomeForm'

export default async function Home() {
    const session = await getServerSession(authOptions)

    // Not logged in
    if (!session?.user) {
        return <LoginButton />
    }

    // Check active game. todo: uncomment when database ready
  //   const result = await pool.query<{ room_id: string }>(`
  //   SELECT g.room_id
  //   FROM players p
  //   JOIN games g ON g.id = p.game_id
  //   WHERE p.user_id = $1 AND g.completed_at IS NULL
  //   LIMIT 1
  // `, [session.user.id])
  //
  //   if (result.rows.length > 0) {
  //       redirect(`/room/${result.rows[0].room_id}`)
  //   }

    // Show home
    const defaultName = session.user.email?.split('@')[0] || ''
    return <HomeForm defaultName={defaultName} />
}