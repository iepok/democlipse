import {pool} from "@/lib/db";
import {BadRequestError, NotFoundError, UnauthorizedError} from "@/lib/errors";
import {GameVariant, PlayerStatus} from "@/lib/types";

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

export async function getPlayersForReadyCheck(
    playerId: string
): Promise<{
    players: {
        id: string
        status: PlayerStatus
    }[]
    gameVariant: GameVariant
}> {
    const { rows } = await pool.query<{
        player_id: string
        status: PlayerStatus
        variant: GameVariant
    }>(`
        SELECT
            p.id AS player_id,
            p.status,
            g.variant
        FROM players p
        JOIN games g ON g.id = p.game_id
        JOIN players target ON target.id = $1
        WHERE p.game_id = target.game_id;
    `, [playerId])

    return {
        players: rows.map(r => ({
            id: r.player_id,
            status: r.status
        })),
        gameVariant: rows[0].variant
    }
}

export async function getLastPlayerName(userId: string): Promise<string | null> {
    const result = await pool.query<{name: string}>(`
        SELECT name
        FROM players
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `, [userId])

    return result.rows.length > 0 ? result.rows[0].name : null
}

export async function validateCardNotRevealed(playerId: string): Promise<void> {
    const { rows } = await pool.query<{
        revealed_at: string | null
        completed_at: string | null
    }>(`
        SELECT p.revealed_at, g.completed_at
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE p.id = $1
    `, [playerId])

    if (rows.length === 0) {
        throw new NotFoundError('Player not found')
    }

    if (rows[0].completed_at !== null) {
        throw new BadRequestError('Game already completed')
    }

    if (rows[0].revealed_at !== null) {
        throw new BadRequestError('Card already revealed')
    }
}
