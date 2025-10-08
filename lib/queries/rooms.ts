import {pool} from "@/lib/db";
import {Player, PlayerStatus, Room, RoomQueryRow} from "@/lib/types";
import {BadRequestError, UnauthorizedError} from "@/lib/errors";

export async function getRoom(roomId: string, userId: string): Promise<Room> {
    const result = await pool.query<RoomQueryRow>(`
        SELECT
            r.id as "roomId",
            r.entry_code as "entryCode",
            g.variant,
            g.started_at as "startedAt",
            g.completed_at as "completedAt",
            g.winner,
            p.id,
            p.user_id as "userId",
            p.name,
            p.status,
            p.revealed_at as "revealedAt"
        FROM rooms r
            LEFT JOIN LATERAL (
            SELECT id, variant, started_at, completed_at, winner
            FROM games
            WHERE room_id = r.id
            ORDER BY created_at DESC
            LIMIT 1
        ) g ON true
        LEFT JOIN players p ON p.game_id = g.id
        WHERE r.id = $1
        ORDER BY p.created_at ASC
    `, [roomId]);

    if (result.rows.length === 0) {
        throw new Error('Room not found');
    }

    const firstRow = result.rows[0];

    const players: Player[] = result.rows
        .filter(row => row.id !== null)
        .map(row => ({
            id: row.id,
            userId: row.userId,
            name: row.name,
            status: hideCardIfNeeded(row, userId),
            revealedAt: row.revealedAt
        }));

    return {
        roomId: firstRow.roomId,
        entryCode: firstRow.entryCode,
        variant: firstRow.variant,
        startedAt: firstRow.startedAt,
        completedAt: firstRow.completedAt,
        winner: firstRow.winner,
        players
    };
}

function hideCardIfNeeded(row: any, currentUserId: string): PlayerStatus {
    if (
        row.userId === currentUserId ||
        row.status === null ||
        row.status === 'ready' ||
        row.revealedAt !== null ||
        row.winner !== null
    ) {
        return row.status;
    }

    // Hide opponent's unrevealed card
    return 'hidden';
}

export async function createRoom(): Promise<string> {
    const result = await pool.query(`
        INSERT INTO rooms DEFAULT VALUES
        RETURNING id as "roomId"
    `);

    return result.rows[0].roomId;
}

export async function generateEntryCode(roomId: string): Promise<void> {
    const start = Math.floor(Math.random() * 10000) // 0-9999
    const STEP = 7919 // Coprime with 10000

    for (let i = 0; i < 10000; i++) {
        const code = (start + i * STEP) % 10000

        try {
            await pool.query(`
                UPDATE rooms SET entry_code = $1 WHERE id = $2
                `, [code.toString().padStart(4, '0'), roomId]) // Pad with zeros
            return
        } catch (error) {
            // Try next
        }
    }

    throw new Error('All codes in use')
}

/**
 * Validates user is a member of the room
 * Generic error - doesn't reveal if room exists (security)
 */
export async function requireRoomMembership(
    roomId: string,
    userId: string
): Promise<void> {
    const result = await pool.query(`
        SELECT 1 
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE g.room_id = $1 AND p.user_id = $2
    `, [roomId, userId])

    if (result.rows.length === 0) {
        throw new UnauthorizedError()  // Generic - doesn't leak info
    }
}

export async function validateUserNotInOpenGame(userId: string): Promise<void> {
    const result = await pool.query(`
        SELECT 1 
        FROM players p
        JOIN games g ON g.id = p.game_id
        WHERE p.user_id = $1 
        AND g.completed_at IS NULL
        LIMIT 1
    `, [userId])

    if (result.rows.length > 0) {
        throw new BadRequestError('You are already in an active game')
    }
}
