import {pool} from "@/lib/db";
import {BadRequestError, NotFoundError, UnauthorizedError} from "@/lib/errors";
import {GameVariant} from "@/lib/types";

export async function createPlayer(
    gameId: string,
    userId: string,
    name: string
): Promise<void> {
    await pool.query<{ id: string }>(`
        INSERT INTO players (game_id, user_id, name)
        VALUES ($1, $2, $3)
        RETURNING id
    `, [gameId, userId, name])
}

export async function markPlayerReady(
    playerId: string,
    name: string
): Promise<void> {
    const result = await pool.query(`
        UPDATE players
        SET status = 'ready', name = $1
        WHERE id = $2
    `, [name, playerId])

    if (result.rowCount === 0) {
        throw new NotFoundError('Player not found')
    }
}

export async function revealCard(playerId: string): Promise<void> {
    const result = await pool.query(`
        UPDATE players
        SET revealed_at = NOW()
        WHERE id = $1
    `, [playerId])

    if (result.rowCount === 0) {
        throw new NotFoundError('Player not found')
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
    const result = await pool.query(`
        SELECT 1
        FROM players
        WHERE id = $1 AND user_id = $2
    `, [playerId, userId])

    if (result.rows.length === 0) {
        throw new UnauthorizedError()  // Generic - doesn't leak info
    }
}

export async function getPlayerCount(roomId: string): Promise<number> {
    const result = await pool.query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE g.room_id = $1
    `, [roomId])

    return parseInt(result.rows[0].count)
}

export async function getRoomIdFromPlayer(playerId: string): Promise<string> {
    const result = await pool.query<{ roomId: string }>(`
        SELECT g.room_id as "roomId" 
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE p.id = $1
    `, [playerId])

    if (result.rows.length === 0) {
        throw new NotFoundError('Player not found')
    }

    return result.rows[0].roomId
}

export async function getGameReadyInfo(
    playerId: string
): Promise<{
    totalReady: number
    playerIds: string[]
    gameVariant: GameVariant
}> {
    const result = await pool.query<{
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
        totalReady: parseInt(result.rows[0].totalReady),
        playerIds: result.rows[0].playerIds,
        gameVariant: result.rows[0].variant
    }
}

export async function validateCardNotRevealed(playerId: string): Promise<void> {
    const result = await pool.query(`
        SELECT revealed_at
        FROM players
        WHERE id = $1
    `, [playerId])

    if (result.rows.length === 0) {
        throw new NotFoundError('Player not found')
    }

    if (result.rows[0].revealed_at !== null) {
        throw new BadRequestError('Card already revealed')
    }
}
