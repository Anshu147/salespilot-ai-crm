export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode = 400
    ) {
        super(message);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}