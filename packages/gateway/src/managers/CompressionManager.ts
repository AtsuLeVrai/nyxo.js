import zlib from "zlib-sync";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import { BaseManager } from "./BaseManager.js";

export class CompressionManager extends BaseManager {
    readonly #maxChunkSize = 2 * 1024 * 1024;
    readonly #flushMarker = Buffer.from([0x00, 0x00, 0xff, 0xff]);
    readonly #chunkSize = 64 * 1024;
    readonly #windowBits = 15;
    #inflator: zlib.Inflate | null = null;

    initializeZlib(): void {
        try {
            if (this.#inflator) {
                this.destroy();
            }

            this.#inflator = new zlib.Inflate({
                chunkSize: this.#chunkSize,
                windowBits: this.#windowBits,
            });

            this.debug("Zlib inflator initialized");
        } catch (error) {
            throw new GatewayError("Failed to initialize Zlib inflator", ErrorCodes.CompressionInitError, {
                cause: error,
            });
        }
    }

    decompressZlib(data: Buffer): Buffer {
        if (!Buffer.isBuffer(data)) {
            throw new GatewayError("Input must be a Buffer", ErrorCodes.CompressionInvalidData, {
                details: { type: typeof data },
            });
        }

        if (data.length > this.#maxChunkSize) {
            throw new GatewayError("Input data exceeds maximum chunk size", ErrorCodes.CompressionMaxSizeError, {
                details: { dataSize: data.length, maxSize: this.#maxChunkSize },
            });
        }

        if (!this.#inflator) {
            throw new GatewayError(
                "Inflator not initialized. Call initializeZlib() first",
                ErrorCodes.CompressionInitError,
                { details: { dataSize: data.length } },
            );
        }

        const shouldFlush = this.shouldFlushData(data);
        if (!shouldFlush) {
            return Buffer.alloc(0);
        }

        this.#inflator?.push(data, shouldFlush && zlib.Z_SYNC_FLUSH);

        if (this.#inflator?.err && this.#inflator.err < 0) {
            throw new Error(`Zlib inflation error: ${this.#inflator.msg}`);
        }

        const result = this.#inflator?.result;
        return Buffer.isBuffer(result) ? result : Buffer.alloc(0);
    }

    destroy(): void {
        if (this.#inflator) {
            try {
                this.#inflator = null;
            } catch (error) {
                throw new GatewayError("Failed to destroy Zlib inflator", ErrorCodes.CompressionInflatorError, {
                    cause: error,
                });
            }
        }
    }

    shouldFlushData(data: Buffer): boolean {
        if (data.length < this.#flushMarker.length) {
            return false;
        }

        const startIndex = data.length - this.#flushMarker.length;
        return data.subarray(startIndex).equals(this.#flushMarker);
    }
}
