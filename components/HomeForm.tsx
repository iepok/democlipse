'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'
import Input from './Input'
import Button from './Button'

export default function HomeForm({defaultName}: {defaultName: string}) {
    const router = useRouter()
    const [name, setName] = useState(defaultName)
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return
        setLoading(true)

        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, variant: 'standard'})
            })
            if (!res.ok) {
                throw new Error('Failed to create room')
            }
            const { roomId } = await res.json()
            router.replace(`/room/${roomId}`)
        } catch (error) {
            alert('Failed to create room')
            setLoading(false)
        }
    }

    const handleJoin = async () => {
        if (!name.trim() || !code) return
        setLoading(true)

        try {
            const res = await fetch(`/api/rooms/join/${code}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name})
            })
            if (!res.ok) {
                throw new Error('Failed to create room')
            }
            const { roomId } = await res.json()
            router.replace(`/room/${roomId}`)
        } catch (error) {
            alert('Failed to join room')
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6 bg-white border border-black rounded p-6">
            <Input
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
            />

            <div>
                <Button
                    onClick={handleCreate}
                    disabled={loading || !name.trim()}
                    className="w-full"
                >
                    Create Room
                </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <Input
                    label="Room Code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                />
                <Button
                    onClick={handleJoin}
                    disabled={loading || !name.trim() || code.length !== 4}
                    variant="secondary"
                    className="w-full mt-3"
                >
                    Join Room
                </Button>
            </div>
        </div>
    )
}