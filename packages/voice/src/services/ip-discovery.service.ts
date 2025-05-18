import type dgram from "node:dgram";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import type { IpDiscoveryPacketEntity } from "../types/index.js";

/**
 * Events emitted by the IP Discovery Service
 */
export interface IpDiscoveryEvents {
  /**
   * Emitted when the external IP and port are discovered
   * @param address External IP address
   * @param port External UDP port
   */
  discover: [address: string, port: number];

  /**
   * Emitted when an error occurs during IP discovery
   * @param error The error that occurred
   */
  error: [error: Error];
}

export const IpDiscoveryOptions = z.object({
  /**
   * Maximum number of retransmission attempts
   * @default 3
   */
  maxRetries: z.number().int().positive().default(3),

  /**
   * Delay between retransmission attempts in milliseconds
   * @default 1000
   */
  retryDelay: z.number().int().positive().default(1000),

  /**
   * Discovery timeout in milliseconds
   * @default 5000
   */
  timeout: z.number().int().positive().default(5000),

  /**
   * Whether to validate that the discovered IP is a public address
   * @default true
   */
  validatePublicIp: z.boolean().default(true),
});

export type IpDiscoveryOptions = z.infer<typeof IpDiscoveryOptions>;

/**
 * IP Discovery Service for Voice connections
 *
 * Handles the UDP packet exchange needed to discover a client's external
 * IP address and port for voice communication with Discord.
 *
 * This is necessary for NAT traversal in many network environments.
 */
export class IpDiscoveryService extends EventEmitter<IpDiscoveryEvents> {
  /**
   * Whether IP discovery has been completed
   * @private
   */
  #discovered = false;

  /**
   * Discovered external IP address
   * @private
   */
  #externalIp: string | null = null;

  /**
   * Discovered external port
   * @private
   */
  #externalPort: number | null = null;

  /**
   * SSRC (Synchronization Source) identifier for this client
   * Assigned by Discord's voice server
   * @private
   */
  readonly #ssrc: number;

  /**
   * Options for IP discovery behavior
   * @private
   */
  readonly #options: IpDiscoveryOptions;

  /**
   * Creates a new IP Discovery Service instance
   *
   * @param ssrc SSRC assigned by Discord's voice server
   * @param options Optional configuration for IP discovery
   */
  constructor(ssrc: number, options: IpDiscoveryOptions) {
    super();
    this.#ssrc = ssrc;
    this.#options = options;
  }

  /**
   * Gets the discovered external IP address
   * @returns External IP address or null if discovery hasn't completed
   */
  get externalIp(): string | null {
    return this.#externalIp;
  }

  /**
   * Gets the discovered external port
   * @returns External port or null if discovery hasn't completed
   */
  get externalPort(): number | null {
    return this.#externalPort;
  }

  /**
   * Gets whether IP discovery has been completed
   * @returns True if discovery is complete, false otherwise
   */
  get isDiscovered(): boolean {
    return this.#discovered;
  }

  /**
   * Performs IP discovery by sending a discovery packet to Discord's voice server
   * and processing the response
   *
   * @param socket UDP socket to use for discovery
   * @param serverIp Discord voice server IP address
   * @param serverPort Discord voice server port
   * @returns Promise that resolves with IP address and port once discovery is complete
   */
  async discover(
    socket: dgram.Socket,
    serverIp: string,
    serverPort: number,
  ): Promise<{ address: string; port: number }> {
    // If we've already discovered our IP and port, return them immediately
    if (this.#discovered && this.#externalIp && this.#externalPort) {
      return {
        address: this.#externalIp,
        port: this.#externalPort,
      };
    }

    try {
      // Set up handler for voice server responses
      const handleMessage = (message: Buffer): void => {
        try {
          // Process the IP discovery response packet
          const packet = this.#decodePacket(message);

          // Ensure it's a response packet (type 0x2)
          if (packet.type !== 0x2) {
            return;
          }

          // If IP validation is enabled, check that the discovered IP is valid and public
          if (
            this.#options.validatePublicIp &&
            !this.#isPublicIp(packet.address)
          ) {
            this.emit(
              "error",
              new Error(
                `Discovered IP ${packet.address} is not a valid public address`,
              ),
            );
            return;
          }

          // Store the discovered IP and port
          this.#externalIp = packet.address;
          this.#externalPort = packet.port;
          this.#discovered = true;

          // Emit discovery event
          this.emit("discover", packet.address, packet.port);

          // Clean up listener once discovery is complete
          socket.removeListener("message", handleMessage);
        } catch (error) {
          // Emit error if packet processing fails
          this.emit(
            "error",
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      };

      // Register message handler
      socket.on("message", handleMessage);

      // Create the discovery packet
      const discoveryPacket = this.#createDiscoveryPacket();

      // Set up retransmission logic
      let retryCount = 0;
      const sendDiscoveryPacket = () => {
        socket.send(discoveryPacket, serverPort, serverIp);
      };

      // Initial packet send
      sendDiscoveryPacket();

      // Wait for discovery to complete with timeout and retransmission
      return new Promise((resolve, reject) => {
        // Set up retransmission timer
        const retryInterval = setInterval(() => {
          if (retryCount < this.#options.maxRetries) {
            retryCount++;
            sendDiscoveryPacket();
          } else {
            clearInterval(retryInterval);
          }
        }, this.#options.retryDelay);

        // Set a timeout to prevent hanging if response never arrives
        const timeout = setTimeout(() => {
          clearInterval(retryInterval);
          socket.removeListener("message", handleMessage);
          reject(
            new Error(
              `IP discovery timed out after ${this.#options.timeout / 1000} seconds`,
            ),
          );
        }, this.#options.timeout);

        // Handler for successful discovery
        const successHandler = (address: string, port: number): void => {
          clearTimeout(timeout);
          clearInterval(retryInterval);
          this.removeListener("discover", successHandler);
          this.removeListener("error", errorHandler);
          resolve({ address, port });
        };

        // Handler for discovery errors
        const errorHandler = (error: Error): void => {
          clearTimeout(timeout);
          clearInterval(retryInterval);
          this.removeListener("discover", successHandler);
          this.removeListener("error", errorHandler);
          reject(error);
        };

        // Register handlers for events
        this.once("discover", successHandler);
        this.once("error", errorHandler);
      });
    } catch (error) {
      // Convert any errors during discovery to proper Error objects
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Creates an IP discovery packet to send to the voice server
   *
   * @returns Buffer containing the formatted discovery packet
   * @private
   */
  #createDiscoveryPacket(): Buffer {
    // Create a buffer for the discovery packet
    // Type (2) + Length (2) + SSRC (4) + Address (64) + Port (2) = 74 bytes
    const packet = Buffer.alloc(74);

    // Write request type (0x1)
    packet.writeUInt16BE(0x1, 0);

    // Write length (70, which is the packet size excluding Type and Length fields)
    packet.writeUInt16BE(70, 2);

    // Write SSRC
    packet.writeUInt32BE(this.#ssrc, 4);

    // Rest of the packet is zeroed out for the request

    return packet;
  }

  /**
   * Decodes an IP discovery response packet from the voice server
   *
   * @param buffer Raw packet data received from the server
   * @returns Decoded IP discovery packet
   * @private
   */
  #decodePacket(buffer: Buffer): IpDiscoveryPacketEntity {
    // Ensure the packet is at least the minimum size
    if (buffer.length < 74) {
      throw new Error(
        `Invalid IP discovery packet: expected at least 74 bytes, got ${buffer.length}`,
      );
    }

    // Extract packet type
    const type = buffer.readUInt16BE(0);

    // Validate that it's a response packet
    if (type !== 0x2) {
      throw new Error(
        `Invalid IP discovery packet: expected type 0x2, got 0x${type.toString(16)}`,
      );
    }

    // Extract packet length
    const length = buffer.readUInt16BE(2);

    // Validate length
    if (length !== 70) {
      throw new Error(
        `Invalid IP discovery packet: expected length 70, got ${length}`,
      );
    }

    // Extract SSRC
    const ssrc = buffer.readUInt32BE(4);

    // Validate SSRC matches what we expect
    if (ssrc !== this.#ssrc) {
      throw new Error(
        `Invalid IP discovery packet: expected SSRC ${this.#ssrc}, got ${ssrc}`,
      );
    }

    // Extract IP address (null-terminated string)
    let address = "";
    let i = 8;
    while (i < 72 && buffer[i] !== 0) {
      address += String.fromCharCode(buffer[i] as number);
      i++;
    }

    // Extract port (last 2 bytes)
    const port = buffer.readUInt16BE(72);

    return {
      type,
      length,
      ssrc,
      address,
      port,
    };
  }

  /**
   * Checks if an IP address is a valid public address
   *
   * @param ip IP address to check
   * @returns True if the IP is a valid public address, false otherwise
   * @private
   */
  #isPublicIp(ip: string): boolean {
    // Check if the IP is valid
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipRegex);

    if (!match) {
      return false; // Not a valid IPv4 address format
    }

    // Convert to numbers and check range
    const octets = match.slice(1).map(Number);
    if (
      octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)
    ) {
      return false; // Octets out of valid range
    }

    // Check for private IP ranges (RFC 1918)
    // 10.0.0.0/8
    if (octets[0] === 10) {
      return false;
    }

    // 172.16.0.0/12
    if (
      octets[0] === 172 &&
      (octets[1] as number) >= 16 &&
      (octets[1] as number) <= 31
    ) {
      return false;
    }

    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) {
      return false;
    }

    // 169.254.0.0/16 (Link-local)
    if (octets[0] === 169 && octets[1] === 254) {
      return false;
    }

    // 127.0.0.0/8 (Loopback)
    if (octets[0] === 127) {
      return false;
    }

    // 0.0.0.0/8
    if (octets[0] === 0) {
      return false;
    }

    // 224.0.0.0/4 (Multicast)
    if ((octets[0] as number) >= 224 && (octets[0] as number) <= 239) {
      return false;
    }

    // 240.0.0.0/4 (Reserved)
    if ((octets[0] as number) >= 240 && (octets[0] as number) <= 255) {
      return false;
    }

    // It's a valid public IP
    return true;
  }
}
