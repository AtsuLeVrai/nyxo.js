import { Buffer } from "node:buffer";
import { pack, unpack } from "erlpack";
import type { GatewayOptions } from "../types/gateway";

export function decodeMessage(
	data: string | Buffer,
	encoding: GatewayOptions["encoding"],
): any {
	if (encoding === "json") {
		if (Buffer.isBuffer(data)) {
			return JSON.parse(data.toString());
		} else {
			return JSON.parse(data);
		}
	} else if (encoding === "etf" && Buffer.isBuffer(data)) {
		return unpack(data);
	} else {
		throw new Error("Unsupported encoding type");
	}
}

export function encodeMessage(
	data: any,
	encoding: GatewayOptions["encoding"],
): Buffer | string {
	if (encoding === "json") {
		return JSON.stringify(data);
	} else if (encoding === "etf") {
		return pack(data);
	} else {
		throw new Error("Unsupported encoding type");
	}
}
