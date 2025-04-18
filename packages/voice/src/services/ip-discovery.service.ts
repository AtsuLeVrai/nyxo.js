import dgram from "node:dgram";
import { z } from "zod";
import type { VoiceClient } from "../core/index.js";

/**
 * Options for the IP discovery service
 */
export const IpDiscoveryOptions = z.object({
  /**
   * How many times to retry discovery on failure
   * @default 5
   */
  maxRetries: z.number().int().min(1).default(5),

  /**
   * How long to wait between retry attempts (in ms)
   * @default 500
   */
  retryDelay: z.number().int().min(100).default(500),

  /**
   * Timeout for each discovery attempt (in ms)
   * @default 2000
   */
  timeout: z.number().int().min(500).default(2000),
});

export type IpDiscoveryOptions = z.infer<typeof IpDiscoveryOptions>;

/**
 * Service responsible for external IP and UDP port discovery
 *
 * This service implements Discord's IP discovery protocol to determine
 * the external IP address and UDP port of a client behind NAT. This information
 * is essential for establishing audio UDP connection with Discord.
 *
 * Main features:
 * - Sends IP discovery packets according to Discord specification
 * - Analyzes responses to extract IP address and port
 * - Handles timeouts and retry attempts
 * - Emits events to track the discovery process
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 */
export class IpDiscoveryService {
  /**
   * Indicates if an IP discovery is currently in progress
   * Used to prevent concurrent operations
   * @private
   */
  #isDiscovering = false;

  /**
   * UDP socket used for IP discovery
   * Dynamically created when calling discover()
   * @private
   */
  #socket: dgram.Socket | null = null;

  /**
   * SSRC value received from Discord, used for discovery packets
   * Set before calling discover()
   * @private
   */
  #ssrc = 0;

  /**
   * IP address of the Discord voice server
   * Received in the VoiceReady payload
   * @private
   */
  #serverIp: string | null = null;

  /**
   * UDP port of the Discord voice server
   * Received in the VoiceReady payload
   * @private
   */
  #serverPort = 0;

  /**
   * Timer for the current timeout
   * @private
   */
  #timeoutTimer: NodeJS.Timeout | null = null;

  /**
   * Number of attempts made for the current discovery
   * @private
   */
  #attempts = 0;

  /**
   * Discord voice client associated with this service
   * @private
   */
  readonly #voice: VoiceClient;

  /**
   * Configuration options for IP discovery
   * @private
   */
  readonly #options: IpDiscoveryOptions;

  /**
   * Creates a new instance of the IP discovery service
   *
   * @param voice - Discord voice client instance
   * @param options - Configuration options for discovery behavior
   */
  constructor(voice: VoiceClient, options: IpDiscoveryOptions) {
    this.#voice = voice;
    this.#options = options;
  }

  /**
   * Sets the voice server parameters for IP discovery
   *
   * This method must be called with information received in the
   * VoiceReady payload before starting discovery.
   *
   * @param ssrc - The SSRC value received from Discord
   * @param ip - The IP address of the Discord voice server
   * @param port - The UDP port of the Discord voice server
   */
  setServerInfo(ssrc: number, ip: string, port: number): void {
    this.#ssrc = ssrc;
    this.#serverIp = ip;
    this.#serverPort = port;
  }

  /**
   * Performs discovery of the external IP address and port
   *
   * This process sends a discovery packet to the Discord voice server,
   * which responds with the client's external IP address and port.
   *
   * @returns A promise that resolves with the discovered IP address and port
   * @throws {Error} If discovery fails after the maximum number of attempts
   */
  async discover(): Promise<{ address: string; port: number }> {
    if (this.#isDiscovering) {
      throw new Error("An IP discovery is already in progress");
    }

    if (!(this.#serverIp && this.#serverPort && this.#ssrc)) {
      throw new Error(
        "Server information is not set. Call setServerInfo() first.",
      );
    }

    // Mark as in progress
    this.#isDiscovering = true;
    this.#attempts = 0;

    try {
      // Create a UDP socket
      this.#socket = dgram.createSocket("udp4");

      // Set up event listeners
      this.#setupSocketListeners();

      // Start the discovery process
      return await this.#startDiscovery();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  /**
   * Cancels any ongoing IP discovery and cleans up resources
   */
  destroy(): void {
    this.#isDiscovering = false;

    if (this.#timeoutTimer) {
      clearTimeout(this.#timeoutTimer);
      this.#timeoutTimer = null;
    }

    if (this.#socket) {
      try {
        this.#socket.removeAllListeners();
        this.#socket.close();
      } catch (_error) {
        // Ignore errors during closing
      }
      this.#socket = null;
    }
  }

  /**
   * Sets up event listeners on the UDP socket
   * @private
   */
  #setupSocketListeners(): void {
    if (!this.#socket) {
      return;
    }

    // Message handler
    this.#socket.on("message", (message: Buffer) => {
      this.#handleDiscoveryResponse(message);
    });

    // Error handler
    this.#socket.on("error", (error: Error) => {
      this.#voice.emit("error", error);
      this.destroy();
    });
  }

  /**
   * Starts the IP discovery process
   * @private
   */
  async #startDiscovery(): Promise<{ address: string; port: number }> {
    return new Promise((resolve, reject) => {
      // Function to complete discovery
      const completeDiscovery = (
        info: { address: string; port: number } | null,
        error?: Error,
      ): void => {
        // Cancel timeout if set
        if (this.#timeoutTimer) {
          clearTimeout(this.#timeoutTimer);
          this.#timeoutTimer = null;
        }

        // Clean up resources
        this.destroy();

        // Resolve or reject the promise
        if (info) {
          resolve(info);
        } else {
          reject(
            error || new Error("IP discovery failed after multiple attempts"),
          );
        }
      };

      // Listen for the discovered event
      this.#voice.once("ipDiscovered", (info) => {
        completeDiscovery(info);
      });

      // Function to retry discovery
      const retryDiscovery = (): void => {
        // Check if we've exceeded the maximum number of attempts
        if (this.#attempts >= this.#options.maxRetries) {
          completeDiscovery(null);
          return;
        }

        // Increment the attempt counter
        this.#attempts++;

        try {
          // Send the discovery packet
          const packet = this.#createDiscoveryPacket();
          this.#socket?.send(
            packet,
            0,
            packet.length,
            this.#serverPort,
            this.#serverIp as string,
          );

          // Set a timeout for this attempt
          this.#timeoutTimer = setTimeout(() => {
            // If the timeout is reached, try again
            setTimeout(retryDiscovery, this.#options.retryDelay);
          }, this.#options.timeout);
        } catch (error) {
          // In case of error, emit and retry
          this.#voice.emit(
            "error",
            new Error(
              `Error sending packet: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
          setTimeout(retryDiscovery, this.#options.retryDelay);
        }
      };

      // Start the first attempt
      retryDiscovery();
    });
  }

  /**
   * Creates an IP discovery packet according to Discord specifications
   * @private
   */
  #createDiscoveryPacket(): Buffer {
    // Allocate a buffer for the packet (74 bytes total)
    const packet = Buffer.alloc(74);

    // Set the type (0x1 for requests)
    packet.writeUInt16BE(0x1, 0);

    // Set the length (70 bytes of data, excluding Type and Length)
    packet.writeUInt16BE(70, 2);

    // Set the SSRC
    packet.writeUInt32BE(this.#ssrc, 4);

    // The rest (address and port) is left empty for requests

    return packet;
  }

  /**
   * Processes the server's response to the discovery request
   *
   * @param response - The response packet received from the server
   * @private
   */
  #handleDiscoveryResponse(response: Buffer): void {
    try {
      // Check minimum packet size
      if (response.length < 74) {
        throw new Error(
          `Invalid packet size: ${response.length} (expected >= 74)`,
        );
      }

      // Check the type (0x2 for responses)
      const type = response.readUInt16BE(0);
      if (type !== 0x2) {
        throw new Error(`Invalid packet type: ${type} (expected 0x2)`);
      }

      // Extract the SSRC for verification
      const ssrc = response.readUInt32BE(4);
      if (ssrc !== this.#ssrc) {
        throw new Error(`Invalid SSRC: ${ssrc} (expected ${this.#ssrc})`);
      }

      // Extract the IP address (null-terminated string in the buffer)
      let ipEnd = 8;
      while (ipEnd < response.length && response[ipEnd] !== 0) {
        ipEnd++;
      }
      const address = response.toString("utf8", 8, ipEnd);

      // Extract the port (last 2 bytes)
      const port = response.readUInt16BE(response.length - 2);

      // Check if the values seem valid
      if (!(address && port)) {
        throw new Error(
          `Invalid discovery information: address='${address}', port=${port}`,
        );
      }

      // Emit the discovery event
      this.#voice.emit("ipDiscovered", { address, port });
    } catch (error) {
      // In case of processing error, emit it
      this.#voice.emit(
        "error",
        new Error(
          `Error processing response: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }
}
