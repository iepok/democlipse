// components/AttemptedJoinBanner.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Button from './Button'

export default function AttemptedJoinBanner({
                                                currentRoomId,
                                                currentPlayerId
                                            }: {
    currentRoomId: string
    currentPlayerId: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const attemptedJoin = searchParams.get('attemptedJoin')
    const [error, setError] = useState<string | null>(null)

    if (!attemptedJoin) return null

    const handleStayHere = () => {
        router.push(`/room/${currentRoomId}`)
    }

    const handleLeaveAndJoin = async () => {
        try {
            // First check if target room is still valid
            const checkResponse = await fetch(`/api/rooms/${attemptedJoin}/check`)
            const checkData = await checkResponse.json()

            if (!checkResponse.ok || checkData.started || checkData.completed) {
                setError('That game is no longer available')
                return
            }

            // Target is valid - reveal card in current room
            await fetch(`/api/players/${currentPlayerId}/reveal`, {
                method: 'POST'
            })

            // Redirect to new room
            router.push(`/room/${attemptedJoin}`)
            router.refresh()
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