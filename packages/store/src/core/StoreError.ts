import type { StoreErrorCode, StoreErrorOptions } from "../types";

export class StoreError extends Error {
    private readonly details: StoreErrorOptions;

    public constructor(message: string, options: StoreErrorOptions) {
        super(message);
        this.name = "StoreError";
        this.details = { ...options };
        Object.setPrototypeOf(this, StoreError.prototype);
    }

    public get code(): StoreErrorCode | undefined {
        return this.details.code;
    }

    public toString(): string {
        return `StoreError [${this.code}]: ${this.message}`;
    }

    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            ...this.details,
        };
    }
}
