export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401)
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(message, 400)
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string) {
        super(message, 404)
    }
}