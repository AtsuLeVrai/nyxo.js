import type { HttpResponseCodes } from "@nyxjs/core";

export class RestError extends Error {
    public code: number;

    public method: string;

    public path: string;

    public httpStatus: number;

    public requestBody: any;

    public constructor(
        message: string,
        code: number,
        method: string,
        path: string,
        httpStatus: HttpResponseCodes,
        requestBody?: any
    ) {
        super(message);
        this.name = "RestError";
        this.code = code;
        this.method = method;
        this.path = path;
        this.httpStatus = httpStatus;
        this.requestBody = requestBody;
        Object.setPrototypeOf(this, RestError.prototype);
    }

    public toString(): string {
        return `RestError [${this.code}]: ${this.message} (${this.method} ${this.path})`;
    }

    public toJSON(): Record<string, any> {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            method: this.method,
            path: this.path,
            httpStatus: this.httpStatus,
            requestBody: this.requestBody,
        };
    }
}
