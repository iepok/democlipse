'use client'

import { useRouter } from 'next/navigation'
import Button from './Button'

interface RoomEntryCodeProps {
    roomId: string
    entryCode: string | null
    canGenerateCode: boolean
}

export default function RoomEntryCode({roomId, entryCode, canGenerateCode}: RoomEntryCodeProps) {
    const router = useRouter()

    const handleGenerateCode = async () => {
        await fetch(`/api/rooms/${roomId}/code`, { method: 'POST' })
        router.refresh()
    }

    if (entryCode) {
        return (
            <div className="text-center mb-6 p-4 border border-black rounded">
                <p className="text-sm text-gray-600 mb-2">Room Code</p>
                <p className="text-4xl font-bold tracking-wider">{entryCode}</p>
            </div>
        )
    }

    if (canGenerateCode) {
        return (
            <div className="text-center mb-6">
                <Button onClick={handleGenerateCode} variant="secondary">
                    Generate Room Code
                </Button>
            </div>
        )
    }

    return null
}