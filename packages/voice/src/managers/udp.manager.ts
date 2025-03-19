import dgram from "node:dgram";
import type { VoiceConnection } from "../core/index.js";
import { VoiceEncryptionService } from "../services/index.js";
import { EncryptionMode, type VoicePacket } from "../types/index.js";

/**
 * UDP Connection manager for Discord voice
 *
 * Handles UDP socket connection, IP discovery and packet transmission for voice data
 */
export class UdpManager {
  /** Voice client reference */
  readonly #connection: VoiceConnection;

  /** UDP socket instance */
  #socket: dgram.Socket | null = null;

  /** Voice server IP */
  #serverIp: string | null = null;

  /** Voice server port */
  #serverPort: number | null = null;

  /** Local UDP IP address */
  #localIp: string | null = null;

  /** Local UDP port */
  #localPort: number | null = null;

  /** SSRC for voice connection */
  #ssrc: number | null = null;

  /** Selected encryption mode */
  #encryptionMode: EncryptionMode | null = null;

  /** Encryption service */
  readonly #encryptionService: VoiceEncryptionService;

  /** Whether the connection is ready */
  #ready = false;

  /**
   * Creates a new UDP manager
   *
   * @param connection - Voice client instance
   */
  constructor(connection: VoiceConnection) {
    this.#connection = connection;
    this.#encryptionService = new VoiceEncryptionService();
  }

  /**
   * Gets the local IP address
   */
  get localIp(): string | null {
    return this.#localIp;
  }

  /**
   * Gets the local port
   */
  get localPort(): number | null {
    return this.#localPort;
  }

  /**
   * Gets the SSRC
   */
  get ssrc(): number | null {
    return this.#ssrc;
  }

  /**
   * Gets the encryption mode
   */
  get encryptionMode(): EncryptionMode | null {
    return this.#encryptionMode;
  }

  /**
   * Gets whether the UDP connection is ready
   */
  get isReady(): boolean {
    return this.#ready;
  }

  /**
   * Initializes the UDP connection
   *
   * @param serverIp - Voice server IP address
   * @param serverPort - Voice server port
   * @param ssrc - Voice SSRC
   * @returns Promise that resolves when connection is initialized
   */
  async connect(
    serverIp: string,
    serverPort: number,
    ssrc: number,
  ): Promise<void> {
    if (this.#socket) {
      this.destroy();
    }

    this.#serverIp = serverIp;
    this.#serverPort = serverPort;
    this.#ssrc = ssrc;
    this.#ready = false;

    this.#socket = dgram.createSocket("udp4");

    return new Promise<void>((resolve, reject) => {
      if (!this.#socket) {
        reject(new Error("Failed to create UDP socket"));
        return;
      }

      // Set up event handlers
      this.#socket.on("error", (error) => {
        this.#connection.emit("error", error);
        reject(error);
      });

      this.#socket.on("message", (message) => {
        this.#connection.emit("udpPacket", message);
        this.#handlePacket(message);
      });

      this.#socket.on("listening", async () => {
        try {
          const address = this.#socket?.address();
          if (!address || typeof address === "string") {
            throw new Error("Invalid socket address information");
          }

          await this.#performIpDiscovery();
          this.#ready = true;
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      // Bind to any available port
      this.#socket.bind();
    });
  }

  /**
   * Sets the encryption details for the UDP connection
   *
   * @param mode - Encryption mode
   * @param key - Secret key
   */
  setEncryption(mode: EncryptionMode, key: Uint8Array): void {
    // Only support recommended encryption modes
    if (
      mode !== EncryptionMode.AeadAes256GcmRtpsize &&
      mode !== EncryptionMode.AeadXChaCha20Poly1305Rtpsize
    ) {
      throw new Error(
        `Encryption mode ${mode} is not recommended. Please use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize.`,
      );
    }

    this.#encryptionMode = mode;

    // Initialize the encryption service
    this.#encryptionService.initialize(mode, key);
  }

  /**
   * Sends a packet to the voice server
   *
   * @param packet - Voice packet to send
   * @throws Error if the UDP socket is not connected
   */
  send(packet: VoicePacket): void {
    if (!(this.#socket && this.#serverIp && this.#serverPort)) {
      throw new Error("UDP socket not connected");
    }

    if (!this.#ready) {
      throw new Error("UDP connection not ready");
    }

    // Create the RTP header
    const header = Buffer.allocUnsafe(12);
    header.writeUInt8(packet.version, 0);
    header.writeUInt8(packet.payloadType, 1);
    header.writeUInt16BE(packet.sequence, 2);
    header.writeUInt32BE(packet.timestamp, 4);
    header.writeUInt32BE(packet.ssrc, 8);

    try {
      // Encrypt the audio data
      let finalPacket: Buffer;

      if (this.#encryptionService.isInitialized()) {
        // Use the encryption service to encrypt the packet
        finalPacket = this.#encryptionService.encrypt(
          header,
          Buffer.concat([header, packet.data]),
        );
      } else {
        // If encryption is not initialized, just send the raw packet
        finalPacket = Buffer.concat([header, packet.data]);
      }

      // Send the packet
      this.#socket.send(
        finalPacket,
        0,
        finalPacket.length,
        this.#serverPort,
        this.#serverIp,
        (error) => {
          if (error) {
            this.#connection.emit("error", error);
          }
        },
      );
    } catch (error) {
      this.#connection.emit(
        "error",
        error instanceof Error
          ? error
          : new Error(`Failed to send voice packet: ${String(error)}`),
      );
    }
  }

  /**
   * Destroys the UDP manager and cleans up resources
   */
  destroy(): void {
    if (this.#socket) {
      try {
        this.#socket.removeAllListeners();
        this.#socket.close();
      } catch (error) {
        this.#connection.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        );
      } finally {
        this.#socket = null;
        this.#localIp = null;
        this.#localPort = null;
        this.#ready = false;
      }
    }
  }

  /**
   * Performs IP discovery to determine the local external IP and port
   * @private
   */
  async #performIpDiscovery(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!(this.#socket && this.#serverIp && this.#serverPort && this.#ssrc)) {
        return reject(
          new Error(
            "Cannot perform IP discovery without socket and server information",
          ),
        );
      }

      // Prepare the IP discovery packet
      const discoveryPacket = Buffer.allocUnsafe(74).fill(0);

      // Packet type (0x1 for request)
      discoveryPacket.writeUInt16BE(0x1, 0);

      // Length (always 70)
      discoveryPacket.writeUInt16BE(70, 2);

      // SSRC
      discoveryPacket.writeUInt32BE(this.#ssrc, 4);

      // Send the discovery packet
      this.#socket?.send(
        discoveryPacket,
        0,
        discoveryPacket.length,
        this.#serverPort,
        this.#serverIp,
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          // Set up a timeout for discovery
          const timeout = setTimeout(() => {
            reject(new Error("IP discovery timed out"));
          }, 5000);

          // One-time handler for discovery response
          const handleDiscovery = (message: Buffer): void => {
            // Validate the packet (type should be 0x2 for response)
            if (message.readUInt16BE(0) !== 0x2) {
              return;
            }

            clearTimeout(timeout);
            this.#socket?.removeListener("message", handleDiscovery);

            // Extract IP and port
            const ip = message.toString("utf8", 8, 72).replace(/\0+$/, "");
            const port = message.readUInt16BE(72);

            this.#localIp = ip;
            this.#localPort = port;

            this.#connection.emit("ipDiscovery", ip, port);
            this.#connection.emit("udpReady", ip, port);

            resolve();
          };

          this.#socket?.on("message", handleDiscovery);
        },
      );
    });
  }

  /**
   * Handles incoming UDP packets
   *
   * @param packet - Received packet
   * @private
   */
  #handlePacket(packet: Buffer): void {
    // Ignore very small packets that can't be valid RTP
    if (packet.length < 12) {
      return;
    }

    try {
      // Basic validation of RTP header
      const version = ((packet[0] as number) >>> 6) & 0x3;
      if (version !== 2) {
        // Not an RTP packet
        return;
      }

      // Extract SSRC
      const _ssrc = packet.readUInt32BE(8);
      _ssrc;

      // For speaking detection
      // When we receive a packet with an SSRC, it means that user is speaking
      // We could emit a speaking event here if we wanted to track who's speaking

      // This is mostly useful for client applications, not bots
      // However, we'll leave this comment here for future implementation if needed

      // Actual decryption and playback of voice is rarely needed for bots
      // If encryption is set up and we want to decode, we could do:
      /*
      if (this.#encryptionService.isInitialized()) {
        try {
          const decrypted = this.#encryptionService.decrypt(packet);
          // Do something with the decrypted audio...
        } catch (error) {
          // Handle decryption error
        }
      }
      */
    } catch (_error) {
      // Silently ignore malformed packets
      // This is expected as we might receive non-RTP packets
    }
  }
}
