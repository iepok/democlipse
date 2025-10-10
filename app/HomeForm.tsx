'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function HomeForm({ defaultName }: { defaultName: string }) {
    const router = useRouter()
    const [name, setName] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const savedName = localStorage.getItem('playerName')
        setName(savedName || defaultName)
    }, [defaultName])

    const handleSubmit = async () => {
        if (!name.trim()) return

        setLoading(true)
        localStorage.setItem('playerName', name)

        try {
            if (code) {
                // Join room
                const res = await fetch(`/api/rooms/join/${code}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                })
                const data = await res.json()
                router.push(`/room/${data.room.roomId}`)
            } else {
                // Create room
                const res = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, variant: 'standard' })
                })
                const data = await res.json()
                router.push(`/room/${data.room.roomId}`)
            }
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-4 bg-white border border-black rounded p-6">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                    className="w-full bg-white border border-black rounded px-4 py-2"
                />

                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Room code (optional)"
                    className="w-full bg-white border border-black rounded px-4 py-2"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading || !name.trim()}
                    className="w-full bg-white border border-black rounded px-4 py-2 disabled:opacity-50 hover:bg-gray-50"
                >
                    {loading ? 'Loading...' : code ? 'Join Room' : 'Create Room'}
                </button>
            </div>
        </div>
    )
}