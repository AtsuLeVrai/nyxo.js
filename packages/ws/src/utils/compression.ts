import { Buffer } from "node:buffer";
import type { TextDecoder } from "node:util";
import { decompress } from "@skhaz/zstd";
import type { Inflate } from "minizlib";

export async function decompressZlib(zlibInflate: Inflate, textDecoder: TextDecoder, data: Buffer): Promise<string> {
	return new Promise((resolve, reject) => {
		let decompressedData = Buffer.alloc(0);

		zlibInflate.on("data", (chunk) => {
			decompressedData = Buffer.concat([decompressedData, chunk]);
		});

		zlibInflate.on("end", () => {
			resolve(textDecoder.decode(decompressedData));
		});

		zlibInflate.on("error", (error) => {
			if (error instanceof Error) {
				reject(error);
			} else {
				reject(new Error(`An unknown error occurred: ${error}`));
			}
		});

		if (Buffer.isBuffer(data)) {
			zlibInflate.write(data);
			zlibInflate.flush();
		} else {
			reject(new Error("Invalid input: data must be a Buffer"));
		}
	});
}

export async function decompressZstd(textDecoder: TextDecoder, data: Buffer): Promise<string> {
	try {
		const decompressedBuffer = await decompress(data);
		return textDecoder.decode(decompressedBuffer);
	} catch {
		throw new Error("Failed to decompress Zstd data");
	}
}
