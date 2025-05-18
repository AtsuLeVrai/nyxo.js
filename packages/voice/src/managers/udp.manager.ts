import dgram from "node:dgram";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import {
  type AudioService,
  IpDiscoveryOptions,
  IpDiscoveryService,
  type RtpPacketOptions,
  type RtpService,
} from "../services/index.js";
import {
  VoiceConnectionStatus,
  type VoiceEncryptionMode,
  type VoiceRtpPacketEntity,
} from "../types/index.js";

/**
 * Options for configuring the UDP Manager
 */
export const UdpManagerOptions = z.object({
  /**
   * SSRC (Synchronization Source) identifier for this client
   * Required and must be provided by Discord's voice server
   */
  ssrc: z.number().int().positive(),

  /**
   * Voice server IP address for UDP connections
   * Provided by Discord in the Ready payload
   */
  serverIp: z.string().min(1),

  /**
   * Voice server port for UDP connections
   * Provided by Discord in the Ready payload
   */
  serverPort: z.number().int().positive(),

  /**
   * Local port to bind the UDP socket to
   * If not specified, the OS will assign a random available port
   * @default 0
   */
  localPort: z.number().int().min(0).default(0),

  /**
   * Local IP address to bind the UDP socket to
   * @default "0.0.0.0"
   */
  localAddress: z.string().default("0.0.0.0"),

  /**
   * IP discovery options
   * @default {}
   */
  ipDiscovery: IpDiscoveryOptions.default({}),

  /**
   * Socket timeout in milliseconds
   * @default 10000
   */
  socketTimeout: z.number().int().positive().default(10000),

  /**
   * Enable packet handling
   * When true, automatically processes incoming packets
   * @default true
   */
  handlePackets: z.boolean().default(true),

  /**
   * Packet queue size limit
   * Maximum number of packets to buffer for processing
   * @default 100
   */
  packetQueueLimit: z.number().int().positive().default(100),

  /**
   * Send buffer size in bytes
   * Configures the socket's send buffer size (SO_SNDBUF)
   * @default 1024 * 512
   */
  sendBufferSize: z
    .number()
    .int()
    .positive()
    .default(1024 * 512),

  /**
   * Receive buffer size in bytes
   * Configures the socket's receive buffer size (SO_RCVBUF)
   * @default 1024 * 512
   */
  receiveBufferSize: z
    .number()
    .int()
    .positive()
    .default(1024 * 512),
});

export type UdpManagerOptions = z.infer<typeof UdpManagerOptions>;

/**
 * Statistics about UDP socket operation
 */
export interface UdpStats {
  /**
   * Number of packets sent
   */
  packetsSent: number;

  /**
   * Number of packets received
   */
  packetsReceived: number;

  /**
   * Number of bytes sent
   */
  bytesSent: number;

  /**
   * Number of bytes received
   */
  bytesReceived: number;

  /**
   * Number of IP discovery requests sent
   */
  ipDiscoveryRequests: number;

  /**
   * Number of packet processing errors
   */
  processingErrors: number;

  /**
   * Current connection status
   */
  connectionStatus: VoiceConnectionStatus;

  /**
   * Selected encryption mode
   */
  encryptionMode: VoiceEncryptionMode | null;

  /**
   * External IP address (discovered)
   */
  externalIp: string | null;

  /**
   * External port (discovered)
   */
  externalPort: number | null;

  /**
   * Local port (bound)
   */
  localPort: number | null;
}

/**
 * Events emitted by the UDP Manager
 */
export interface UdpManagerEvents {
  /**
   * Emitted when the UDP socket is ready and bound
   * @param localPort Port the socket is bound to
   */
  ready: [localPort: number];

  /**
   * Emitted when IP discovery is complete
   * @param address Discovered external IP address
   * @param port Discovered external port
   */
  ipDiscovered: [address: string, port: number];

  /**
   * Emitted when connection status changes
   * @param status New connection status
   * @param previous Previous connection status
   */
  statusChange: [
    status: VoiceConnectionStatus,
    previous: VoiceConnectionStatus,
  ];

  /**
   * Emitted when a packet is sent
   * @param size Size of the packet in bytes
   */
  packetSent: [size: number];

  /**
   * Emitted when a packet is received
   * @param size Size of the packet in bytes
   * @param packet Parsed RTP packet (if it's an RTP packet)
   */
  packetReceived: [size: number, packet?: VoiceRtpPacketEntity];

  /**
   * Emitted when there's an error
   * @param error The error that occurred
   * @param operation The operation that caused the error
   */
  error: [error: Error, operation: string];

  /**
   * Emitted when the socket is closed
   * @param hadError Whether the socket closed due to an error
   */
  close: [hadError: boolean];

  /**
   * Emitted when statistics are updated
   * @param stats Statistics object
   */
  stats: [stats: UdpStats];
}

/**
 * UDP Manager for Voice connections
 *
 * Handles the UDP socket communication for voice data transport
 * with Discord's voice servers. This includes:
 * - Establishing and maintaining the UDP connection
 * - IP discovery for NAT traversal
 * - Sending and receiving RTP packets
 * - Coordinating with the RTP service for encryption/decryption
 */
export class UdpManager extends EventEmitter<UdpManagerEvents> {
  /**
   * UDP socket for voice communication
   * @private
   */
  #socket: dgram.Socket | null = null;

  /**
   * Validated configuration options
   * @private
   */
  readonly #options: UdpManagerOptions;

  /**
   * RTP service for packet encryption/decryption
   * @private
   */
  #rtpService: RtpService | null = null;

  /**
   * Audio service for processing audio data
   * @private
   */
  #audioService: AudioService | null = null;

  /**
   * IP discovery service
   * @private
   */
  readonly #ipDiscovery: IpDiscoveryService;

  /**
   * Current connection status
   * @private
   */
  #status: VoiceConnectionStatus = VoiceConnectionStatus.Signaling;

  /**
   * Queue of incoming packets pending processing
   * @private
   */
  readonly #packetQueue: Buffer[] = [];

  /**
   * Whether packet processing is currently active
   * @private
   */
  #processingPackets = false;

  /**
   * Port the socket is bound to
   * @private
   */
  #boundPort = 0;

  /**
   * Local port the socket is bound to
   * @private
   */
  #localPort: number | null = null;

  /**
   * Statistics tracking
   * @private
   */
  readonly #stats: UdpStats = {
    packetsSent: 0,
    packetsReceived: 0,
    bytesSent: 0,
    bytesReceived: 0,
    ipDiscoveryRequests: 0,
    processingErrors: 0,
    connectionStatus: VoiceConnectionStatus.Signaling,
    encryptionMode: null,
    externalIp: null,
    externalPort: null,
    localPort: null,
  };

  /**
   * Creates a new UDP Manager
   *
   * @param options Configuration options for the UDP manager
   * @throws {Error} If options validation fails
   */
  constructor(options: UdpManagerOptions) {
    super();

    // Parse and validate options with Zod
    this.#options = UdpManagerOptions.parse(options);

    // Initialize IP discovery service
    this.#ipDiscovery = new IpDiscoveryService(
      this.#options.ssrc,
      this.#options.ipDiscovery,
    );

    // Listen for IP discovery events
    this.#ipDiscovery.on("discover", (address, port) => {
      this.#stats.externalIp = address;
      this.#stats.externalPort = port;
      this.emit("ipDiscovered", address, port);
    });

    this.#ipDiscovery.on("error", (error) => {
      this.emit("error", error, "ip-discovery");
    });
  }

  /**
   * Gets the current connection status
   * @returns Current connection status
   */
  get status(): VoiceConnectionStatus {
    return this.#status;
  }

  /**
   * Gets the SSRC (Synchronization Source) identifier
   * @returns SSRC value
   */
  get ssrc(): number {
    return this.#options.ssrc;
  }

  /**
   * Gets the server IP address
   * @returns Server IP address
   */
  get serverIp(): string {
    return this.#options.serverIp;
  }

  /**
   * Gets the server port
   * @returns Server port
   */
  get serverPort(): number {
    return this.#options.serverPort;
  }

  /**
   * Gets the discovered external IP address
   * @returns External IP address or null if not discovered
   */
  get externalIp(): string | null {
    return this.#ipDiscovery.externalIp;
  }

  /**
   * Gets the discovered external port
   * @returns External port or null if not discovered
   */
  get externalPort(): number | null {
    return this.#ipDiscovery.externalPort;
  }

  /**
   * Gets the local port the socket is bound to
   * @returns Local port or null if not connected
   */
  get localPort(): number | null {
    return this.#localPort;
  }

  /**
   * Checks if the UDP connection is ready
   * @returns True if connected and ready, false otherwise
   */
  get isReady(): boolean {
    return (
      this.#socket !== null &&
      this.#status === VoiceConnectionStatus.Connected &&
      this.#ipDiscovery.isDiscovered
    );
  }

  /**
   * Gets the current UDP statistics
   * @returns UDP statistics object
   */
  get stats(): UdpStats {
    // Update dynamic stats
    this.#stats.connectionStatus = this.#status;

    // Return a copy to prevent mutation
    return { ...this.#stats };
  }

  /**
   * Sets the RTP service for packet encryption/decryption
   *
   * @param service RTP service instance
   * @returns This instance for method chaining
   */
  setRtpService(service: RtpService): this {
    this.#rtpService = service;

    // Update encryption mode in stats
    this.#stats.encryptionMode = service.encryptionMode;

    return this;
  }

  /**
   * Sets the audio service for processing audio data
   *
   * @param service Audio service instance
   * @returns This instance for method chaining
   */
  setAudioService(service: AudioService): this {
    this.#audioService = service;

    // Listen for audio packets to send
    if (service) {
      service.on("packet", async (packet) => {
        if (this.isReady && this.#rtpService) {
          // Prepare RTP packet options
          const options: RtpPacketOptions = {
            sequence: service.sequence,
            timestamp: service.timestamp,
            ssrc: this.#options.ssrc,
            audioData: packet,
          };

          // Create and send the packet
          const rtpPacket = this.#rtpService.createPacket(options);
          await this.sendPacket(rtpPacket);
        }
      });
    }

    return this;
  }

  /**
   * Connects to Discord's voice server over UDP
   *
   * Creates and configures the UDP socket, binds to the local port,
   * and performs IP discovery if needed.
   *
   * @returns Promise that resolves when connection is established
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    // Skip if already connected
    if (
      this.#socket !== null &&
      this.#status !== VoiceConnectionStatus.Disconnected
    ) {
      return;
    }

    // Update status
    this.#setStatus(VoiceConnectionStatus.Connecting);

    try {
      // Create UDP socket
      this.#socket = dgram.createSocket("udp4");

      // Set socket buffer sizes
      this.#socket.setSendBufferSize(this.#options.sendBufferSize);
      this.#socket.setRecvBufferSize(this.#options.receiveBufferSize);

      // Set up event handlers
      this.#setSocketEventHandlers();

      // Bind socket to the specified local address and port
      await this.#bindSocket();

      // Perform IP discovery
      await this.#performIpDiscovery();

      // Update status to connected
      this.#setStatus(VoiceConnectionStatus.Connected);
    } catch (error) {
      // Clean up on error
      this.#closeSocket();

      // Set status to disconnected
      this.#setStatus(VoiceConnectionStatus.Disconnected);

      // Rethrow with context
      throw new Error(
        `Failed to connect to voice server: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sends a raw packet to the voice server
   *
   * @param packet Buffer containing the packet data
   * @returns Promise that resolves when the packet is sent
   * @throws {Error} If sending fails
   */
  async sendPacket(packet: Buffer): Promise<void> {
    if (!this.#socket || this.#status !== VoiceConnectionStatus.Connected) {
      throw new Error("Cannot send packet: UDP socket not connected");
    }

    return new Promise((resolve, reject) => {
      this.#socket?.send(
        packet,
        0,
        packet.length,
        this.#options.serverPort,
        this.#options.serverIp,
        (error) => {
          if (error) {
            this.emit("error", error, "send-packet");
            reject(error);
          } else {
            // Update statistics
            this.#stats.packetsSent++;
            this.#stats.bytesSent += packet.length;

            // Emit event
            this.emit("packetSent", packet.length);

            // Emit stats every 100 packets
            if (this.#stats.packetsSent % 100 === 0) {
              this.emit("stats", this.stats);
            }

            resolve();
          }
        },
      );
    });
  }

  /**
   * Sends a voice packet created from the RTP service
   *
   * @param options Options for creating the RTP packet
   * @returns Promise that resolves when the packet is sent
   * @throws {Error} If the RTP service is not set or sending fails
   */
  sendVoicePacket(options: RtpPacketOptions): Promise<void> {
    if (!this.#rtpService) {
      throw new Error("Cannot send voice packet: RTP service not set");
    }

    // Create packet with RTP service
    const packet = this.#rtpService.createPacket(options);

    // Send the packet
    return this.sendPacket(packet);
  }

  /**
   * Disconnects from the voice server
   *
   * Closes the UDP socket and cleans up resources.
   *
   * @returns This instance for method chaining
   */
  disconnect(): this {
    // Clean up socket
    this.#closeSocket();

    // Update status
    this.#setStatus(VoiceConnectionStatus.Disconnected);

    return this;
  }

  /**
   * Reconnects to the voice server
   *
   * @returns Promise that resolves when reconnected
   * @throws {Error} If reconnection fails
   */
  async reconnect(): Promise<void> {
    // Disconnect first
    this.disconnect();

    // Update status
    this.#setStatus(VoiceConnectionStatus.Reconnecting);

    // Connect again
    await this.connect();
  }

  /**
   * Cleans up resources used by the UDP manager
   *
   * Closes the socket and removes all event listeners.
   */
  destroy(): void {
    // Disconnect
    this.disconnect();

    // Remove all event listeners
    this.removeAllListeners();
  }

  /**
   * Binds the UDP socket to the specified local address and port
   *
   * @private
   */
  async #bindSocket(): Promise<void> {
    if (!this.#socket) {
      throw new Error("Cannot bind: socket not created");
    }

    return new Promise<void>((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Socket bind timeout after ${this.#options.socketTimeout}ms`,
          ),
        );
      }, this.#options.socketTimeout);

      // Try to bind the socket
      this.#socket?.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.#socket?.bind(
        this.#options.localPort,
        this.#options.localAddress,
        () => {
          clearTimeout(timeout);

          // Get the bound port
          this.#boundPort = this.#socket?.address().port as number;
          this.#localPort = this.#boundPort;
          this.#stats.localPort = this.#boundPort;

          // Emit ready event
          this.emit("ready", this.#boundPort);

          resolve();
        },
      );
    });
  }

  /**
   * Performs IP discovery to find the external IP and port
   *
   * @private
   */
  async #performIpDiscovery(): Promise<void> {
    if (!this.#socket) {
      throw new Error("Cannot perform IP discovery: socket not created");
    }

    try {
      // Update stats
      this.#stats.ipDiscoveryRequests++;

      // Perform IP discovery
      const result = await this.#ipDiscovery.discover(
        this.#socket,
        this.#options.serverIp,
        this.#options.serverPort,
      );

      // Update stats
      this.#stats.externalIp = result.address;
      this.#stats.externalPort = result.port;

      return;
    } catch (error) {
      throw new Error(
        `IP discovery failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sets up event handlers for the UDP socket
   *
   * @private
   */
  #setSocketEventHandlers(): void {
    if (!this.#socket) {
      return;
    }

    // Handle incoming messages
    this.#socket.on("message", (message, _rinfo) => {
      // Update statistics
      this.#stats.packetsReceived++;
      this.#stats.bytesReceived += message.length;

      // Emit event
      this.emit("packetReceived", message.length);

      // Process the packet if handling is enabled
      if (this.#options.handlePackets) {
        this.#queuePacket(message);
      }

      // Emit stats every 100 packets
      if (this.#stats.packetsReceived % 100 === 0) {
        this.emit("stats", this.stats);
      }
    });

    // Handle socket errors
    this.#socket.on("error", (error) => {
      this.emit("error", error, "socket");

      // If the error is fatal, close the socket
      if (
        (error as any).code === "ENOTFOUND" ||
        (error as any).code === "ECONNREFUSED"
      ) {
        this.#closeSocket();
        this.#setStatus(VoiceConnectionStatus.Disconnected);
      }
    });

    // Handle socket closure
    this.#socket.on("close", (hadError: boolean) => {
      this.emit("close", hadError);

      // Update status if not already disconnected
      if (this.#status !== VoiceConnectionStatus.Disconnected) {
        this.#setStatus(VoiceConnectionStatus.Disconnected);
      }
    });
  }

  /**
   * Queues a packet for processing
   *
   * @param packet Packet data to queue
   * @private
   */
  #queuePacket(packet: Buffer): void {
    // Check if queue is full
    if (this.#packetQueue.length >= this.#options.packetQueueLimit) {
      // Remove oldest packet
      this.#packetQueue.shift();
    }

    // Add packet to queue
    this.#packetQueue.push(Buffer.from(packet));

    // Start processing if not already in progress
    if (!this.#processingPackets) {
      this.#processPacketQueue();
    }
  }

  /**
   * Processes the packet queue
   *
   * @private
   */
  #processPacketQueue(): void {
    // Mark as processing
    this.#processingPackets = true;

    while (this.#packetQueue.length > 0) {
      // Get the next packet
      const packet = this.#packetQueue.shift();

      if (packet) {
        try {
          // Process the packet
          this.#processPacket(packet);
        } catch (error) {
          // Update stats
          this.#stats.processingErrors++;

          // Emit error event
          this.emit(
            "error",
            error instanceof Error ? error : new Error(String(error)),
            "process-packet",
          );
        }
      }
    }

    // Mark as done processing
    this.#processingPackets = false;
  }

  /**
   * Processes a single packet
   *
   * @param packet Packet data to process
   * @private
   */
  #processPacket(packet: Buffer): void {
    // Skip if RTP service is not set
    if (!this.#rtpService) {
      return;
    }

    try {
      // Skip if packet is IP discovery response (already handled by IP discovery service)
      if (packet.length >= 4 && packet.readUInt16BE(0) === 0x2) {
        return;
      }

      // Skip if packet is too small to be an RTP packet
      if (packet.length < 12) {
        return;
      }

      // Try to parse as RTP packet
      const rtpPacket = this.#rtpService.parsePacket(packet);

      // Emit packet received event with parsed packet
      this.emit("packetReceived", packet.length, rtpPacket);

      // If audio service is available, process the audio
      if (this.#audioService && this.#rtpService) {
        try {
          // Decrypt the audio data
          const opusPacket = this.#rtpService.decryptAudio(rtpPacket);

          // Process with audio service if it's not a silence frame
          if (
            opusPacket.length > 3 &&
            !(
              opusPacket[0] === 0xf8 &&
              opusPacket[1] === 0xff &&
              opusPacket[2] === 0xfe
            )
          ) {
            // Handle the packet in the audio service
            this.#audioService.playOpusPacket(opusPacket);
          }
        } catch (error) {
          // Decryption error - just log it but don't rethrow
          this.emit(
            "error",
            error instanceof Error
              ? error
              : new Error(`Decryption error: ${String(error)}`),
            "decrypt-audio",
          );
        }
      }
    } catch (error) {
      // Update stats
      this.#stats.processingErrors++;

      // Emit error event - but don't rethrow since we want to continue processing
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
        "process-packet",
      );
    }
  }

  /**
   * Closes the UDP socket
   *
   * @private
   */
  #closeSocket(): void {
    const socket = this.#socket;
    if (!socket) {
      return;
    }

    // Remove all listeners
    socket.removeAllListeners();

    try {
      // Attempt to close the socket
      socket.close();
    } catch (_error) {
      // Ignore errors during close
    }

    // Clear socket reference
    this.#socket = null;

    // Reset local port
    this.#localPort = null;
    this.#stats.localPort = null;
  }

  /**
   * Updates the connection status and emits event
   *
   * @param status New status
   * @private
   */
  #setStatus(status: VoiceConnectionStatus): void {
    // Skip if status is the same
    if (this.#status === status) {
      return;
    }

    // Remember previous status
    const previousStatus = this.#status;

    // Update status
    this.#status = status;
    this.#stats.connectionStatus = status;

    // Emit event
    this.emit("statusChange", status, previousStatus);
  }
}
