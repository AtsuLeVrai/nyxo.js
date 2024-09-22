import type { Buffer } from "node:buffer";
import type { Inflate } from "zlib-sync";
import { Z_SYNC_FLUSH } from "zlib-sync";
import type { EncodingTypes } from "../types/gateway";
import { decodeMessage } from "./encoding";

export async function decompressZlib(data: Buffer, encoding: EncodingTypes, zlibInflate: Inflate): Promise<string> {
    return new Promise((resolve, reject) => {
        zlibInflate.push(data, Z_SYNC_FLUSH);

        if (zlibInflate.err < 0) {
            reject(new Error("Failed to decompress zlib data"));
        }

        const result = zlibInflate.result;
        if (result) {
            try {
                resolve(decodeMessage(result, encoding));
            } catch (error) {
                reject(error);
            }
        }
    });
}
