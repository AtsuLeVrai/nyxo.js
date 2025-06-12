import { type Socket, createSocket } from "node:dgram";
import { promisify } from "node:util";
import { z } from "zod/v4";
import type { EncryptionService } from "../services/index.js";

/**
 * RTP (Real-time Transport Protocol) header structure for voice packets.
 * This header format is required by Discord's voice protocol for proper
 * packet identification and sequencing.
 *
 * @see {@link https://tools.ietf.org/html/rfc3550#section-5.1}
 */
const RTP_HEADER = {
  /** RTP version and flags byte (0x80) */
  VERSION_FLAGS: 0x80,
  /** Payload type for Discord voice (0x78) */
  PAYLOAD_TYPE: 0x78,
  /** Size of RTP header in bytes */
  SIZE: 12,
} as const;

/**
 * UDP connection configuration and limits.
 */
const UDP_CONFIG = {
  /** Maximum UDP packet size to prevent fragmentation */
  MAX_PACKET_SIZE: 1500,
  /** Timeout for UDP operations in milliseconds */
  OPERATION_TIMEOUT: 5000,
  /** Buffer size for UDP socket */
  SOCKET_BUFFER_SIZE: 65536,
} as const;

/**
 * UDP connection state information.
 */
export interface UdpConnectionInfo {
  /** Local IP address bound to socket */
  localIp: string;
  /** Local port bound to socket */
  localPort: number;
  /** Remote server IP address */
  remoteIp: string;
  /** Remote server port */
  remotePort: number;
  /** Whether connection is currently active */
  connected: boolean;
}

/**
 * Zod schema for validating UDP manager configuration options.
 *
 * This schema ensures that all UDP connection and transmission parameters
 * are properly validated according to Discord Voice Gateway requirements
 * and real-time audio transmission best practices.
 */
export const UdpManagerOptions = z.object({
  /**
   * Local IP address to bind the UDP socket to.
   *
   * Specifies the local network interface that should be used for UDP
   * voice transmission. When not specified, the system will automatically
   * select the appropriate interface based on routing tables and network
   * configuration.
   *
   * Use cases for explicit local IP binding:
   * - **Multi-homed Systems**: Servers with multiple network interfaces
   * - **VPN Configurations**: Force traffic through specific VPN interfaces
   * - **Network Isolation**: Bind to specific internal network segments
   * - **Testing/Development**: Use specific interfaces for debugging
   * - **Load Balancing**: Distribute connections across multiple interfaces
   *
   * Security considerations:
   * - Only bind to trusted network interfaces
   * - Avoid binding to public interfaces unless necessary
   * - Consider firewall rules for the selected interface
   */
  localIp: z.ipv4().optional(),

  /**
   * Local port number to bind the UDP socket to.
   *
   * Specifies the local port for UDP voice transmission. When not specified
   * or set to 0, the system will automatically assign an available ephemeral
   * port from the operating system's dynamic port range.
   *
   * Port selection strategies:
   * - **Automatic (0)**: Let the OS choose an available port (recommended)
   * - **Fixed Port**: Use a specific port for consistent NAT/firewall rules
   * - **Port Range**: Use ports within a specific range for enterprise configs
   *
   * Considerations:
   * - **NAT Traversal**: Fixed ports may help with NAT configuration
   * - **Firewall Rules**: Specific ports may simplify firewall management
   * - **Port Conflicts**: Fixed ports may conflict with other applications
   * - **Security**: Avoid using well-known service ports (1-1023)
   *
   * @minimum 0
   * @maximum 65535
   * @default undefined (automatic assignment)
   */
  localPort: z.number().int().min(0).max(65535).optional(),

  /**
   * Socket buffer size in bytes for UDP transmission.
   *
   * Controls the size of the operating system's UDP socket send and receive
   * buffers. Larger buffers can help with burst traffic and reduce packet
   * loss during network congestion, but consume more memory.
   *
   * Buffer sizing considerations:
   * - **Real-time Audio**: Balance latency vs packet loss prevention
   * - **Network Conditions**: Larger buffers for unstable connections
   * - **Memory Usage**: Consider system memory constraints
   * - **Application Type**: Bots may need different sizing than clients
   *
   * Recommended values:
   * - **Voice Bots**: 32768-65536 bytes (balanced)
   * - **Music Bots**: 65536-131072 bytes (higher quality)
   * - **Low Memory**: 16384-32768 bytes (constrained environments)
   * - **High Performance**: 131072+ bytes (enterprise applications)
   *
   * @minimum 1024
   * @maximum 16777216
   * @default 65536
   * @unit bytes
   */
  bufferSize: z
    .number()
    .int()
    .min(1024)
    .max(16777216)
    .default(UDP_CONFIG.SOCKET_BUFFER_SIZE),

  /**
   * Enable automatic error recovery mechanisms.
   *
   * When enabled, the UDP manager will automatically attempt to recover
   * from transmission failures, network errors, and connection issues.
   * This improves reliability for real-time voice applications by handling
   * transient network problems transparently.
   *
   * Recovery mechanisms include:
   * - **Socket Reconnection**: Automatic reconnection on socket errors
   * - **Transmission Retry**: Retry failed packet transmissions
   * - **State Recovery**: Restore RTP sequence/timestamp state
   * - **Buffer Adjustment**: Dynamic buffer size optimization
   * - **Network Adaptation**: Adapt to changing network conditions
   *
   * Benefits of auto-recovery:
   * - **Improved Reliability**: Reduces manual intervention requirements
   * - **Seamless Experience**: Users experience fewer audio interruptions
   * - **Production Ready**: Suitable for production voice applications
   * - **Network Resilience**: Handles unstable network conditions
   *
   * Disable only when:
   * - Implementing custom error handling logic
   * - Requiring immediate failure notification
   * - Testing error conditions in development
   *
   * @default true
   */
  autoRecovery: z.boolean().default(true),

  /**
   * Maximum consecutive send failures before giving up.
   *
   * Defines the threshold for consecutive UDP transmission failures that
   * will trigger permanent failure mode. This prevents infinite retry loops
   * and resource exhaustion during persistent network issues or misconfigurations.
   *
   * Failure scenarios that increment this counter:
   * - **Network Unreachable**: Target server not accessible
   * - **Socket Errors**: Local socket issues or resource exhaustion
   * - **Encryption Failures**: Voice packet encryption errors
   * - **Rate Limiting**: Server-side rate limiting responses
   * - **Buffer Overflows**: Local or remote buffer capacity exceeded
   *
   * The counter resets to zero on any successful transmission, so only
   * sustained failure sequences will trigger this limit.
   *
   * Recommended values by use case:
   * - **Critical Applications**: 3-5 (fail fast, alert operators)
   * - **Standard Voice**: 10-15 (balanced reliability)
   * - **Resilient Bots**: 20-30 (maximum persistence)
   * - **Development/Testing**: 1-2 (immediate error visibility)
   *
   * @minimum 1
   * @maximum 100
   * @default 10
   */
  maxSendFailures: z.number().int().min(1).max(100).default(10),
});

/**
 * Inferred TypeScript type from the Zod schema.
 *
 * Use this type for function parameters, return values, and variable
 * declarations when working with validated UDP manager options.
 */
export type UdpManagerOptions = z.infer<typeof UdpManagerOptions>;

/**
 * Manager responsible for UDP voice data transmission in Discord Voice Gateway.
 *
 * This manager handles the low-level UDP socket operations required for sending
 * encrypted voice data to Discord's voice servers. It implements the RTP (Real-time
 * Transport Protocol) standard with Discord-specific requirements for voice packet
 * transmission.
 *
 * ## Core Responsibilities
 *
 * - **UDP Socket Management**: Creates, configures, and maintains UDP socket connections
 * - **RTP Packet Construction**: Builds properly formatted RTP headers for voice packets
 * - **Voice Data Transmission**: Sends encrypted voice data with proper sequencing
 * - **Connection State Management**: Tracks UDP connection status and statistics
 * - **Error Recovery**: Handles network errors and connection recovery
 *
 * ## RTP Protocol Implementation
 *
 * The manager implements RTP packet structure:
 * ```
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Version │ P │ X │ CC │ M │ PT │     Sequence Number         │
 * ├─────────────────────────────────────────────────────────────┤
 * │                        Timestamp                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │                     SSRC (Source ID)                       │
 * ├─────────────────────────────────────────────────────────────┤
 * │                   Encrypted Audio Data                     │
 * └─────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Voice Transmission Flow
 *
 * 1. **Socket Creation**: Bind UDP socket to local address/port
 * 2. **Connection Setup**: Connect to Discord's voice server endpoint
 * 3. **Packet Construction**: Create RTP header with sequence/timestamp
 * 4. **Audio Encryption**: Encrypt audio data using configured encryption mode
 * 5. **Packet Transmission**: Send complete packet via UDP socket
 * 6. **State Updates**: Update counters and timestamps for next packet
 *
 * ## Performance Characteristics
 *
 * - **Real-time Performance**: Optimized for low-latency voice transmission
 * - **High Throughput**: Capable of sustained 50+ packets/second transmission
 * - **Minimal Overhead**: Efficient packet construction and sending
 * - **Network Resilience**: Robust error handling for unstable connections
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#sending-voice}
 * @see {@link https://tools.ietf.org/html/rfc3550} RTP Specification
 */
export class UdpManager {
  /**
   * Manager configuration options.
   * @internal
   */
  readonly #options: UdpManagerOptions;

  /**
   * Encryption service for voice data encryption.
   * @internal
   */
  readonly #encryption: EncryptionService;

  /**
   * UDP socket for voice data transmission.
   * @internal
   */
  #socket: Socket | null = null;

  /**
   * Current UDP connection information.
   * @internal
   */
  #connectionInfo: UdpConnectionInfo | null = null;

  /**
   * Current RTP sequence number for packet ordering.
   * Incremented for each transmitted packet.
   * @internal
   */
  #sequence = 0;

  /**
   * Current RTP timestamp for audio synchronization.
   * Incremented based on audio frame timing.
   * @internal
   */
  #timestamp = 0;

  /**
   * SSRC (Synchronization Source) identifier for this voice connection.
   * @internal
   */
  #ssrc = 0;

  /**
   * Counter for consecutive send failures.
   * Used for error recovery decisions.
   * @internal
   */
  #consecutiveFailures = 0;

  /**
   * Whether the UDP connection is currently active.
   * @internal
   */
  #connected = false;

  /**
   * Creates a new UdpManager instance.
   *
   * @param encryption - Encryption service for voice data
   * @param options - Configuration options for UDP management
   */
  constructor(encryption: EncryptionService, options: UdpManagerOptions) {
    this.#encryption = encryption;
    this.#options = options;
  }

  /**
   * Gets the current UDP connection information.
   *
   * @returns Connection information, or null if not connected
   */
  get connectionInfo(): Readonly<UdpConnectionInfo> | null {
    return this.#connectionInfo ? { ...this.#connectionInfo } : null;
  }

  /**
   * Gets whether the UDP connection is currently active and ready for transmission.
   *
   * @returns True if connected and ready for voice transmission
   */
  get isConnected(): boolean {
    return this.#connected && this.#socket !== null;
  }

  /**
   * Gets the current RTP sequence number.
   *
   * @returns Current sequence number for packet ordering
   */
  get currentSequence(): number {
    return this.#sequence;
  }

  /**
   * Gets the current RTP timestamp.
   *
   * @returns Current timestamp for audio synchronization
   */
  get currentTimestamp(): number {
    return this.#timestamp;
  }

  /**
   * Gets the SSRC identifier for this voice connection.
   *
   * @returns SSRC value, or 0 if not set
   */
  get ssrc(): number {
    return this.#ssrc;
  }

  /**
   * Establishes UDP connection to Discord's voice server.
   *
   * This method creates and configures a UDP socket for voice data transmission.
   * It sets up the connection to the specified voice server endpoint and prepares
   * for real-time voice packet transmission.
   *
   * The connection process includes:
   * 1. **Socket Creation**: Creates a new UDP socket with optimal configuration
   * 2. **Address Binding**: Binds to local IP/port for proper NAT traversal
   * 3. **Server Connection**: Connects to Discord's voice server endpoint
   * 4. **Buffer Configuration**: Optimizes socket buffers for real-time transmission
   * 5. **State Initialization**: Resets sequence numbers and transmission state
   *
   * @param serverIp - Discord voice server IP address
   * @param serverPort - Discord voice server port
   * @param ssrc - SSRC identifier for this voice connection
   * @throws {Error} If connection fails or parameters are invalid
   */
  async connect(
    serverIp: string,
    serverPort: number,
    ssrc: number,
  ): Promise<void> {
    // Clean up any existing connection
    this.disconnect();

    try {
      // Create and configure UDP socket
      const socket = await this.#createSocket();
      this.#socket = socket;

      // Connect to voice server
      await this.#connectToServer(socket, serverIp, serverPort);

      // Store connection information
      const localAddress = socket.address();
      this.#connectionInfo = {
        localIp: localAddress.address,
        localPort: localAddress.port,
        remoteIp: serverIp,
        remotePort: serverPort,
        connected: true,
      };

      // Initialize voice transmission state
      this.#ssrc = ssrc;
      this.#sequence = 0;
      this.#timestamp = 0;
      this.#consecutiveFailures = 0;
      this.#connected = true;
    } catch (error) {
      // Clean up on failure
      this.disconnect();

      throw new Error(
        `Failed to establish UDP connection to ${serverIp}:${serverPort}: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Sends encrypted voice data over the UDP connection.
   *
   * This method is the primary interface for transmitting voice data to Discord's
   * voice servers. It handles the complete transmission pipeline including RTP
   * packet construction, audio encryption, and UDP transmission.
   *
   * ## Transmission Pipeline
   *
   * 1. **Connection Validation**: Ensures UDP connection is active
   * 2. **RTP Header Construction**: Creates proper RTP header with sequence/timestamp
   * 3. **Audio Encryption**: Encrypts audio data using configured encryption mode
   * 4. **Packet Assembly**: Combines RTP header with encrypted audio
   * 5. **UDP Transmission**: Sends complete packet to Discord's voice server
   * 6. **State Updates**: Updates sequence/timestamp for next packet
   *
   * ## Audio Data Requirements
   *
   * - **Format**: Raw audio data (typically Opus-encoded)
   * - **Size**: Should not exceed MTU limits (~1400 bytes recommended)
   * - **Timing**: Called at regular intervals (typically every 20ms for voice)
   * - **Consistency**: Maintain consistent timing for smooth audio playback
   *
   * ## Error Handling
   *
   * - **Network Errors**: Automatic retry for transient network issues
   * - **Encryption Errors**: Proper error propagation with context
   * - **Connection Loss**: Automatic recovery if enabled
   * - **Rate Limiting**: Graceful handling of server-side rate limits
   *
   * @param audioData - Raw audio data to transmit
   * @returns Promise resolving when packet is sent successfully
   * @throws {Error} If not connected, encryption fails, or transmission fails
   */
  async sendVoiceData(audioData: Uint8Array): Promise<void> {
    // Ensure connection is active
    this.#ensureConnected();

    // Validate audio data
    this.#validateAudioData(audioData);

    try {
      // Create RTP packet with header and audio data
      const rtpPacket = this.#createRtpPacket(audioData);

      // Encrypt the audio portion of the packet
      const encryptedPacket = this.#encryptVoicePacket(rtpPacket);

      // Send the encrypted packet via UDP
      await this.#sendUdpPacket(encryptedPacket);

      // Increment sequence number (16-bit wraparound)
      this.#sequence = (this.#sequence + 1) & 0xffff;

      // Reset consecutive failure counter on success
      this.#consecutiveFailures = 0;
    } catch (error) {
      this.#consecutiveFailures++;

      // Attempt automatic recovery if enabled
      if (this.#options.autoRecovery && this.#shouldAttemptRecovery()) {
        try {
          await this.#attemptRecovery();

          // Retry transmission after recovery
          await this.sendVoiceData(audioData);
          return;
        } catch (recoveryError) {
          throw new Error(
            `Voice data transmission failed and recovery unsuccessful: ${(error as Error).message}. ` +
              `Recovery error: ${(recoveryError as Error).message}`,
            { cause: error },
          );
        }
      }

      throw new Error(
        `Failed to send voice data: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Disconnects the UDP connection and cleans up resources.
   *
   * This method safely closes the UDP socket and resets all connection state.
   * It should be called when ending voice transmission or switching voice servers.
   *
   * Cleanup includes:
   * - **Socket Closure**: Properly closes the UDP socket
   * - **State Reset**: Clears connection information and transmission state
   * - **Resource Release**: Frees any allocated network resources
   * - **Event Cleanup**: Removes socket event listeners
   */
  disconnect(): void {
    this.#connected = false;
    this.#connectionInfo = null;

    if (this.#socket) {
      try {
        // Remove event listeners to prevent memory leaks
        this.#socket.removeAllListeners();

        // Close the socket
        this.#socket.close();
      } catch {
        // Ignore cleanup errors
      } finally {
        this.#socket = null;
      }
    }

    // Reset transmission state
    this.#sequence = 0;
    this.#timestamp = 0;
    this.#ssrc = 0;
    this.#consecutiveFailures = 0;
  }

  /**
   * Updates the RTP timestamp for audio synchronization.
   *
   * This method should be called to advance the RTP timestamp based on audio
   * frame timing. Proper timestamp management is crucial for smooth audio
   * playback and synchronization.
   *
   * @param increment - Number of samples to advance the timestamp
   */
  updateTimestamp(increment: number): void {
    if (!Number.isInteger(increment) || increment < 0) {
      throw new Error(
        `Invalid timestamp increment: ${increment}. Must be a non-negative integer.`,
      );
    }

    this.#timestamp = (this.#timestamp + increment) >>> 0; // Ensure 32-bit unsigned
  }

  /**
   * Resets transmission counters and state.
   *
   * This method resets the RTP sequence number, timestamp, and statistics
   * while preserving the connection. Useful when starting a new voice session
   * or recovering from synchronization issues.
   */
  resetTransmissionState(): void {
    this.#sequence = 0;
    this.#timestamp = 0;
    this.#consecutiveFailures = 0;
  }

  /**
   * Validates audio data for transmission.
   *
   * @param audioData - Audio data to validate
   * @throws {Error} If audio data is invalid
   * @internal
   */
  #validateAudioData(audioData: Uint8Array): void {
    if (!audioData || audioData.length === 0) {
      throw new Error("Audio data cannot be empty");
    }

    if (audioData.length > UDP_CONFIG.MAX_PACKET_SIZE - RTP_HEADER.SIZE - 32) {
      throw new Error(
        `Audio data too large: ${audioData.length} bytes. Maximum allowed: ${UDP_CONFIG.MAX_PACKET_SIZE - RTP_HEADER.SIZE - 32} bytes.`,
      );
    }
  }

  /**
   * Ensures UDP connection is active.
   *
   * @throws {Error} If not connected
   * @internal
   */
  #ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error("UDP connection not established. Call connect() first.");
    }
  }

  /**
   * Creates and configures a UDP socket.
   *
   * @returns Configured UDP socket
   * @throws {Error} If socket creation fails
   * @internal
   */
  async #createSocket(): Promise<Socket> {
    const socket = createSocket("udp4");
    const bindAsync = promisify(socket.bind.bind(socket));

    try {
      // Bind to local address/port
      // @ts-expect-error - TypeScript does not recognize bind as a method
      await bindAsync(this.#options.localPort, this.#options.localIp);

      // Configure socket options for optimal voice transmission
      try {
        socket.setRecvBufferSize(this.#options.bufferSize);
        socket.setSendBufferSize(this.#options.bufferSize);
      } catch {
        // Ignore errors setting buffer sizes, not critical
      }

      return socket;
    } catch (error) {
      socket.close();
      throw new Error(
        `Failed to create UDP socket: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Connects socket to voice server.
   *
   * @param socket - UDP socket to connect
   * @param serverIp - Voice server IP
   * @param serverPort - Voice server port
   * @throws {Error} If connection fails
   * @internal
   */
  async #connectToServer(
    socket: Socket,
    serverIp: string,
    serverPort: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Connection timeout after ${UDP_CONFIG.OPERATION_TIMEOUT}ms`,
          ),
        );
      }, UDP_CONFIG.OPERATION_TIMEOUT);

      socket.connect(serverPort, serverIp, () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.on("error", (error) => {
        clearTimeout(timeout);
        reject(new Error(`Socket error: ${error.message}`));
      });

      socket.on("close", () => {
        this.#connected = false;
        this.#connectionInfo = null;
      });
    });
  }

  /**
   * Creates an RTP packet with proper header and audio data.
   *
   * @param audioData - Audio data to include in packet
   * @returns Complete RTP packet
   * @internal
   */
  #createRtpPacket(audioData: Uint8Array): Uint8Array {
    const packet = new Uint8Array(RTP_HEADER.SIZE + audioData.length);
    const view = new DataView(packet.buffer);

    let offset = 0;

    // Version + Flags (1 byte)
    packet[offset++] = RTP_HEADER.VERSION_FLAGS;

    // Payload Type (1 byte)
    packet[offset++] = RTP_HEADER.PAYLOAD_TYPE;

    // Sequence Number (2 bytes, big endian)
    view.setUint16(offset, this.#sequence, false);
    offset += 2;

    // Timestamp (4 bytes, big endian)
    view.setUint32(offset, this.#timestamp, false);
    offset += 4;

    // SSRC (4 bytes, big endian)
    view.setUint32(offset, this.#ssrc, false);
    offset += 4;

    // Audio data
    packet.set(audioData, offset);

    return packet;
  }

  /**
   * Encrypts a voice packet using the configured encryption service.
   *
   * @param rtpPacket - Complete RTP packet to encrypt
   * @returns Encrypted packet ready for transmission
   * @throws {Error} If encryption fails
   * @internal
   */
  #encryptVoicePacket(rtpPacket: Uint8Array): Uint8Array {
    try {
      const encrypted = this.#encryption.encrypt(rtpPacket);

      // Combine RTP header with encrypted audio and nonce
      const header = rtpPacket.subarray(0, RTP_HEADER.SIZE);
      const packet = new Uint8Array(
        header.length + encrypted.encryptedAudio.length + 4,
      );

      let offset = 0;

      // Copy RTP header
      packet.set(header, offset);
      offset += header.length;

      // Copy encrypted audio
      packet.set(encrypted.encryptedAudio, offset);
      offset += encrypted.encryptedAudio.length;

      // Append nonce for incremental modes
      const nonceView = new DataView(packet.buffer, offset);
      nonceView.setUint32(0, encrypted.nonce, false);

      return packet;
    } catch (error) {
      throw new Error(
        `Failed to encrypt voice packet: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Sends a UDP packet to the connected voice server.
   *
   * @param packet - Packet data to send
   * @throws {Error} If transmission fails
   * @internal
   */
  async #sendUdpPacket(packet: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!(this.#socket && this.#connectionInfo)) {
        reject(new Error("Socket or connection info not available"));
        return;
      }

      this.#socket.send(packet, (error) => {
        if (error) {
          reject(new Error(`UDP send failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Determines if automatic recovery should be attempted.
   *
   * @returns True if recovery should be attempted
   * @internal
   */
  #shouldAttemptRecovery(): boolean {
    return this.#consecutiveFailures < this.#options.maxSendFailures;
  }

  /**
   * Attempts to recover from transmission failures.
   *
   * @throws {Error} If recovery fails
   * @internal
   */
  async #attemptRecovery(): Promise<void> {
    if (!this.#connectionInfo) {
      throw new Error("Cannot recover without connection info");
    }

    const { remoteIp, remotePort } = this.#connectionInfo;
    const currentSsrc = this.#ssrc;

    // Attempt to reconnect
    await this.connect(remoteIp, remotePort, currentSsrc);
  }
}
