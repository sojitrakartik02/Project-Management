export class HttpException extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status
        this.message = message
    }
}



export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
        this.stack = (new Error()).stack;
    }
}

export class ValidationError extends Error {
    constructor(message: string, public errors: any[]) {
        super(message);
        this.name = "ValidationError";
        this.stack = (new Error()).stack;
    }
}