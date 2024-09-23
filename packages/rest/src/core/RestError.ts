import type { HttpResponseCodes } from "@nyxjs/core";

const errorDetails = Symbol("errorDetails");

export type RestErrorOptions = Readonly<{
    code?: number;
    httpStatus?: HttpResponseCodes;
    method?: string;
    path?: string;
    requestBody?: unknown;
}>;

export class RestError extends Error {
    private readonly [errorDetails]: RestErrorOptions;

    public constructor(message: string, options: RestErrorOptions) {
        super(message);
        this.name = "RestError";
        this[errorDetails] = Object.freeze({ ...options });
        Object.setPrototypeOf(this, RestError.prototype);
    }

    public get code(): number | undefined {
        return this[errorDetails].code;
    }

    public get method(): string | undefined {
        return this[errorDetails].method;
    }

    public get path(): string | undefined {
        return this[errorDetails].path;
    }

    public get httpStatus(): HttpResponseCodes | undefined {
        return this[errorDetails].httpStatus;
    }

    public get requestBody(): unknown {
        return this[errorDetails].requestBody;
    }

    public toString(): string {
        return `RestError [${this.code}]: ${this.message} (${this.method} ${this.path})`;
    }

    public toJSON(): Readonly<Record<string, unknown>> {
        return Object.freeze({
            name: this.name,
            message: this.message,
            ...this[errorDetails],
        });
    }
}
