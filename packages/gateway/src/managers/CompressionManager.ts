import { formatErrorLog } from "@nyxjs/utils";
import zlib from "zlib-sync";
import type { Gateway } from "../Gateway.js";

export type CompressionStats = {
    totalDecompressed: number;
    failedDecompressions: number;
    lastError: Error | null;
    bytesProcessed: number;
    compressionRatio?: number;
};

export enum CompressionErrorCode {
    ZlibInitError = "ZLIB_INIT_ERROR",
    InflatorNotInitialized = "INFLATOR_NOT_INITIALIZED",
    DecompressionError = "DECOMPRESSION_ERROR",
    InvalidData = "INVALID_DATA",
}

export class CompressionError extends Error {
    code: CompressionErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: CompressionErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "CompressionError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class CompressionManager {
    static FLUSH_MARKER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
    static MAX_CHUNK_SIZE = 1024 * 1024;

    #gateway: Gateway;
    #inflator: zlib.Inflate | null = null;
    #stats: CompressionStats = {
        totalDecompressed: 0,
        failedDecompressions: 0,
        lastError: null,
        bytesProcessed: 0,
        compressionRatio: 0,
    };

    constructor(gateway: Gateway) {
        this.#gateway = gateway;
    }

    get stats(): CompressionStats {
        return { ...this.#stats };
    }

    initializeZlib(): void {
        try {
            if (this.#inflator) {
                this.destroy();
            }

            this.#inflator = new zlib.Inflate({ chunkSize: 65_535, windowBits: 15 });
            this.resetStats();
        } catch (error) {
            const compressionError = new CompressionError(
                "Failed to initialize Zlib inflator",
                CompressionErrorCode.ZlibInitError,
                { originalError: error },
                error as Error,
            );

            this.#emitError(compressionError);
            throw compressionError;
        }
    }

    decompressZlib(data: Buffer): Buffer {
        this.#validateInput(data);

        if (!this.#inflator) {
            const error = new CompressionError(
                "Inflator not initialized. Call initializeZlib() first",
                CompressionErrorCode.InflatorNotInitialized,
                { dataSize: data.length },
            );
            this.#emitError(error);
            throw error;
        }

        try {
            const result = this.#performDecompression(data);
            this.#updateStats(data, result, true);
            return result;
        } catch (error) {
            const compressionError = new CompressionError(
                "Failed to decompress Zlib data",
                CompressionErrorCode.DecompressionError,
                {
                    dataSize: data.length,
                    stats: this.stats,
                    originalError: error,
                },
                error as Error,
            );

            this.#updateStats(data, Buffer.alloc(0), false, compressionError);
            this.#emitError(compressionError);
            throw compressionError;
        }
    }

    resetStats(): void {
        this.#stats = {
            totalDecompressed: 0,
            failedDecompressions: 0,
            lastError: null,
            bytesProcessed: 0,
            compressionRatio: 0,
        };
    }

    destroy(): void {
        if (this.#inflator) {
            try {
                this.#inflator = null;
            } catch (error) {
                this.#gateway.emit(
                    "error",
                    formatErrorLog("Error during inflator destruction", {
                        component: "CompressionManager",
                        stack: (error as Error).stack,
                    }),
                );
            }
        }
        this.resetStats();
    }

    #validateInput(data: Buffer): void {
        if (!Buffer.isBuffer(data)) {
            throw new CompressionError("Input must be a Buffer", CompressionErrorCode.InvalidData, {
                type: typeof data,
            });
        }

        if (data.length > CompressionManager.MAX_CHUNK_SIZE) {
            throw new CompressionError("Input data exceeds maximum chunk size", CompressionErrorCode.InvalidData, {
                dataSize: data.length,
                maxSize: CompressionManager.MAX_CHUNK_SIZE,
            });
        }
    }

    #performDecompression(data: Buffer): Buffer {
        const shouldFlush = this.#shouldFlushData(data);

        if (!shouldFlush) {
            return Buffer.alloc(0);
        }

        this.#inflator?.push(data, shouldFlush && zlib.Z_SYNC_FLUSH);

        if (this.#inflator && this.#inflator?.err < 0) {
            throw new Error(`Zlib inflation error: ${this.#inflator.msg}`);
        }

        const result = this.#inflator?.result;
        return Buffer.isBuffer(result) ? result : Buffer.alloc(0);
    }

    #shouldFlushData(data: Buffer): boolean {
        if (data.length < CompressionManager.FLUSH_MARKER.length) {
            return false;
        }

        const startIndex = data.length - CompressionManager.FLUSH_MARKER.length;
        return data.subarray(startIndex).equals(CompressionManager.FLUSH_MARKER);
    }

    #updateStats(data: Buffer, result: Buffer, success: boolean, error?: Error): void {
        this.#stats.bytesProcessed += data.length;

        if (success) {
            this.#stats.totalDecompressed++;
            if (result.length > 0) {
                this.#stats.compressionRatio = data.length / result.length;
            }
        } else {
            this.#stats.failedDecompressions++;
            if (error) {
                this.#stats.lastError = error;
            }
        }
    }

    #emitError(error: CompressionError): void {
        this.#gateway.emit(
            "error",
            formatErrorLog(error.message, {
                component: "CompressionManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
                timestamp: true,
            }),
        );
    }
}
