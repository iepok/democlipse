// types.ts

export type PlayerStatus = null | 'ready' | 'good' | 'bad' | 'joker' | 'hidden'

export type GameVariant = 'standard' | 'apocalypse'

export type Winner = null | 'goodTeam' | 'badTeam' | 'jokerTeam' | 'all' | 'none'

export interface Player {
    id: string
    userId: string
    name: string
    status: PlayerStatus
    revealedAt: Date | null
}

export interface Room {
    roomId: string
    entryCode: string | null
    gameId: string
    variant: GameVariant
    startedAt: Date | null
    completedAt: Date | null
    winner: Winner
    players: Player[]
}
