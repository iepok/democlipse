import {GameVariant, Player, PlayerStatus, Room, Winner} from "@/lib/types";
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
            const presets: Record<number, PlayerStatus[]> = {
                3: ['good', 'good', 'bad'],
                4: ['good', 'good', 'good', 'bad'],
                5: ['good', 'good', 'good', 'bad', 'joker'],
                6: ['good', 'good', 'good', 'good', 'bad', 'bad'],
                7: ['good', 'good', 'good', 'good', 'bad', 'bad', 'joker'],
                8: ['good', 'good', 'good', 'good', 'good', 'bad', 'bad', 'joker'],
            }

            const cards = presets[playerCount]
            if (!cards) {
                throw new ApiError(`Invalid player count for standard variant: ${playerCount}`)
            }

            return shuffleArray(cards)
        },
        findWinner: (room: Room): Winner => {
            // Game not started yet
            if (!room.startedAt) return null

            const players = room.players

            let firstRevealed: Player | undefined
            let hiddenBad: number = 0
            let hiddenGood: number = 0
            let jokerHidden = false

            for (const player of players) {
                if (player.revealedAt !== null) {
                    if (!firstRevealed || player.revealedAt.getTime() < firstRevealed.revealedAt!.getTime()) {
                        firstRevealed = player
                    }
                } else {
                    switch (player.status) {
                        case 'good': hiddenGood++; break
                        case 'bad': hiddenBad++; break
                        case 'joker': jokerHidden = true
                    }
                }
            }

            // No one revealed yet
            if (firstRevealed === undefined) return null

            // Rule 1: Joker revealed first → solo win
            if (firstRevealed.status === 'joker') {
                return 'jokerTeam'
            }

            // Joker joins first revealed's team (even if revealed later)

            if (jokerHidden) {
                if (firstRevealed.status === 'good') hiddenGood++
                else if (firstRevealed.status === 'bad') hiddenBad++
            }

            // Rule 2: All bad revealed → Good team wins
            if (hiddenBad === 0) {
                return 'goodTeam'
            }

            // Rule 3: Only one good left unrevealed → Bad team wins
            if (hiddenGood === 1) {
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
