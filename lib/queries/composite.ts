import {validateUserNotInOpenGame} from './rooms'
import {validateGameNotStarted, getGameVariant} from './games'
import {getPlayerCount} from './players'
import {validateMaxPlayers} from '@/lib/game-variants'

export async function validatePlayerJoin(
    roomId: string,
    userId: string
): Promise<void> {
    await validateUserNotInOpenGame(userId)
    await validateGameNotStarted(roomId)

    const gameVariant = await getGameVariant(roomId)
    const playerCount = await getPlayerCount(roomId)

    validateMaxPlayers(playerCount, gameVariant)
}
