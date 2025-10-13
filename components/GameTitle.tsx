import {GAME_VARIANTS} from '@/lib/game-variants'
import {GameVariant} from '@/lib/types'

export default function GameTitle({variant}: {variant: GameVariant}) {
    const variantConfig = GAME_VARIANTS[variant]
    const minPlayers = variantConfig.minPlayers
    const maxPlayers = variantConfig.maxPlayers

    const playerRange = minPlayers === maxPlayers ? `${minPlayers}` : `${minPlayers}-${maxPlayers}`
    const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} game (${playerRange})`

    return (
        <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
    )
}