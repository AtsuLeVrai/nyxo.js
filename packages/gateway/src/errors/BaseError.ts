import type { ErrorCodes } from "./codes.js";

export abstract class BaseError extends Error {
    code: ErrorCodes;
    details?: Record<string, unknown>;

    constructor(message: string, code: ErrorCodes, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.cause = cause;

        if (process.env["NODE_ENV"] === "development") {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
