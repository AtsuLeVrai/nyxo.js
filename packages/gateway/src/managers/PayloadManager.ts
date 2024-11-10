import type { Integer } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import erlpack from "erlpack";
import { EventEmitter } from "eventemitter3";
import type { EncodingTypes, GatewayEvents } from "../types/index.js";

export interface EncodingStats {
    successfulEncodes: Integer;
    successfulDecodes: Integer;
    failedEncodes: Integer;
    failedDecodes: Integer;
    lastError: Error | null;
    averageEncodeSize: number;
    averageDecodeSize: number;
    totalBytesProcessed: number;
}

export enum PayloadErrorCode {
    UnsupportedEncoding = "UNSUPPORTED_ENCODING",
    EncodeError = "ENCODE_ERROR",
    DecodeError = "DECODE_ERROR",
    InvalidInput = "INVALID_INPUT",
    InvalidBinary = "INVALID_BINARY",
    MaxSizeExceeded = "MAX_SIZE_EXCEEDED",
}

export class PayloadError extends Error {
    code: PayloadErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: PayloadErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "PayloadError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class PayloadManager extends EventEmitter<Pick<GatewayEvents, "error" | "debug" | "warn">> {
    static SUPPORTED_ENCODINGS = ["json", "etf"] as const;
    #encoding: EncodingTypes;
    #stats: EncodingStats;

    constructor(encoding: EncodingTypes) {
        super();
        this.#validateEncoding(encoding);
        this.#encoding = encoding;
        this.#stats = this.#createInitialStats();
    }

    get stats(): EncodingStats {
        return { ...this.#stats };
    }

    decode<T>(data: Buffer | string, isBinary: boolean): T {
        try {
            this.#emitDebug(`Starting decode operation (isBinary: ${isBinary})`);
            this.#validateDecodeInput(data, isBinary);

            const result = this.#performDecode<T>(data, isBinary);
            this.#updateDecodeStats(data);
            this.#emitDebug("Decode operation completed successfully");
            return result;
        } catch (error) {
            this.#handleError("decode", error);
            const payloadError =
                error instanceof PayloadError ? error : this.#createPayloadError("decode", error as Error);
            this.#emitError(payloadError);
            throw payloadError;
        }
    }

    encode(data: unknown): Buffer | string {
        try {
            this.#emitDebug("Starting encode operation");
            this.#validateEncodeInput(data);

            const result = this.#performEncode(data);
            this.#updateEncodeStats(result);
            this.#emitDebug("Encode operation completed successfully");
            return result;
        } catch (error) {
            this.#handleError("encode", error);
            const payloadError =
                error instanceof PayloadError ? error : this.#createPayloadError("encode", error as Error);
            this.#emitError(payloadError);
            throw payloadError;
        }
    }

    resetStats(): void {
        this.#stats = this.#createInitialStats();
    }

    #createInitialStats(): EncodingStats {
        return {
            successfulEncodes: 0,
            successfulDecodes: 0,
            failedEncodes: 0,
            failedDecodes: 0,
            lastError: null,
            averageEncodeSize: 0,
            averageDecodeSize: 0,
            totalBytesProcessed: 0,
        };
    }

    #validateEncoding(encoding: string): void {
        if (!this.#isSupportedEncoding(encoding)) {
            const error = new PayloadError(
                `Unsupported encoding type: ${encoding}`,
                PayloadErrorCode.UnsupportedEncoding,
                {
                    providedEncoding: encoding,
                    supportedEncodings: PayloadManager.SUPPORTED_ENCODINGS,
                },
            );
            this.#emitError(error);
            throw error;
        }
        this.#emitDebug(`Encoding validated: ${encoding}`);
    }

    #validateDecodeInput(data: Buffer | string, isBinary: boolean): void {
        if (data == null) {
            throw new PayloadError("Input data cannot be null or undefined", PayloadErrorCode.InvalidInput);
        }

        if (isBinary && !Buffer.isBuffer(data)) {
            throw new PayloadError("Binary data must be provided as Buffer", PayloadErrorCode.InvalidBinary, {
                dataType: typeof data,
            });
        }
    }

    #validateEncodeInput(data: unknown): void {
        if (data == null) {
            throw new PayloadError("Input data cannot be null or undefined", PayloadErrorCode.InvalidInput);
        }

        if (this.#hasCircularReferences(data)) {
            throw new PayloadError("Circular references detected in input data", PayloadErrorCode.InvalidInput, {
                data,
            });
        }
    }

    #performDecode<T>(data: Buffer | string, isBinary: boolean): T {
        if (!(isBinary || Buffer.isBuffer(data))) {
            this.#emitDebug("Decoding JSON string data");
            return this.#parseJson(data as string) as T;
        }

        if (this.#encoding === "json") {
            this.#emitDebug("Decoding JSON buffer data");
            return this.#parseJson(data.toString()) as T;
        }

        if (this.#encoding === "etf") {
            try {
                this.#emitDebug("Decoding ETF data");
                return erlpack.unpack(data as Buffer);
            } catch (error) {
                const payloadError = new PayloadError("Failed to unpack ETF data", PayloadErrorCode.DecodeError, {
                    originalError: error,
                });
                this.#emitError(payloadError);
                throw payloadError;
            }
        }

        const error = new PayloadError(
            `Unsupported encoding for decode: ${this.#encoding}`,
            PayloadErrorCode.UnsupportedEncoding,
        );
        this.#emitError(error);
        throw error;
    }

    #performEncode(data: unknown): Buffer | string {
        if (this.#encoding === "json") {
            this.#emitDebug("Encoding data to JSON");
            return this.#stringifyJson(data);
        }

        if (this.#encoding === "etf") {
            try {
                this.#emitDebug("Encoding data to ETF");
                return erlpack.pack(data);
            } catch (error) {
                const payloadError = new PayloadError("Failed to pack ETF data", PayloadErrorCode.EncodeError, {
                    originalError: error,
                });
                this.#emitError(payloadError);
                throw payloadError;
            }
        }

        const error = new PayloadError(
            `Unsupported encoding for encode: ${this.#encoding}`,
            PayloadErrorCode.UnsupportedEncoding,
        );
        this.#emitError(error);
        throw error;
    }

    #parseJson(data: string): unknown {
        try {
            return JSON.parse(data);
        } catch (error) {
            throw new PayloadError("Failed to parse JSON data", PayloadErrorCode.DecodeError, {
                originalError: error,
            });
        }
    }

    #stringifyJson(data: unknown): string {
        try {
            return JSON.stringify(data);
        } catch (error) {
            throw new PayloadError("Failed to stringify JSON data", PayloadErrorCode.EncodeError, {
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

    #updateEncodeStats(result: Buffer | string): void {
        this.#stats.successfulEncodes++;
        const size = Buffer.isBuffer(result) ? result.length : Buffer.byteLength(result);
        this.#stats.totalBytesProcessed += size;
        this.#stats.averageEncodeSize = this.#calculateNewAverage(
            this.#stats.averageEncodeSize,
            size,
            this.#stats.successfulEncodes,
        );
    }

    #updateDecodeStats(data: Buffer | string): void {
        this.#stats.successfulDecodes++;
        const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);
        this.#stats.totalBytesProcessed += size;
        this.#stats.averageDecodeSize = this.#calculateNewAverage(
            this.#stats.averageDecodeSize,
            size,
            this.#stats.successfulDecodes,
        );
    }

    #calculateNewAverage(oldAvg: number, newValue: number, count: number): number {
        return oldAvg + (newValue - oldAvg) / count;
    }

    #handleError(operation: "encode" | "decode", error: unknown): void {
        if (operation === "encode") {
            this.#stats.failedEncodes++;
        } else {
            this.#stats.failedDecodes++;
        }
        this.#stats.lastError = error as Error;
    }

    #createPayloadError(operation: "encode" | "decode", originalError: Error): PayloadError {
        return new PayloadError(
            `Failed to ${operation} payload: ${originalError.message}`,
            operation === "encode" ? PayloadErrorCode.EncodeError : PayloadErrorCode.DecodeError,
            {
                encoding: this.#encoding,
            },
            originalError,
        );
    }

    #isSupportedEncoding(encoding: string): encoding is EncodingTypes {
        return PayloadManager.SUPPORTED_ENCODINGS.includes(encoding as EncodingTypes);
    }

    #emitError(error: PayloadError): void {
        this.emit(
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
        this.emit(
            "debug",
            Logger.debug(message, {
                component: "PayloadManager",
            }),
        );
    }
}
