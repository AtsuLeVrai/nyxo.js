import type { Buffer } from "node:buffer";
import { type Inflate, Z_SYNC_FLUSH } from "zlib-sync";
import type { EncodingTypes } from "../types/gateway";
import { decodeMessage } from "./encoding";

export async function decompressZlib(data: Buffer, encoding: EncodingTypes, zlibInflate: Inflate): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            zlibInflate.push(data, Z_SYNC_FLUSH);

            if (zlibInflate.err) {
                reject(new Error(`Zlib decompression error: ${zlibInflate.msg}`));
                return;
            }

            const result = zlibInflate.result;
            if (!result) {
                reject(new Error("Zlib decompression resulted in empty data"));
                return;
            }

            const decompressed = decodeMessage(result, encoding);
            resolve(decompressed);
        } catch (error) {
            reject(
                new Error(
                    `Unexpected error during Zlib decompression: ${error instanceof Error ? error.message : String(error)}`
                )
            );
        }
    });
}
