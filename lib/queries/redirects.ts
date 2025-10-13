import {pool} from "@/lib/db";

interface ActiveGameInfo {
    roomId: string
    revealed: boolean  // player's revealed_at IS NOT NULL
}

export async function getUserActiveGame(userId: string): Promise<ActiveGameInfo | null> {
    const result = await pool.query<{
        room_id: string
        revealed_at: string | null
    }>(`
        SELECT 
          r.id as room_id,
          p.revealed_at
        FROM players p
        JOIN games g ON p.game_id = g.id
        JOIN rooms r ON g.room_id = r.id
        WHERE p.user_id = $1
          AND g.completed_at IS NULL
        LIMIT 1
    `, [userId])

    if (result.rows.length === 0) {
        return null
    }

    return {
        roomId: result.rows[0].room_id,
        revealed: result.rows[0].revealed_at !== null
    }
}




interface UserOtherRoomInfo {
    roomId: string
    started: boolean
    revealed: boolean
}

export async function getUserOtherRoom(userId: string, excludeRoomId: string): Promise<UserOtherRoomInfo | null> {
    const result = await pool.query<{
        room_id: string | null
        started_at: string | null
        revealed_at: string | null
    }>(`
        SELECT
          r.id as room_id,
          g.started_at,
          p.revealed_at
        FROM players p
        JOIN games g ON p.game_id = g.id
        JOIN rooms r ON g.room_id = r.id
        WHERE p.user_id = $1
          AND g.completed_at IS NULL
          AND r.id != $2
        LIMIT 1
    `, [userId, excludeRoomId])

    if (result.rows.length === 0) {
        return null
    }

    const row = result.rows[0]

    return {
        roomId: row.room_id!,
        started: row.started_at !== null,
        revealed: row.revealed_at !== null
    }
}