import { Buffer } from "node:buffer";
import { pack, unpack } from "erlpack";
import type { EncodingTypes } from "../types/gateway";

/**
 * Decodes a message from a Buffer or string based on the specified encoding type.
 *
 * @param data - The data to decode, either as a Buffer or string.
 * @param encoding - The encoding type of the data ("json" or "etf").
 * @returns The decoded message as a JavaScript object.
 */
export function decodeMessage(data: Buffer | string, encoding: EncodingTypes): any {
    if (encoding === "json") {
        if (Buffer.isBuffer(data)) {
            return JSON.parse(data.toString());
        } else {
            return JSON.parse(data);
        }
    } else if (encoding === "etf" && Buffer.isBuffer(data)) {
        return unpack(data);
    } else {
        throw new Error(`Unsupported encoding type: ${encoding}`);
    }
}

/**
 * Encodes a message to a Buffer or string based on the specified encoding type.
 *
 * @param data - The data to encode, typically a JavaScript object.
 * @param encoding - The desired encoding type for the output ("json" or "etf").
 * @returns The encoded message as a Buffer (for "etf") or string (for "json").
 */
export function encodeMessage(data: any, encoding: EncodingTypes): Buffer | string {
    if (encoding === "json") {
        return JSON.stringify(data);
    } else if (encoding === "etf") {
        return pack(data);
    } else {
        throw new Error(`Unsupported encoding type: ${encoding}`);
    }
}
