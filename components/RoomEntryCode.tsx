'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'
import Button from './Button'

interface RoomEntryCodeProps {
    roomId: string
    entryCode: string | null
    canGenerateCode: boolean
}

export default function RoomEntryCode({roomId, entryCode, canGenerateCode}: RoomEntryCodeProps) {
    const router = useRouter()
    const [copied, setCopied] = useState(false)

    const handleGenerateCode = async () => {
        await fetch(`/api/rooms/${roomId}/code`, {method: 'POST'})
        router.refresh()
    }

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/room/${roomId}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="mb-6 space-y-3">
            {entryCode && (
                <div className="text-center p-4 border border-black rounded">
                    <p className="text-sm text-gray-600 mb-2">Room Code</p>
                    <p className="text-4xl font-bold tracking-wider">{entryCode}</p>
                </div>
            )}

            <div className="flex gap-2">
                {canGenerateCode && (
                    <Button onClick={handleGenerateCode} variant="secondary" className="flex-1">
                        Generate Room Code
                    </Button>
                )}

                <Button onClick={handleCopyLink} variant="secondary" className={canGenerateCode ? "flex-1" : "w-full"}>
                    {copied ? 'Copied!' : 'Share Link'}
                </Button>
            </div>
        </div>
    )
}