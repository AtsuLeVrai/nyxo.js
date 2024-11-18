import erlpack from "erlpack";
import type { Gateway } from "../Gateway.js";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import { EncodingTypes } from "../types/index.js";
import { BaseManager } from "./BaseManager.js";

export class PayloadManager extends BaseManager {
    readonly #encoding: EncodingTypes;

    constructor(gateway: Gateway, encoding: EncodingTypes) {
        super(gateway);

        if (!Object.values(EncodingTypes).includes(encoding)) {
            throw new GatewayError(`Unsupported encoding type: ${encoding}`, ErrorCodes.PayloadUnsupportedFormat, {
                details: { providedEncoding: encoding, supportedEncodings: Object.values(EncodingTypes) },
            });
        }

        this.#encoding = encoding;
        this.debug(`PayloadManager initialized with ${encoding} encoding`);
    }

    decode<T>(data: Buffer | string, isBinary: boolean): T {
        try {
            if (!data) {
                throw new GatewayError("Missing data", ErrorCodes.PayloadInvalidInput);
            }

            if (isBinary && !Buffer.isBuffer(data)) {
                throw new GatewayError("Binary data must be a Buffer", ErrorCodes.PayloadInvalidBinary);
            }

            return this.#encoding === "json" ? this.#decodeJson(data) : this.#decodeEtf(data);
        } catch (error) {
            const payloadError = new GatewayError("Failed to decode payload", ErrorCodes.PayloadDecodingError, {
                cause: error,
            });
            this.error(payloadError);
            throw payloadError;
        }
    }

    encode(data: unknown): Buffer | string {
        try {
            if (!data) {
                throw new GatewayError("Missing data", ErrorCodes.PayloadInvalidInput);
            }

            return this.#encoding === "json" ? JSON.stringify(data) : erlpack.pack(data);
        } catch (error) {
            const payloadError = new GatewayError("Failed to encode payload", ErrorCodes.PayloadEncodingError, {
                cause: error,
            });
            this.error(payloadError);
            throw payloadError;
        }
    }

    #decodeJson<T>(data: Buffer | string): T {
        try {
            const strData = Buffer.isBuffer(data) ? data.toString() : data;
            return JSON.parse(strData);
        } catch (error) {
            throw new GatewayError("JSON parsing error", ErrorCodes.PayloadDecodingError, { cause: error });
        }
    }

    #decodeEtf<T>(data: Buffer | string): T {
        try {
            if (!Buffer.isBuffer(data)) {
                throw new GatewayError("ETF data must be a Buffer", ErrorCodes.PayloadInvalidBinary);
            }

            return erlpack.unpack(data);
        } catch (error) {
            throw new GatewayError("ETF decoding error", ErrorCodes.PayloadDecodingError, { cause: error });
        }
    }
}
