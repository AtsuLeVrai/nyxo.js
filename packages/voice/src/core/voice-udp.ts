import dgram from "node:dgram";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import {
  EncryptionOptions,
  EncryptionService,
  IpDiscoveryOptions,
  IpDiscoveryService,
} from "../services/index.js";
import type { VoicePacket } from "../types/index.js";
import type { VoiceClient } from "./voice-client.js";

/**
 * Options for the voice UDP client
 */
export const VoiceUdpOptions = z.object({
  /**
   * Maximum buffer size for sent packets
   * @default 4096
   */
  sendBufferSize: z.number().int().positive().default(4096),

  /**
   * Maximum buffer size for received packets
   * @default 8192
   */
  receiveBufferSize: z.number().int().positive().default(8192),

  /**
   * Maximum delay in ms before abandoning packet sending
   * @default 1000
   */
  sendTimeout: z.number().int().positive().default(1000),

  /**
   * Options for the IP discovery service
   */
  ipDiscovery: IpDiscoveryOptions.default({}),

  /**
   * Options for the encryption service
   */
  encryption: EncryptionOptions.default({}),
});

export type VoiceUdpOptions = z.infer<typeof VoiceUdpOptions>;

/**
 * Event types emitted by the voice UDP client
 */
interface VoiceUdpEvents {
  /**
   * Emitted when the UDP connection is established
   */
  ready: [];

  /**
   * Emitted when external IP and port are discovered
   * @param address External IP address
   * @param port External UDP port
   */
  ipDiscovered: [address: string, port: number];

  /**
   * Emitted when the connection is closed
   */
  close: [];

  /**
   * Emitted when an audio packet is received
   * @param data Decrypted audio data
   * @param sequence Packet sequence number
   * @param timestamp Packet timestamp
   * @param ssrc SSRC value of the packet
   */
  audioPacket: [
    data: Uint8Array,
    sequence: number,
    timestamp: number,
    ssrc: number,
  ];

  /**
   * Emitted when an error occurs
   * @param error The error that occurred
   */
  error: [error: Error];
}

/**
 * Client responsible for UDP connection for voice audio data
 *
 * This class manages the UDP connection used to transmit and receive Discord
 * audio data. It handles IP discovery, packet encryption/decryption,
 * and audio data stream management.
 *
 * Main features:
 * - Establishing and managing UDP connection
 * - External IP and port discovery
 * - Audio packet encryption and decryption
 * - Sending and receiving audio data
 *
 * This class is used in conjunction with VoiceGateway to establish a
 * complete voice connection to Discord.
 */
export class VoiceUdp extends EventEmitter<VoiceUdpEvents> {
  /**
   * UDP socket for audio communication
   * Dynamically loaded at runtime
   * @private
   */
  #socket: dgram.Socket | null = null;

  /**
   * Indicates if the connection is established and ready
   * @private
   */
  #ready = false;

  /**
   * Voice server connection information
   * @private
   */
  #connectionInfo: {
    ip: string | null;
    port: number | null;
    ssrc: number | null;
    localAddress: string | null;
    localPort: number | null;
  } = {
    ip: null,
    port: null,
    ssrc: null,
    localAddress: null,
    localPort: null,
  };

  /**
   * Sequence counter for sent packets
   * @private
   */
  #sequence = 0;

  /**
   * Timestamp counter for sent packets
   * @private
   */
  #timestamp = 0;

  /**
   * Selected encryption mode
   * @private
   */
  #encryptionMode = "";

  /**
   * IP discovery service
   * @private
   */
  readonly #ipDiscovery: IpDiscoveryService;

  /**
   * Audio packet encryption service
   * @private
   */
  readonly #encryption: EncryptionService;

  /**
   * Voice client associated with this UDP client
   * @private
   */
  readonly #voice: VoiceClient;

  /**
   * Configured options for this client
   * @private
   */
  readonly #options: VoiceUdpOptions;

  /**
   * Creates a new voice UDP client
   *
   * @param voice - Voice client associated with this UDP client
   * @param options - Configuration options for the client
   */
  constructor(voice: VoiceClient, options: VoiceUdpOptions) {
    super();

    this.#voice = voice;
    this.#options = options;
    this.#ipDiscovery = new IpDiscoveryService(
      this.#voice,
      this.#options.ipDiscovery,
    );
    this.#encryption = new EncryptionService(this.#options.encryption);
  }

  /**
   * Checks if the connection is established and ready
   */
  get isReady(): boolean {
    return this.#ready && this.#socket !== null;
  }

  /**
   * Gets the local IP address of the connection
   */
  get localAddress(): string | null {
    return this.#connectionInfo.localAddress;
  }

  /**
   * Gets the local port of the connection
   */
  get localPort(): number | null {
    return this.#connectionInfo.localPort;
  }

  /**
   * Gets the discovered external IP address
   */
  get externalAddress(): string | null {
    return this.localAddress;
  }

  /**
   * Gets the discovered external port
   */
  get externalPort(): number | null {
    return this.localPort;
  }

  /**
   * Gets the selected encryption mode
   */
  get encryptionMode(): string {
    return this.#encryptionMode;
  }

  /**
   * Gets the SSRC value for this connection
   */
  get ssrc(): number | null {
    return this.#connectionInfo.ssrc;
  }

  /**
   * Initializes necessary services
   *
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    try {
      // Initialize the encryption service
      await this.#encryption.initialize();
    } catch (error) {
      throw new Error(
        `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Connects to the voice UDP server
   *
   * @param options - Connection information
   * @returns A promise that resolves when the connection is established
   */
  async connect(options: {
    ip: string;
    port: number;
    ssrc: number;
  }): Promise<void> {
    // Check if we're already connected
    if (this.isReady) {
      throw new Error("Already connected");
    }

    // Validate parameters
    if (!(options.ip && options.port && options.ssrc)) {
      throw new Error("Invalid connection parameters");
    }

    // Store connection information
    this.#connectionInfo = {
      ip: options.ip,
      port: options.port,
      ssrc: options.ssrc,
      localAddress: null,
      localPort: null,
    };

    try {
      // Create the UDP socket
      await this.#createSocket();

      // Perform IP discovery
      await this.#discoverIp();

      // Mark as ready
      this.#ready = true;
      this.emit("ready");
    } catch (error) {
      // Clean up on error
      this.disconnect();
      throw error;
    }
  }

  /**
   * Disconnects from the voice UDP server
   */
  disconnect(): void {
    // Close the socket
    this.#closeSocket();

    // Reset state
    this.#ready = false;
    this.#sequence = 0;
    this.#timestamp = 0;

    // Emit the event
    this.emit("close");
  }

  /**
   * Sends an audio packet to the voice server
   *
   * @param opusData - Opus encoded audio data
   * @returns A promise that resolves when the packet is sent
   */
  async sendAudioPacket(opusData: Uint8Array): Promise<void> {
    if (!this.isReady) {
      throw new Error("Cannot send packet: not connected");
    }

    try {
      // Prepare the RTP packet
      const packet = this.#createAudioPacket(opusData);

      // Encrypt the packet
      const encryptedPacket = this.#encryption.encryptPacket(packet);

      // Send the packet
      await this.#sendPacket(encryptedPacket);

      // Increment counters
      this.#sequence = (this.#sequence + 1) & 0xffff;
      this.#timestamp = (this.#timestamp + 960) & 0xffffffff; // 20ms at 48kHz
    } catch (error) {
      throw new Error(
        `Error sending packet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sets the secret key for packet encryption
   *
   * @param secretKey - Secret key provided by Discord
   * @param mode - Encryption mode to use
   */
  setSecretKey(secretKey: number[] | Uint8Array, mode: string): void {
    // Store the mode
    this.#encryptionMode = mode;

    // Set the key in the encryption service
    this.#encryption.setSecretKey(secretKey);
  }

  /**
   * Releases all resources used by this client
   */
  destroy(): void {
    this.disconnect();
    this.#encryption.destroy();
    this.#ipDiscovery.destroy();
    this.removeAllListeners();
  }

  /**
   * Creates a UDP socket for audio communication
   * @private
   */
  async #createSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        // Create a UDP socket
        const socket = dgram.createSocket("udp4");

        // Set up event listeners
        socket.on("error", (error) => {
          this.emit("error", error);
        });

        socket.on("message", (message, rinfo) => {
          this.#handleIncomingPacket(message, rinfo);
        });

        socket.on("listening", () => {
          const address = socket.address();
          this.#connectionInfo.localAddress = address.address;
          this.#connectionInfo.localPort = address.port;

          // Configure buffers AFTER socket is listening
          try {
            socket.setSendBufferSize(this.#options.sendBufferSize);
            socket.setRecvBufferSize(this.#options.receiveBufferSize);
          } catch (error) {
            // Ignore buffer configuration errors and continue
            this.emit(
              "error",
              new Error(`Warning - Buffer configuration: ${error}`),
            );
          }

          resolve();
        });

        // Start listening
        socket.bind();

        // Store the socket
        this.#socket = socket;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Closes the UDP socket
   * @private
   */
  #closeSocket(): void {
    if (!this.#socket) {
      return;
    }

    try {
      this.#socket.removeAllListeners();
      this.#socket.close();
    } catch (_error) {
      // Ignore errors during closing
    } finally {
      this.#socket = null;
    }
  }

  /**
   * Performs IP discovery to determine external address and port
   * @private
   */
  async #discoverIp(): Promise<void> {
    if (!(this.#ipDiscovery && this.#socket)) {
      throw new Error("IP discovery service not available");
    }

    const { ip, port, ssrc } = this.#connectionInfo;

    if (!(ip && port && ssrc)) {
      throw new Error("Incomplete connection information");
    }

    // Configure server information
    this.#ipDiscovery.setServerInfo(ssrc, ip, port);

    try {
      // Perform discovery
      const { address, port: externalPort } =
        await this.#ipDiscovery.discover();

      // Store discovered information
      this.#connectionInfo.localAddress = address;
      this.#connectionInfo.localPort = externalPort;

      // Emit the event
      this.emit("ipDiscovered", address, externalPort);
    } catch (error) {
      throw new Error(
        `IP discovery failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sends a UDP packet to the server
   *
   * @param data - Data to send
   * @private
   */
  async #sendPacket(data: Uint8Array): Promise<void> {
    if (!this.#socket) {
      throw new Error("Socket not available");
    }

    const { ip, port } = this.#connectionInfo;

    if (!(ip && port)) {
      throw new Error("Incomplete connection information");
    }

    return new Promise<void>((resolve, reject) => {
      // Timer for timeout
      const timeout = setTimeout(() => {
        reject(new Error("Send timeout exceeded"));
      }, this.#options.sendTimeout);

      // Send the packet
      this.#socket?.send(
        data,
        0,
        data.length,
        port,
        ip,
        (error: Error | null) => {
          clearTimeout(timeout);

          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }

  /**
   * Processes a received UDP packet
   *
   * @param data - Received data
   * @param rinfo - Sender information
   * @private
   */
  #handleIncomingPacket(data: Buffer, rinfo: dgram.RemoteInfo): void {
    try {
      // Ignore packets not from the voice server
      if (
        rinfo.address !== this.#connectionInfo.ip ||
        rinfo.port !== this.#connectionInfo.port
      ) {
        return;
      }

      // If it's an RTP packet (starts with 0x80)
      if (data.length > 12 && data[0] === 0x80) {
        this.#handleAudioPacket(data);
      }
    } catch (error) {
      this.emit(
        "error",
        new Error(
          `Error processing packet: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  /**
   * Processes a received RTP audio packet
   *
   * @param data - RTP data received
   * @private
   */
  #handleAudioPacket(data: Buffer): void {
    try {
      // Decrypt the packet
      const audioData = this.#encryption.decryptPacket(data);

      // Extract RTP packet information
      const ssrc = data.readUInt32BE(8);
      const sequence = data.readUInt16BE(2);
      const timestamp = data.readUInt32BE(4);

      // Emit the event
      this.emit("audioPacket", audioData, sequence, timestamp, ssrc);
    } catch (_error) {
      // Ignore decryption errors (malformed packets, etc.)
    }
  }

  /**
   * Creates an RTP audio packet for sending
   *
   * @param opusData - Opus encoded data
   * @returns RTP packet ready for encryption
   * @private
   */
  #createAudioPacket(opusData: Uint8Array): VoicePacket {
    return {
      versionAndFlags: 0x80,
      payloadType: 0x78,
      sequence: this.#sequence,
      timestamp: this.#timestamp,
      ssrc: this.#connectionInfo.ssrc as number,
      encryptedAudio: opusData,
    };
  }
}
