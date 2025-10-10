'use client'

import { signIn } from 'next-auth/react'

export default function LoginButton() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <button
                onClick={() => signIn('google')}
                className="bg-white border border-black rounded px-6 py-3 hover:bg-gray-50"
            >
                Sign in with Google
            </button>
        </div>
    )
}