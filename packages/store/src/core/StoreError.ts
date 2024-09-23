import type { StoreErrorCode } from "../types";

const details = Symbol("details");

type StoreErrorOptions = {
    /**
     * The specific error code from StoreErrorCode enum.
     */
    code: StoreErrorCode;
    /**
     * The timestamp when the error occurred.
     */
    timestamp: number;
};

export class StoreError extends Error {
    private readonly [details]: StoreErrorOptions;

    public constructor(message: string, code: StoreErrorCode) {
        super(message);
        this.name = "StoreError";
        this[details] = {
            code,
            timestamp: Date.now(),
        };
        Object.setPrototypeOf(this, StoreError.prototype);
    }

    public get code(): StoreErrorCode {
        return this[details].code;
    }

    public get timestamp(): number {
        return this[details].timestamp;
    }

    public toString(): string {
        return `StoreError [${this.code}]: ${this.message} (at ${new Date(this.timestamp).toISOString()})`;
    }

    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp,
        };
    }
}
