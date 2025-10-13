import {pool} from "@/lib/db";
import {BadRequestError, NotFoundError, UnauthorizedError} from "@/lib/errors";
import {GameVariant} from "@/lib/types";

export async function createPlayer(
    gameId: string,
    userId: string,
    name: string
): Promise<void> {
    await pool.query(`
        INSERT INTO players (game_id, user_id, name)
        VALUES ($1, $2, $3)
    `, [gameId, userId, name])
}

export async function markPlayerReady(
    playerId: string,
    name: string
): Promise<void> {
    const { rowCount } = await pool.query(`
        UPDATE players
        SET status = 'ready', name = $1
        WHERE id = $2
    `, [name, playerId])

    if (rowCount === 0) {
        throw new NotFoundError('Player not found')
    }
}

export async function revealCard(playerId: string): Promise<void> {
    const { rowCount } = await pool.query(`
        UPDATE players
        SET revealed_at = NOW()
        WHERE id = $1
    `, [playerId])

    if (rowCount === 0) {
        throw new NotFoundError('Player not found')
    }
}

export async function deletePlayer(userId: string, roomId: string): Promise<void> {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        // Delete the player
        await client.query(`
      DELETE FROM players
      WHERE user_id = $1
        AND game_id = (
          SELECT id FROM games
          WHERE room_id = $2
          ORDER BY created_at DESC
          LIMIT 1
        )
    `, [userId, roomId])

        // Check if room has any players left in incomplete games
        const result = await client.query<{ count: string }>(`
      SELECT COUNT(*) as count
      FROM players p
      JOIN games g ON p.game_id = g.id
      WHERE g.room_id = $1
        AND g.completed_at IS NULL
    `, [roomId])

        const playersLeft = parseInt(result.rows[0].count)

        // If no players left, clean up room
        if (playersLeft === 0) {
            await client.query(`
        DELETE FROM players
        WHERE game_id IN (
          SELECT id FROM games WHERE room_id = $1
        )
      `, [roomId])

            await client.query(`
        DELETE FROM games WHERE room_id = $1
      `, [roomId])

            await client.query(`
        DELETE FROM rooms WHERE id = $1
      `, [roomId])
        }

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

/**
 * Validates player exists and belongs to user
 * Generic error - doesn't reveal which check failed (security)
 */
export async function requirePlayerOwnership(
    playerId: string,
    userId: string
): Promise<void> {
    const { rows } = await pool.query(`
        SELECT 1
        FROM players
        WHERE id = $1 AND user_id = $2
    `, [playerId, userId])

    if (rows.length === 0) {
        throw new UnauthorizedError()  // Generic - doesn't leak info
    }
}

export async function getPlayerCount(roomId: string): Promise<number> {
    const { rows } = await pool.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE g.room_id = $1
    `, [roomId])

    return parseInt(rows[0].count)
}

export async function getRoomIdFromPlayer(playerId: string): Promise<string> {
    const { rows } = await pool.query<{ roomId: string }>(`
        SELECT g.room_id as "roomId" 
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE p.id = $1
    `, [playerId])

    if (rows.length === 0) {
        throw new NotFoundError('Player not found')
    }

    return rows[0].roomId
}

export async function getGameReadyInfo(
    playerId: string
): Promise<{
    totalReady: number
    playerIds: string[]
    gameVariant: GameVariant
}> {
    const { rows } = await pool.query<{
        totalReady: string
        variant: GameVariant
        playerIds: string[]
    }>(`
        SELECT
            COUNT(CASE WHEN p2.status = 'ready' THEN 1 END) as "totalReady",
            g.variant,
            array_agg(p_all.id ORDER BY p_all.created_at) as "playerIds"
        FROM players p1
        JOIN games g ON g.id = p1.game_id
        LEFT JOIN players p2 ON p2.game_id = g.id AND p2.id != p1.id
        JOIN players p_all ON p_all.game_id = g.id
        WHERE p1.id = $1
        GROUP BY g.variant
    `, [playerId])

    return {
        totalReady: parseInt(rows[0].totalReady),
        playerIds: rows[0].playerIds,
        gameVariant: rows[0].variant
    }
}

export async function validateCardNotRevealed(playerId: string): Promise<void> {
    const { rows } = await pool.query(`
        SELECT revealed_at
        FROM players
        WHERE id = $1
    `, [playerId])

    if (rows.length === 0) {
        throw new NotFoundError('Player not found')
    }

    if (rows[0].revealed_at !== null) {
        throw new BadRequestError('Card already revealed')
    }
}
