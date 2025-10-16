'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Player, PlayerStatus} from '@/lib/types'
import Button from './Button'
import Input from './Input'

export default function CurrentPlayerSection({ player }: { player: Player }) {
    const router = useRouter()
    const [name, setName] = useState(player.name)
    const [showCard, setShowCard] = useState(false)

    const handleReady = async () => {
        try {
            const res = await fetch(`/api/players/${player.id}/ready`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name})
            })

            if (!res.ok) {
                throw new Error('Failed to ready up')
            }

            router.refresh()
        } catch (error) {
            alert('Failed to ready up. Please try again.')
        }
    }

    const handleReveal = async () => {
        await fetch(`/api/players/${player.id}/reveal`, { method: 'POST' })
        router.refresh()
    }

    const handleLeave = async () => {
        try {
            if (player.status === null || player.status === 'ready') {
                await fetch(`/api/players/${player.id}`, { method: 'DELETE' })
            } else if (player.status === 'good' || player.status === 'bad' || player.status === 'joker') {
                if (!player.revealedAt) {
                    await fetch(`/api/players/${player.id}/reveal`, { method: 'POST' })
                }
            }

            router.push('/')
        } catch (err) {
            alert('Failed to leave room. Please try again.')
        }
    }

    const renderByStatus = (status: PlayerStatus) => {
        switch (status) {
            case null:
                return (
                    <>
                        <div className="mb-3">
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <Button onClick={handleReady} className="w-full">
                            Ready Up
                        </Button>
                    </>
                )

            case 'ready':
                return (
                    <p className="text-center text-green-600 font-medium py-3">
                        Waiting for others to ready up...
                    </p>
                )

            case 'good':
            case 'bad':
            case 'joker':
                const cardName = status.charAt(0).toUpperCase() + status.slice(1)
                const cardColor =
                    status === 'good' ? 'text-blue-600' :
                        status === 'bad' ? 'text-red-600' :
                            'text-purple-600'

                return (
                    <>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Your Card</p>
                            <p className={`text-2xl font-bold ${cardColor} ${!showCard && 'blur-sm'}`}>
                                {cardName}
                            </p>
                            <button
                                onClick={() => setShowCard(!showCard)}
                                className="text-sm text-gray-500 underline mt-2"
                            >
                                {showCard ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {player.revealedAt ? (
                            <p className="text-center text-gray-600 font-medium py-3">
                                Waiting for game to end...
                            </p>
                        ) : (
                            <Button onClick={handleReveal} className="w-full">
                                Reveal Card
                            </Button>
                        )}
                    </>
                )

            case 'hidden':
                return null
        }
    }

    return (
        <div className="bg-white rounded-lg border border-black p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">{player.name}</span>
                <span className="text-sm text-gray-500">(You)</span>
            </div>

            {renderByStatus(player.status)}

            <button
                onClick={handleLeave}
                className="w-full mt-4 text-sm text-red-600 hover:text-red-700 underline"
            >
                Leave Room
            </button>
        </div>
    )
}