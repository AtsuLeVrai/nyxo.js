import type { Buffer } from "node:buffer";
import { decompress } from "@mongodb-js/zstd";
import { type Inflate, Z_SYNC_FLUSH } from "zlib-sync";
import type { GatewayOptions } from "../types/gateway";
import { decodeMessage } from "./encoding";

export async function decompressZlib(
	data: Buffer,
	encoding: GatewayOptions["encoding"],
	zlibInflate: Inflate,
): Promise<string> {
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
					`Unexpected error during Zlib decompression: ${error instanceof Error ? error.message : String(error)}`,
				),
			);
		}
	});
}

export async function decompressZstd(
	data: Buffer,
	encoding: GatewayOptions["encoding"],
): Promise<string> {
	try {
		const result = await decompress(data);
		return decodeMessage(result, encoding);
	} catch (error) {
		throw new Error(
			`Unexpected error during Zstd decompression: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
