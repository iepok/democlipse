// lib/error-handler.ts

import { NextResponse } from 'next/server'
import { ApiError } from './errors'

export function handleApiError(error: unknown) {
    console.error('API Error:', error)

    if (error instanceof ApiError) {
        return NextResponse.json(
            { message: error.message },
            { status: error.statusCode }
        )
    }

    return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
    )
}