'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Button from './Button'

export default function AttemptedJoinBanner({ roomId, playerId }: { roomId: string, playerId: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const attemptedJoin = searchParams.get('attemptedJoin')
    const [error, setError] = useState<string | null>(null)

    if (!attemptedJoin) return null

    const handleStayHere = () => {
        router.replace(`/room/${roomId}`)
    }

    const handleLeaveAndJoin = async () => {
        try {
            const checkResponse = await fetch(`/api/rooms/${attemptedJoin}/canJoin`)
            const checkData = await checkResponse.json()

            if (!checkResponse.ok || !checkData.joinable) {
                setError('That game is no longer available')
                return
            }

            await fetch(`/api/players/${playerId}/reveal`, { method: 'POST' })

            router.push(`/room/${attemptedJoin}`)
        } catch (err) {
            setError('Something went wrong')
        }
    }

    return (
        <div className="mb-4 p-4 border border-black rounded">
            <p className="text-sm mb-3">
                You tried to join another game.
            </p>

            {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
            )}

            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleStayHere}>
                    Stay Here
                </Button>
                <Button onClick={handleLeaveAndJoin}>
                    Leave & Join New Room
                </Button>
            </div>
        </div>
    )
}