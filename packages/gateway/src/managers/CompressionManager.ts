import { Logger } from "@nyxjs/logger";
import zlib from "zlib-sync";
import type { Gateway } from "../Gateway.js";
import { BaseError, ErrorCodes } from "../errors/index.js";

export class CompressionError extends BaseError {}

export class CompressionManager {
    static FLUSH_MARKER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
    static MAX_CHUNK_SIZE = 2 * 1024 * 1024;

    readonly #gateway: Gateway;
    #inflator: zlib.Inflate | null = null;

    constructor(gateway: Gateway) {
        this.#gateway = gateway;
    }

    initializeZlib(): void {
        try {
            if (this.#inflator) {
                this.destroy();
            }

            this.#inflator = new zlib.Inflate({ chunkSize: 65_535, windowBits: 15 });
            this.#emitDebug("Zlib inflator initialized");
        } catch (error) {
            const compressionError = new CompressionError(
                "Failed to initialize Zlib inflator",
                ErrorCodes.CompressionInitError,
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
                ErrorCodes.CompressionInitError,
                { dataSize: data.length },
            );
            this.#emitError(error);
            throw error;
        }

        try {
            return this.#performDecompression(data);
        } catch (error) {
            const compressionError = new CompressionError(
                "Failed to decompress Zlib data",
                ErrorCodes.CompressionDecompressError,
                {
                    dataSize: data.length,
                    originalError: error,
                },
                error as Error,
            );

            this.#emitError(compressionError);
            throw compressionError;
        }
    }

    destroy(): void {
        if (this.#inflator) {
            try {
                this.#inflator = null;
            } catch (error) {
                const compressionError = new CompressionError(
                    "Failed to destroy Zlib inflator",
                    ErrorCodes.CompressionInflatorError,
                    { originalError: error },
                    error as Error,
                );

                this.#emitError(compressionError);
                throw compressionError;
            }
        }
    }

    #validateInput(data: Buffer): void {
        if (!Buffer.isBuffer(data)) {
            throw new CompressionError("Input must be a Buffer", ErrorCodes.CompressionInvalidData, {
                type: typeof data,
            });
        }

        if (data.length > CompressionManager.MAX_CHUNK_SIZE) {
            throw new CompressionError("Input data exceeds maximum chunk size", ErrorCodes.CompressionMaxSizeError, {
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

    #emitError(error: CompressionError): void {
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "CompressionManager",
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
                component: "CompressionManager",
            }),
        );
    }
}
