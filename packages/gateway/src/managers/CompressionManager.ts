import zlib from "zlib-sync";

export class CompressionManager {
    #inflator: zlib.Inflate | null = null;

    initialize(): void {
        this.#inflator = new zlib.Inflate({ chunkSize: 65_535 });
    }

    decompressZlib(data: Buffer): Buffer {
        if (!this.#inflator) {
            throw new Error("Inflator is not initialized");
        }

        try {
            const length = data.length;
            const flush =
                length >= 4 &&
                data[length - 4] === 0x00 &&
                data[length - 3] === 0x00 &&
                data[length - 2] === 0xff &&
                data[length - 1] === 0xff;

            this.#inflator.push(data, flush && zlib.Z_SYNC_FLUSH);

            if (!flush) {
                return Buffer.alloc(0);
            }

            if (this.#inflator.err < 0) {
                throw new Error(`Zlib decompression error: ${this.#inflator.msg}`);
            }

            const result = this.#inflator.result;
            return Buffer.isBuffer(result) ? result : Buffer.alloc(0);
        } catch (error) {
            throw new Error(
                `Failed to decompress zlib data: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}
