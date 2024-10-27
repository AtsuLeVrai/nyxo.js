import erlpack from "erlpack";
import type { EncodingTypes } from "../types/index.js";

export class PayloadManager {
    #encoding: EncodingTypes;

    constructor(encoding: EncodingTypes) {
        this.#encoding = encoding;
    }

    decode<T>(data: Buffer, isBinary: boolean): T {
        if (!isBinary && !Buffer.isBuffer(data)) {
            return JSON.parse(data);
        }

        switch (this.#encoding) {
            case "json": {
                try {
                    return JSON.parse(data.toString());
                } catch (error) {
                    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            case "etf": {
                try {
                    return erlpack.unpack(data);
                } catch (error) {
                    throw new Error(`Failed to unpack ETF: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            default: {
                throw new Error(`Unsupported encoding type: ${this.#encoding}`);
            }
        }
    }

    encode(data: unknown): Buffer | string {
        switch (this.#encoding) {
            case "json": {
                try {
                    return JSON.stringify(data);
                } catch (error) {
                    throw new Error(
                        `Failed to stringify JSON: ${error instanceof Error ? error.message : String(error)}`
                    );
                }
            }

            case "etf": {
                try {
                    return erlpack.pack(data);
                } catch (error) {
                    throw new Error(`Failed to pack ETF: ${error instanceof Error ? error.message : String(error)}`);
                }
            }

            default: {
                throw new Error(`Unsupported encoding type: ${this.#encoding}`);
            }
        }
    }
}
