import {NextAuthOptions, getServerSession} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import {BadRequestError, UnauthorizedError} from "@/lib/errors";

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!
            }
            return session
        }
    }
}

export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new UnauthorizedError()
    }

    return session.user.id
}

export function validateName(name: string): string {
    if (!name) {
        throw new BadRequestError('Name is required')
    }

    if (name.trim().length < 2) {
        throw new BadRequestError('Name must be at least 2 characters')
    }

    return name.trim()
}