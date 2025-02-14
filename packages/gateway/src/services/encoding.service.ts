import { OptionalDeps } from "@nyxjs/core";
import type { EncodingType } from "../options/index.js";
import type { PayloadEntity } from "../types/index.js";

interface EncodingModules {
  erlpack?: typeof import("erlpack");
}

const MAX_PAYLOAD_SIZE = 4096;

export class EncodingService {
  readonly #encodingType: EncodingType;
  #modules: EncodingModules | null = null;

  constructor(encodingType: EncodingType) {
    this.#encodingType = encodingType;
  }

  get type(): EncodingType {
    return this.#encodingType;
  }

  async initialize(): Promise<void> {
    try {
      this.#modules = await this.#createEncodingModules();
    } catch (error) {
      throw new Error("Failed to initialize encoding modules", {
        cause: error,
      });
    }
  }

  encode(data: PayloadEntity): Buffer | string {
    try {
      const result = this.#encodeData(data);
      this.#validatePayloadSize(result);
      return result;
    } catch (error) {
      throw new Error(`Failed to encode ${this.#encodingType}`, {
        cause: error,
      });
    }
  }

  decode(data: Buffer | string): PayloadEntity {
    try {
      if (this.#encodingType === "json") {
        return JSON.parse(
          typeof data === "string" ? data : data.toString("utf-8"),
        );
      }

      if (!this.#modules?.erlpack) {
        throw new Error("erlpack module not initialized");
      }

      return this.#modules.erlpack.unpack(
        Buffer.isBuffer(data) ? data : Buffer.from(data),
      );
    } catch (error) {
      throw new Error(`Failed to decode ${this.#encodingType}`, {
        cause: error,
      });
    }
  }

  destroy(): void {
    this.#modules = null;
  }

  #encodeData(data: unknown): Buffer | string {
    if (this.#encodingType === "json") {
      return JSON.stringify(data);
    }

    if (!this.#modules?.erlpack) {
      throw new Error("erlpack module not initialized");
    }

    return this.#modules.erlpack.pack(data);
  }

  #validatePayloadSize(data: Buffer | string): void {
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data);

    if (size > MAX_PAYLOAD_SIZE) {
      throw new Error(`Payload exceeds ${MAX_PAYLOAD_SIZE} bytes`);
    }
  }

  async #createEncodingModules(): Promise<EncodingModules> {
    const modules: EncodingModules = {};

    if (this.#encodingType === "etf") {
      const erlpackModule = await OptionalDeps.import("erlpack");
      if (erlpackModule) {
        modules.erlpack = erlpackModule as typeof import("erlpack");
      } else {
        throw new Error("erlpack module required but not available");
      }
    }

    return modules;
  }
}
