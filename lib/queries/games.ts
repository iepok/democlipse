import {pool} from "@/lib/db";
import {BadRequestError, NotFoundError} from "@/lib/errors";
import {GameVariant, PlayerStatus, Winner} from "@/lib/types";

export async function createGame(roomId: string, variant: GameVariant): Promise<string> {
    const { rows } = await pool.query<{ gameId: string }>(`
        INSERT INTO games (room_id, variant)
        VALUES ($1, $2)
        RETURNING id as "gameId"
    `, [roomId, variant]);

    return rows[0].gameId;
}

export async function startGameAndDistributeCards(
    roomId: string,
    playerIds: string[],
    cards: PlayerStatus[]
): Promise<void> {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        await client.query(`
            UPDATE games
            SET started_at = NOW()
            WHERE room_id = $1
        `, [roomId])

        await client.query(`
            UPDATE rooms
            SET entry_code = NULL
            WHERE id = $1
        `, [roomId])

        // Build parameterized VALUES clause
        const placeholders = playerIds.map((_, i) => {
            const idIdx = i * 2 + 1
            const statusIdx = i * 2 + 2
            return `($${idIdx}::uuid, $${statusIdx})`
        }).join(',')

        const values = playerIds.flatMap((id, i) => [id, cards[i]])

        await client.query(`
            UPDATE players
            SET status = data.status::text
            FROM (VALUES ${placeholders}) AS data(id, status)
            WHERE players.id = data.id
        `, values)

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export async function completeGame(roomId: string, winner: Winner): Promise<void> {
    await pool.query(`
        UPDATE games
        SET completed_at = NOW(), winner = $1
        WHERE room_id = $2
        AND completed_at IS NULL
    `, [winner, roomId])
}

export async function getGameAndRoomIdFromCode(code: string): Promise<{ gameId: string; roomId: string }> {
    const { rows } = await pool.query<{ gameId: string; roomId: string }>(`
        SELECT g.id as "gameId", r.id as "roomId"
        FROM games g
        JOIN rooms r ON g.room_id = r.id
        WHERE r.entry_code = $1
          AND g.started_at IS NULL
    `, [code])

    if (rows.length === 0) {
        throw new NotFoundError('Invalid code or game not found')
    }

    return rows[0]
}

export async function getGameVariant(roomId: string): Promise<GameVariant> {
    const { rows } = await pool.query<{ variant: GameVariant }>(`
        SELECT variant
        FROM games
        WHERE room_id = $1
    `, [roomId])

    if (rows.length === 0) {
        throw new NotFoundError('Game not found')
    }

    return rows[0].variant
}

export async function isGameStarted(roomId: string): Promise<boolean | null> {
    const result = await pool.query<{started_at: string | null}>(`
        SELECT started_at
        FROM games
        WHERE room_id = $1
          AND completed_at IS NULL
            LIMIT 1
    `, [roomId])

    if (result.rows.length === 0) {
        return null  // No active game
    }

    return result.rows[0].started_at !== null
}

export async function validateGameNotStarted(roomId: string): Promise<void> {
    const started = await isGameStarted(roomId)

    switch (started) {
        case null:
            throw new BadRequestError('Game not found')
        case true:
            throw new BadRequestError('Game already started')
    }
}

export async function validateGameStarted(roomId: string): Promise<void> {
    const started = await isGameStarted(roomId)

    switch (started) {
        case null:
            throw new BadRequestError('Game not found')
        case false:
            throw new BadRequestError('Game has not started yet')
    }
}