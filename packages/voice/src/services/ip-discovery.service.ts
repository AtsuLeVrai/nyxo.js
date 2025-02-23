import type { Socket } from "node:dgram";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import type { VoiceConnection } from "../core/index.js";
import { VoiceGatewayOpcodes } from "../types/index.js";

export const IpDiscoveryOptions = z
  .object({
    maxRetries: z.number().default(3),
    timeout: z.number().default(5000),
    retryDelay: z.number().default(1000),
  })
  .readonly();

export type IpDiscoveryOptions = z.infer<typeof IpDiscoveryOptions>;

const REQUEST_TYPE = 0x1;
const RESPONSE_TYPE = 0x2;
const PACKET_LENGTH = 70;

export class IpDiscoveryService {
  readonly #connection: VoiceConnection;
  readonly #udp: Socket;
  readonly #options: Required<IpDiscoveryOptions>;
  #timeoutHandle: NodeJS.Timeout | null = null;
  #retryCount = 0;
  #discovering = false;

  constructor(
    connection: VoiceConnection,
    udpSocket: Socket,
    options: z.input<typeof IpDiscoveryOptions> = {},
  ) {
    this.#connection = connection;
    this.#udp = udpSocket;

    try {
      this.#options = IpDiscoveryOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#udp.on("message", this.#handleMessage.bind(this));
  }

  async discover(
    ssrc: number,
    ip: string,
    port: number,
  ): Promise<{ ip: string; port: number }> {
    if (this.#discovering) {
      throw new Error("IP Discovery already in progress");
    }

    this.#discovering = true;
    this.#retryCount = 0;

    return new Promise((resolve, reject) => {
      const cleanup = (): void => {
        this.#discovering = false;
        if (this.#timeoutHandle) {
          clearTimeout(this.#timeoutHandle);
          this.#timeoutHandle = null;
        }
      };

      const onDiscovered = (ip: string, port: number): void => {
        cleanup();
        resolve({ ip, port });
      };

      const onTimeout = async (): Promise<void> => {
        if (this.#retryCount >= this.#options.maxRetries) {
          cleanup();
          reject(new Error("IP Discovery failed after maximum retries"));
          return;
        }

        this.#retryCount++;
        this.#connection.emit("ipRetrying", this.#retryCount);

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, this.#options.retryDelay),
        );

        try {
          await this.#sendDiscoveryPacket(ssrc, ip, port);
          this.#startTimeout();
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      const onError = (error: Error | string): void => {
        cleanup();
        reject(error);
      };

      this.#connection.once("ipDiscovered", onDiscovered);
      this.#connection.once("ipTimeout", onTimeout);
      this.#connection.once("error", onError);

      this.#sendDiscoveryPacket(ssrc, ip, port)
        .then(() => this.#startTimeout())
        .catch((error) => {
          cleanup();
          reject(error);
        });
    });
  }

  cancel(): void {
    if (this.#timeoutHandle) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = null;
    }
    this.#discovering = false;
  }

  #createDiscoveryPacket(ssrc: number): Buffer {
    const packet = Buffer.alloc(74);
    packet.writeUInt16BE(REQUEST_TYPE, 0);
    packet.writeUInt16BE(PACKET_LENGTH, 2);
    packet.writeUInt32BE(ssrc, 4);
    return packet;
  }

  async #sendDiscoveryPacket(
    ssrc: number,
    ip: string,
    port: number,
  ): Promise<void> {
    const packet = this.#createDiscoveryPacket(ssrc);

    return new Promise((resolve, reject) => {
      this.#udp.send(packet, port, ip, (error) => {
        if (error) {
          this.#connection.emit(
            "error",
            new Error("Failed to send discovery packet", { cause: error }),
          );
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  #startTimeout(): void {
    if (this.#timeoutHandle) {
      clearTimeout(this.#timeoutHandle);
    }

    this.#timeoutHandle = setTimeout(() => {
      this.#timeoutHandle = null;
      this.#connection.emit("ipTimeout");
    }, this.#options.timeout);
  }

  #handleMessage(message: Buffer): void {
    try {
      if (message.length !== 74) {
        return;
      }
      if (message.readUInt16BE(0) !== RESPONSE_TYPE) {
        return;
      }

      const ipBuffer = message.subarray(8, 72);
      const ip = ipBuffer.toString().split("\0")[0];

      if (!ip) {
        throw new Error("Failed to parse IP from discovery response");
      }

      const port = message.readUInt16BE(72);

      this.#connection.emit("ipDiscovered", ip, port);
      this.#connection.send(VoiceGatewayOpcodes.SelectProtocol, {
        protocol: "udp",
        data: {
          address: ip,
          port,
          mode: this.#connection.mode,
        },
      });
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle discovery response", { cause: error }),
      );
    }
  }
}
