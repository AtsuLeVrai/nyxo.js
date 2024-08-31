import { Buffer } from "node:buffer";
import type { TextDecoder } from "node:util";
import { pack, unpack } from "erlpack";
import type WebSocket from "ws";

export function decodeMessage(
	data: Buffer | string,
	encoding: "etf" | "json",
): any {
	if (encoding === "json") {
		return JSON.parse(data.toString());
	} else if (encoding === "etf") {
		return unpack(data as Buffer);
	} else {
		throw new Error("Unsupported encoding type");
	}
}

export function encodeMessage(
	data: any,
	encoding: "etf" | "json",
): Buffer | string {
	if (encoding === "json") {
		return JSON.stringify(data);
	} else if (encoding === "etf") {
		return pack(data);
	} else {
		throw new Error("Unsupported encoding type");
	}
}

export function decodeRawData(
	textDecoder: TextDecoder,
	data: WebSocket.RawData,
): string {
	if (Buffer.isBuffer(data)) {
		return textDecoder.decode(data);
	} else if (Array.isArray(data)) {
		return textDecoder.decode(Buffer.concat(data));
	} else {
		return textDecoder.decode(data);
	}
}
