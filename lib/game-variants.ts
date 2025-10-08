import {GameVariant, PlayerStatus, Room, Winner} from "@/lib/types";
import {ApiError, BadRequestError} from "@/lib/errors";

interface VariantConfig {
    minPlayers: number
    maxPlayers: number
    distributeCards: (playerCount: number) => PlayerStatus[]
    findWinner: (room: Room, declaration: Winner) => Winner
}

export const DEFAULT_GAME_VARIANT: GameVariant = 'standard'

export const GAME_VARIANTS: Record<GameVariant, VariantConfig> = {
    standard: {
        minPlayers: 3,
        maxPlayers: 8,
        distributeCards: (playerCount: number): PlayerStatus[] => {
            switch (playerCount) {
                case 3:
                    return shuffleArray(['good', 'good', 'bad'])
                case 4:
                    return shuffleArray(['good', 'good', 'good', 'bad'])
                case 5:
                    return shuffleArray(['good', 'good', 'good', 'bad', 'joker'])
                case 6:
                    return shuffleArray(['good', 'good', 'good', 'good', 'bad', 'bad'])
                case 7:
                    return shuffleArray(['good', 'good', 'good', 'good', 'bad', 'bad', 'joker'])
                case 8:
                    return shuffleArray(['good', 'good', 'good', 'good', 'good', 'bad', 'bad', 'joker'])
                default:
                    throw new ApiError(`Invalid player count for standard variant: ${playerCount}`)
            }
        },
        findWinner: (room: Room): Winner => {
            // Game not started yet
            if (!room.startedAt) return null

            const players = room.players
            const revealedPlayers = players.filter(p => p.revealedAt !== null)

            // No one revealed yet
            if (revealedPlayers.length === 0) return null

            // Sort by reveal time to find first reveal
            const sortedRevealed = [...revealedPlayers].sort((a, b) =>
                a.revealedAt!.getTime() - b.revealedAt!.getTime()
            )
            const firstRevealed = sortedRevealed[0]

            // Rule 1: Joker revealed first → Joker wins
            if (firstRevealed.status === 'joker') {
                return 'jokerTeam'
            }

            const goodPlayers = players.filter(p => p.status === 'good')
            const badPlayers = players.filter(p => p.status === 'bad')

            const allBadRevealed = badPlayers.every(p => p.revealedAt !== null)
            const unrevealedGood = goodPlayers.filter(p => p.revealedAt === null)

            // Rule 2: All bad revealed → Good team wins
            if (allBadRevealed && badPlayers.length > 0) {
                return 'goodTeam'
            }

            // Rule 3: Only 1 good unrevealed → Bad team wins
            if (unrevealedGood.length === 1) {
                return 'badTeam'
            }

            // Game still ongoing
            return null
        }
    },
    apocalypse: {
        minPlayers: 3,
        maxPlayers: 3,
        distributeCards: (playerCount: number): PlayerStatus[] => {
            return Array.from({ length: playerCount }, () =>
                Math.random() < 0.5 ? 'good' : 'bad'
            )
        },
        findWinner: (room: Room, declaration: Winner): Winner => {
            if (!room.startedAt) return null

            const players = room.players
            const goodCount = players.filter(p => p.status === 'good').length
            const badCount = players.filter(p => p.status === 'bad').length

            // Declaration made
            if (declaration !== null) {
                // All same team as declaration → everyone wins
                if (declaration === 'goodTeam' && goodCount === 3) return 'all'
                if (declaration === 'badTeam' && badCount === 3) return 'all'

                // All opposite team from declaration → no one wins
                if (declaration === 'goodTeam' && badCount === 3) return 'none'
                if (declaration === 'badTeam' && goodCount === 3) return 'none'

                // Declaration made but it's a 2-1 split → minority wins
                if (goodCount === 1) return 'goodTeam'
                if (badCount === 1) return 'badTeam'
            }

            // No declaration: check if one revealed
            const revealedPlayers = players.filter(p => p.revealedAt !== null)

            if (revealedPlayers.length === 1) {
                const revealed = revealedPlayers[0]

                // If revealed is different from the other two (minority) → majority wins
                if (revealed.status === 'good' && goodCount === 1) return 'badTeam'
                if (revealed.status === 'bad' && badCount === 1) return 'goodTeam'
            }

            // Any other result → minority wins
            if (goodCount === 1) return 'goodTeam'
            if (badCount === 1) return 'badTeam'

            return null
        }
    }
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export function validateMinPlayers(
    playerCount: number,
    variant: GameVariant
): void {
    const minPlayers = GAME_VARIANTS[variant].minPlayers

    if (playerCount < minPlayers) {
        throw new BadRequestError(`Need at least ${minPlayers} players`)
    }
}

export function validateMaxPlayers(
    playerCount: number,
    variant: GameVariant
): void {
    const maxPlayers = GAME_VARIANTS[variant].maxPlayers

    if (playerCount >= maxPlayers) {
        throw new BadRequestError('Room is full')
    }
}

export function validateVariant(variant?: string): GameVariant {
    if (!variant) return DEFAULT_GAME_VARIANT

    if (variant in GAME_VARIANTS) {
        return variant as GameVariant
    }

    throw new BadRequestError('Invalid game variant')
}
