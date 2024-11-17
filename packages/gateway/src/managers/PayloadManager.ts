import { Logger } from "@nyxjs/logger";
import erlpack from "erlpack";
import type { Gateway } from "../Gateway.js";
import { BaseError, ErrorCodes } from "../errors/index.js";
import type { EncodingTypes } from "../types/index.js";

export class PayloadError extends BaseError {}

export class PayloadManager {
    static SUPPORTED_ENCODINGS = ["json", "etf"] as const;

    readonly #gateway: Gateway;
    readonly #encoding: EncodingTypes;

    constructor(gateway: Gateway, encoding: EncodingTypes) {
        this.#gateway = gateway;
        this.#encoding = this.#validateEncoding(encoding);
        this.#emitDebug(`PayloadManager initialized with ${encoding} encoding`);
    }

    decode<T>(data: Buffer | string, isBinary: boolean): T {
        try {
            this.#validateDecodeInput(data, isBinary);
            return this.#performDecode<T>(data, isBinary);
        } catch (error) {
            const payloadError =
                error instanceof PayloadError
                    ? error
                    : new PayloadError(
                          `Failed to decode payload: ${(error as Error).message}`,
                          ErrorCodes.PayloadDecodingError,
                          { encoding: this.#encoding },
                          error as Error,
                      );
            this.#emitError(payloadError);
            throw payloadError;
        }
    }

    encode(data: unknown): Buffer | string {
        try {
            this.#validateEncodeInput(data);
            return this.#performEncode(data);
        } catch (error) {
            const payloadError =
                error instanceof PayloadError
                    ? error
                    : new PayloadError(
                          `Failed to encode payload: ${(error as Error).message}`,
                          ErrorCodes.PayloadEncodingError,
                          { encoding: this.#encoding },
                          error as Error,
                      );
            this.#emitError(payloadError);
            throw payloadError;
        }
    }

    #validateEncoding(encoding: string): EncodingTypes {
        const supportedEncoding = PayloadManager.SUPPORTED_ENCODINGS.includes(encoding as EncodingTypes);
        if (!supportedEncoding) {
            throw new PayloadError(`Unsupported encoding type: ${encoding}`, ErrorCodes.PayloadUnsupportedFormat, {
                providedEncoding: encoding,
                supportedEncodings: PayloadManager.SUPPORTED_ENCODINGS,
            });
        }
        return encoding as EncodingTypes;
    }

    #validateDecodeInput(data: Buffer | string, isBinary: boolean): void {
        if (data == null) {
            throw new PayloadError("Input data cannot be null or undefined", ErrorCodes.PayloadInvalidInput);
        }

        if (isBinary && !Buffer.isBuffer(data)) {
            throw new PayloadError("Binary data must be provided as Buffer", ErrorCodes.PayloadInvalidBinary, {
                dataType: typeof data,
            });
        }
    }

    #validateEncodeInput(data: unknown): void {
        if (data == null) {
            throw new PayloadError("Input data cannot be null or undefined", ErrorCodes.PayloadInvalidInput);
        }

        if (this.#hasCircularReferences(data)) {
            throw new PayloadError("Circular references detected in input data", ErrorCodes.PayloadInvalidInput);
        }
    }

    #performDecode<T>(data: Buffer | string, isBinary: boolean): T {
        if (!(isBinary || Buffer.isBuffer(data))) {
            return this.#parseJson(data as string) as T;
        }

        if (this.#encoding === "json") {
            return this.#parseJson(data.toString()) as T;
        }

        if (this.#encoding === "etf") {
            try {
                return erlpack.unpack(data as Buffer);
            } catch (error) {
                throw new PayloadError("Failed to unpack ETF data", ErrorCodes.PayloadDecodingError, {
                    originalError: error,
                });
            }
        }

        throw new PayloadError(
            `Unsupported encoding for decode: ${this.#encoding}`,
            ErrorCodes.PayloadUnsupportedFormat,
        );
    }

    #performEncode(data: unknown): Buffer | string {
        if (this.#encoding === "json") {
            return this.#stringifyJson(data);
        }

        if (this.#encoding === "etf") {
            try {
                return erlpack.pack(data);
            } catch (error) {
                throw new PayloadError("Failed to pack ETF data", ErrorCodes.PayloadEncodingError, {
                    originalError: error,
                });
            }
        }

        throw new PayloadError(
            `Unsupported encoding for encode: ${this.#encoding}`,
            ErrorCodes.PayloadUnsupportedFormat,
        );
    }

    #parseJson(data: string): unknown {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new PayloadError("Failed to parse JSON data", ErrorCodes.PayloadDecodingError, {
                originalError: error,
            });
        }
    }

    #stringifyJson(data: unknown): string {
        try {
            return JSON.stringify(data);
        } catch (error) {
            throw new PayloadError("Failed to stringify JSON data", ErrorCodes.PayloadEncodingError, {
                originalError: error,
            });
        }
    }

    #hasCircularReferences(obj: unknown, seen = new Set()): boolean {
        if (typeof obj !== "object" || obj === null) {
            return false;
        }

        if (seen.has(obj)) {
            return true;
        }

        seen.add(obj);

        for (const value of Object.values(obj as object)) {
            if (this.#hasCircularReferences(value, seen)) {
                return true;
            }
        }

        seen.delete(obj);
        return false;
    }

    #emitError(error: PayloadError): void {
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "PayloadManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string): void {
        this.#gateway.emit(
            "debug",
            Logger.debug(message, {
                component: "PayloadManager",
            }),
        );
    }
}
