'use client'

import {signOut} from 'next-auth/react'
import Button from './Button'

export default function LogoutButton() {
    return (
        <Button
            variant="secondary"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm"
        >
            Logout
        </Button>
    )
}