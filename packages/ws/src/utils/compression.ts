import type { Buffer } from "node:buffer";
import type { Inflate } from "minizlib";
import type { EncodingTypes } from "../types/gateway";
import { decodeMessage } from "./encoding";

export async function decompressZlib(data: Buffer, encoding: EncodingTypes, zlibInflate: Inflate): Promise<string> {
    return new Promise((resolve, reject) => {
        zlibInflate.on("data", (chunk) => {
            try {
                const decompressed = decodeMessage(chunk, encoding);
                resolve(decompressed);
            } catch (error) {
                reject(
                    new Error(
                        `Erreur lors du décodage du message décompressé : ${error instanceof Error ? error.message : String(error)}`
                    )
                );
            }
        });

        zlibInflate.on("error", (error) => {
            reject(
                new Error(`Erreur de décompression Zlib : ${error instanceof Error ? error.message : String(error)}`)
            );
        });

        zlibInflate.end(data);
    });
}
