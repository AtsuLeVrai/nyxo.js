import type { HttpResponseCodes } from "@nyxjs/core";

export type RestErrorOptions = {
    code?: number;
    httpStatus?: HttpResponseCodes;
    method?: string;
    path?: string;
    requestBody?: unknown;
};

export class RestError extends Error {
    private readonly details: RestErrorOptions;

    public constructor(message: string, options: RestErrorOptions) {
        super(message);
        this.name = "RestError";
        this.details = { ...options };
        Object.setPrototypeOf(this, RestError.prototype);
    }

    public get code(): number | undefined {
        return this.details.code;
    }

    public get method(): string | undefined {
        return this.details.method;
    }

    public get path(): string | undefined {
        return this.details.path;
    }

    public get httpStatus(): HttpResponseCodes | undefined {
        return this.details.httpStatus;
    }

    public get requestBody(): unknown {
        return this.details.requestBody;
    }

    public toString(): string {
        return `RestError [${this.code}]: ${this.message} (${this.method} ${this.path})`;
    }

    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            ...this.details,
        };
    }
}
