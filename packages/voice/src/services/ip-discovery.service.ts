import { type Socket, createSocket } from "node:dgram";
import { promisify } from "node:util";
import { z } from "zod/v4";

/**
 * IP Discovery packet structure for Discord Voice Gateway.
 * This packet format is used to discover the external IP address and port
 * through Discord's voice servers using UDP hole punching techniques.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 */
const IP_DISCOVERY_PACKET = {
  /** Packet type for IP discovery request */
  REQUEST_TYPE: 0x1,
  /** Packet type for IP discovery response */
  RESPONSE_TYPE: 0x2,
  /** Fixed message length excluding type and length fields */
  MESSAGE_LENGTH: 70,
  /** Total packet size including all fields */
  PACKET_SIZE: 74,
  /** Address field size in bytes */
  ADDRESS_SIZE: 64,
  /** Port field size in bytes */
  PORT_SIZE: 2,
} as const;

/**
 * Default timeout for IP discovery operations in milliseconds.
 * This value is used as the default timeout for waiting
 */
const DEFAULT_DISCOVERY_TIMEOUT = 5000 as const;

/**
 * Result of IP discovery operation containing discovered network information.
 */
export interface IpDiscoveryResult {
  /** Discovered external IP address */
  ip: string;
  /** Discovered external port number */
  port: number;
  /** Local IP address used for the discovery */
  localIp: string;
  /** Local port used for the discovery */
  localPort: number;
  /** Time taken for the discovery operation in milliseconds */
  discoveryTime: number;
}

/**
 * Zod schema for validating IP discovery behavior options.
 *
 * This schema ensures that all IP discovery configuration parameters
 * are properly validated according to Discord Voice Gateway requirements
 * and network programming best practices.
 */
export const IpDiscoveryOptions = z.object({
  /**
   * Timeout for the discovery operation in milliseconds.
   *
   * Specifies the maximum amount of time to wait for the IP discovery
   * response from Discord's voice servers. Values should be between
   * 1000ms and 15000ms for optimal balance between responsiveness
   * and reliability across different network conditions.
   *
   * @default 5000
   * @minimum 1000
   * @maximum 15000
   */
  timeout: z.number().int().min(1000).max(15000).default(5000),

  /**
   * Local IP address to bind the UDP socket to.
   *
   * When specified, forces the discovery socket to bind to a specific
   * network interface. If not provided, the system will automatically
   * select the appropriate interface based on routing tables.
   * Useful for multi-homed systems or when testing specific interfaces.
   */
  localIp: z.ipv4().optional(),

  /**
   * Local port number to bind the UDP socket to.
   *
   * Specifies the local port for the UDP socket used in IP discovery.
   * If not provided, the system will automatically assign an available
   * ephemeral port. Port 0 explicitly requests automatic assignment.
   *
   * @minimum 0
   * @maximum 65535
   * @default undefined (automatic assignment)
   */
  localPort: z.number().int().min(0).max(65535).optional(),

  /**
   * Number of retry attempts on discovery failure.
   *
   * Specifies how many additional attempts should be made if the initial
   * IP discovery fails. Each retry uses an incrementally longer timeout
   * to account for temporary network issues. Set to 0 to disable retries.
   *
   * @minimum 0
   * @maximum 10
   * @default 3
   */
  retries: z.number().int().min(0).max(10).default(10),

  /**
   * Whether to reuse the same local port for retry attempts.
   *
   * When enabled, retry attempts will use the same local port as the
   * initial attempt. This can be useful for debugging specific port
   * issues but may prevent working around port-specific NAT problems.
   * When disabled, each retry uses a fresh port assignment.
   *
   * @default false
   */
  reusePort: z.boolean().default(false),
});

/**
 * Inferred TypeScript type from the Zod schema.
 *
 * Use this type for function parameters, return values, and variable
 * declarations when working with validated IP discovery options.
 */
export type IpDiscoveryOptions = z.infer<typeof IpDiscoveryOptions>;

/**
 * Service responsible for IP discovery operations for Discord Voice Gateway.
 *
 * This service implements Discord's IP discovery protocol, which uses UDP packets
 * to determine the external IP address and port that Discord's voice servers
 * can use to send voice data back to the client. This process is essential for
 * NAT traversal and proper voice communication setup.
 *
 * ## IP Discovery Process
 *
 * 1. **UDP Socket Creation**: Creates a UDP socket bound to a local address/port
 * 2. **Discovery Packet**: Sends a specially formatted packet to Discord's voice server
 * 3. **Response Processing**: Receives and parses the response containing external IP/port
 * 4. **NAT Traversal**: The process helps establish bidirectional UDP communication
 *
 * ## Network Requirements
 *
 * - **UDP Support**: Must be able to send/receive UDP packets
 * - **NAT Compatibility**: Works with most NAT configurations (including symmetric NAT)
 * - **Firewall Traversal**: May require firewall configuration for some restrictive setups
 * - **Port Availability**: Requires at least one available UDP port for binding
 *
 * ## Use Cases
 *
 * - **Voice Connection Setup**: Required before establishing voice data transmission
 * - **Network Diagnostics**: Can be used to test UDP connectivity to Discord servers
 * - **NAT Detection**: Helps identify the type of NAT being used
 * - **Connection Troubleshooting**: Useful for diagnosing voice connection issues
 *
 * ## Performance Characteristics
 *
 * - **Speed**: Typically completes in 50-500ms depending on network conditions
 * - **Reliability**: High success rate across various network configurations
 * - **Resource Usage**: Minimal CPU and memory overhead
 * - **Network Impact**: Single small UDP packet exchange
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 * @see {@link https://en.wikipedia.org/wiki/UDP_hole_punching} UDP Hole Punching
 */
export class IpDiscoveryService {
  /**
   * Currently active UDP socket for discovery operations.
   * Null when no discovery is in progress.
   * @internal
   */
  #socket: Socket | null = null;

  /**
   * Whether a discovery operation is currently in progress.
   * @internal
   */
  #discovering = false;

  /**
   * Gets whether a discovery operation is currently in progress.
   *
   * @returns True if discovery is active, false otherwise
   */
  get isDiscovering(): boolean {
    return this.#discovering;
  }

  /**
   * Performs IP discovery using Discord's voice server.
   *
   * This method implements Discord's IP discovery protocol by sending a UDP packet
   * to the specified voice server and parsing the response to extract the external
   * IP address and port. The process helps establish NAT traversal for voice communication.
   *
   * ## Discovery Protocol
   *
   * 1. **Packet Construction**: Creates a 74-byte UDP packet with:
   *    - Type field (2 bytes): 0x0001 for request
   *    - Length field (2 bytes): 70 (message length)
   *    - SSRC field (4 bytes): Voice connection identifier
   *    - Padding (66 bytes): Null bytes for alignment
   *
   * 2. **Transmission**: Sends the packet to Discord's voice server
   *
   * 3. **Response Parsing**: Parses the response packet containing:
   *    - Type field: 0x0002 for response
   *    - Length field: 70
   *    - SSRC field: Echo of original SSRC
   *    - IP Address (64 bytes): Null-terminated string
   *    - Port (2 bytes): Big-endian unsigned integer
   *
   * ## Error Handling
   *
   * The method handles various failure scenarios:
   * - **Network Errors**: Socket creation, binding, or transmission failures
   * - **Timeout Errors**: No response received within the specified timeout
   * - **Protocol Errors**: Invalid response format or unexpected data
   * - **NAT Issues**: Symmetric NAT or restrictive firewall configurations
   *
   * ## Retry Logic
   *
   * Failed discovery attempts can be automatically retried with:
   * - **Exponential Backoff**: Increasing timeout for each retry
   * - **Port Rotation**: Different local ports to work around port-specific issues
   * - **Fresh Sockets**: New socket creation for each retry to reset state
   *
   * @param serverIp - Discord voice server IP address
   * @param serverPort - Discord voice server port number
   * @param ssrc - Voice connection SSRC identifier
   * @param options - Optional configuration for discovery behavior
   * @returns Promise resolving to discovered IP and port information
   * @throws {Error} If discovery fails after all retry attempts or invalid parameters provided
   */
  async discover(
    serverIp: string,
    serverPort: number,
    ssrc: number,
    options: z.input<typeof IpDiscoveryOptions> = {},
  ): Promise<IpDiscoveryResult> {
    const parsedOptions = IpDiscoveryOptions.safeParse(options);
    if (!parsedOptions.success) {
      throw new Error(z.prettifyError(parsedOptions.error));
    }

    // Prevent concurrent discovery operations
    if (this.#discovering) {
      throw new Error(
        "IP discovery already in progress. Wait for the current operation to complete or call abort() first.",
      );
    }

    const {
      timeout = DEFAULT_DISCOVERY_TIMEOUT,
      retries = 3,
      reusePort = false,
    } = parsedOptions.data;

    this.#discovering = true;
    const startTime = Date.now();

    try {
      let lastError: Error | null = null;
      const currentLocalPort = parsedOptions.data.localPort;

      // Attempt discovery with retries
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await this.#performDiscovery(
            serverIp,
            serverPort,
            ssrc,
            {
              ...parsedOptions.data,
              timeout: timeout + attempt * 1000, // Increase timeout with each retry
              localPort: reusePort ? currentLocalPort : undefined,
            },
          );

          // Add timing information
          result.discoveryTime = Date.now() - startTime;

          return result;
        } catch (error) {
          lastError = error as Error;

          // Don't retry on certain types of errors
          if (this.#isNonRetryableError(error as Error)) {
            break;
          }

          // Clean up socket before retry
          this.#cleanupSocket();

          // Wait briefly before retry to avoid overwhelming the server
          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * (attempt + 1)),
            );
          }
        }
      }

      // All attempts failed
      throw new Error(
        `IP discovery failed after ${retries + 1} attempts. Last error: ${lastError?.message}`,
        { cause: lastError },
      );
    } finally {
      this.#discovering = false;
      this.#cleanupSocket();
    }
  }

  /**
   * Aborts any currently running IP discovery operation.
   *
   * This method immediately cancels any in-progress discovery operation and
   * cleans up associated resources. It's useful for implementing timeout logic
   * or cancelling discovery when it's no longer needed.
   *
   * If no discovery is currently running, this method has no effect and
   * completes immediately without error.
   *
   * ## Cleanup Actions
   *
   * - **Socket Closure**: Closes the active UDP socket
   * - **State Reset**: Resets the discovering flag
   * - **Resource Release**: Frees any allocated network resources
   * - **Event Cleanup**: Removes socket event listeners
   *
   * After calling abort(), the service returns to an idle state and can
   * be used for new discovery operations.
   */
  abort(): void {
    if (!this.#discovering) {
      return;
    }

    this.#discovering = false;
    this.#cleanupSocket();
  }

  /**
   * Tests UDP connectivity to a Discord voice server.
   *
   * This method performs a basic connectivity test to verify that UDP packets
   * can be sent to and received from the specified Discord voice server. It's
   * useful for diagnosing network issues before attempting full voice connection.
   *
   * The test performs a simplified version of IP discovery without parsing
   * the response details, focusing only on verifying bidirectional UDP communication.
   *
   * ## Test Process
   *
   * 1. **Socket Creation**: Creates a temporary UDP socket
   * 2. **Packet Transmission**: Sends a test packet to the server
   * 3. **Response Verification**: Confirms that a response is received
   * 4. **Timing Measurement**: Measures round-trip time
   *
   * ## Use Cases
   *
   * - **Pre-connection Testing**: Verify connectivity before voice setup
   * - **Network Diagnostics**: Troubleshoot voice connection issues
   * - **Performance Monitoring**: Measure network latency to voice servers
   * - **Firewall Detection**: Check for UDP blocking
   *
   * @param serverIp - Discord voice server IP address to test
   * @param serverPort - Discord voice server port number to test
   * @param timeout - Maximum time to wait for response in milliseconds
   * @returns Promise resolving to round-trip time in milliseconds
   * @throws {Error} If connectivity test fails or times out
   */
  async testConnectivity(
    serverIp: string,
    serverPort: number,
    timeout: number = DEFAULT_DISCOVERY_TIMEOUT,
  ): Promise<number> {
    const startTime = Date.now();

    try {
      // Use a dummy SSRC for connectivity testing
      await this.#performDiscovery(serverIp, serverPort, 0, {
        timeout,
        retries: 0,
        reusePort: true,
      });

      return Date.now() - startTime;
    } catch (error) {
      throw new Error(
        `UDP connectivity test failed: ${(error as Error).message}. This may indicate firewall blocking, network issues, or server unavailability.`,
        { cause: error },
      );
    }
  }

  /**
   * Gets information about the local network interface used for discovery.
   *
   * This method provides details about the local network configuration that
   * would be used for IP discovery operations. It's useful for network
   * diagnostics and understanding the local network environment.
   *
   * @param serverIp - Target server IP to determine the appropriate local interface
   * @returns Promise resolving to local network interface information
   * @throws {Error} If local interface cannot be determined
   */
  async getLocalNetworkInfo(serverIp: string): Promise<{
    localIp: string;
    interfaceName: string;
    isPrivate: boolean;
  }> {
    try {
      // Create a temporary socket to determine the local interface
      const socket = createSocket("udp4");

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.close();
          reject(new Error("Timeout determining local network interface"));
        }, DEFAULT_DISCOVERY_TIMEOUT);

        socket.on("error", (error) => {
          clearTimeout(timeout);
          socket.close();
          reject(
            new Error(
              `Failed to determine local network interface: ${error.message}`,
            ),
          );
        });

        // Connect to the server to determine local interface
        socket.connect(80, serverIp, () => {
          clearTimeout(timeout);

          const address = socket.address();
          const localIp = address.address;

          socket.close();

          resolve({
            localIp,
            interfaceName: "auto-detected",
            isPrivate: this.#isPrivateIp(localIp),
          });
        });
      });
    } catch (error) {
      throw new Error(
        `Failed to get local network info: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Performs the actual IP discovery operation.
   *
   * @param serverIp - Discord voice server IP
   * @param serverPort - Discord voice server port
   * @param ssrc - Voice connection SSRC
   * @param options - Discovery options
   * @returns Promise resolving to discovery result
   * @throws {Error} If discovery fails
   * @internal
   */
  async #performDiscovery(
    serverIp: string,
    serverPort: number,
    ssrc: number,
    options: IpDiscoveryOptions,
  ): Promise<IpDiscoveryResult> {
    const { timeout = DEFAULT_DISCOVERY_TIMEOUT } = options;

    // Create and configure socket
    const socket = await this.#createSocket(options);
    this.#socket = socket;

    try {
      // Create discovery packet
      const packet = this.#createDiscoveryPacket(ssrc);

      // Send packet and wait for response
      const response = await this.#sendAndReceivePacket(
        socket,
        packet,
        serverIp,
        serverPort,
        timeout,
      );

      // Parse response
      return this.#parseDiscoveryResponse(response, socket);
    } finally {
      this.#cleanupSocket();
    }
  }

  /**
   * Creates and configures a UDP socket for discovery.
   *
   * @param options - Socket configuration options
   * @returns Promise resolving to configured socket
   * @throws {Error} If socket creation fails
   * @internal
   */
  async #createSocket(options: IpDiscoveryOptions): Promise<Socket> {
    const socket = createSocket("udp4");
    const bindAsync = promisify(socket.bind.bind(socket));

    try {
      // Bind socket to local address/port
      // @ts-expect-error - TypeScript doesn't recognize localIp/localPort as valid options
      await bindAsync(options.localPort, options.localIp);

      // Configure socket options
      try {
        socket.setRecvBufferSize(1024);
        socket.setSendBufferSize(1024);
      } catch {
        // Ignore errors setting buffer sizes, not critical
      }

      return socket;
    } catch (error) {
      socket.close();
      throw new Error(
        `Failed to create UDP socket: ${(error as Error).message}. This may indicate port conflicts or network interface issues.`,
        { cause: error },
      );
    }
  }

  /**
   * Creates an IP discovery packet according to Discord's protocol.
   *
   * @param ssrc - Voice connection SSRC
   * @returns Discovery packet buffer
   * @internal
   */
  #createDiscoveryPacket(ssrc: number): Buffer {
    const packet = Buffer.alloc(IP_DISCOVERY_PACKET.PACKET_SIZE);
    let offset = 0;

    // Type field (2 bytes, big endian)
    packet.writeUInt16BE(IP_DISCOVERY_PACKET.REQUEST_TYPE, offset);
    offset += 2;

    // Length field (2 bytes, big endian)
    packet.writeUInt16BE(IP_DISCOVERY_PACKET.MESSAGE_LENGTH, offset);
    offset += 2;

    // SSRC field (4 bytes, big endian)
    packet.writeUInt32BE(ssrc >>> 0, offset); // Ensure unsigned
    offset += 4;

    // Padding (remaining bytes are zero-initialized by Buffer.alloc)

    return packet;
  }

  /**
   * Sends discovery packet and waits for response.
   *
   * @param socket - UDP socket to use
   * @param packet - Discovery packet to send
   * @param serverIp - Target server IP
   * @param serverPort - Target server port
   * @param timeout - Response timeout in milliseconds
   * @returns Promise resolving to response buffer
   * @throws {Error} If send/receive fails or times out
   * @internal
   */
  async #sendAndReceivePacket(
    socket: Socket,
    packet: Buffer,
    serverIp: string,
    serverPort: number,
    timeout: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let responseReceived = false;

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (!responseReceived) {
          responseReceived = true;
          reject(
            new Error(
              `IP discovery timed out after ${timeout}ms. This may indicate network issues, firewall blocking, or server unavailability.`,
            ),
          );
        }
      }, timeout);

      // Set up response handler
      const onMessage = (msg: Buffer, _rinfo: any) => {
        if (!responseReceived) {
          responseReceived = true;
          clearTimeout(timeoutId);
          resolve(msg);
        }
      };

      // Set up error handler
      const onError = (error: Error) => {
        if (!responseReceived) {
          responseReceived = true;
          clearTimeout(timeoutId);
          reject(
            new Error(`Socket error during IP discovery: ${error.message}`, {
              cause: error,
            }),
          );
        }
      };

      // Attach event listeners
      socket.once("message", onMessage);
      socket.once("error", onError);

      // Send discovery packet
      socket.send(packet, serverPort, serverIp, (error) => {
        if (error && !responseReceived) {
          responseReceived = true;
          clearTimeout(timeoutId);
          socket.removeListener("message", onMessage);
          socket.removeListener("error", onError);
          reject(
            new Error(`Failed to send discovery packet: ${error.message}`, {
              cause: error,
            }),
          );
        }
      });
    });
  }

  /**
   * Parses IP discovery response packet.
   *
   * @param response - Response packet buffer
   * @param socket - Socket used for discovery (to get local info)
   * @returns Parsed discovery result
   * @throws {Error} If response format is invalid
   * @internal
   */
  #parseDiscoveryResponse(response: Buffer, socket: Socket): IpDiscoveryResult {
    // Validate response size
    if (response.length < IP_DISCOVERY_PACKET.PACKET_SIZE) {
      throw new Error(
        `Invalid response size: expected ${IP_DISCOVERY_PACKET.PACKET_SIZE} bytes, got ${response.length}`,
      );
    }

    let offset = 0;

    // Parse type field
    const responseType = response.readUInt16BE(offset);
    offset += 2;

    if (responseType !== IP_DISCOVERY_PACKET.RESPONSE_TYPE) {
      throw new Error(
        `Invalid response type: expected ${IP_DISCOVERY_PACKET.RESPONSE_TYPE}, got ${responseType}`,
      );
    }

    // Parse length field
    const messageLength = response.readUInt16BE(offset);
    offset += 2;

    if (messageLength !== IP_DISCOVERY_PACKET.MESSAGE_LENGTH) {
      throw new Error(
        `Invalid message length: expected ${IP_DISCOVERY_PACKET.MESSAGE_LENGTH}, got ${messageLength}`,
      );
    }

    // Skip SSRC field (4 bytes)
    offset += 4;

    // Parse IP address (null-terminated string)
    const ipBytes = response.subarray(
      offset,
      offset + IP_DISCOVERY_PACKET.ADDRESS_SIZE,
    );
    const nullIndex = ipBytes.indexOf(0);
    const ip = ipBytes
      .subarray(0, nullIndex > -1 ? nullIndex : ipBytes.length)
      .toString("utf8");
    offset += IP_DISCOVERY_PACKET.ADDRESS_SIZE;

    // Parse port (2 bytes, big endian)
    const port = response.readUInt16BE(offset);

    // Validate parsed data
    if (!ip) {
      throw new Error("Response contains empty IP address");
    }

    if (port === 0) {
      throw new Error("Response contains invalid port (0)");
    }

    // Get local socket information
    const localAddress = socket.address();

    return {
      ip,
      port,
      localIp: localAddress.address,
      localPort: localAddress.port,
      discoveryTime: 0, // Will be set by caller
    };
  }

  /**
   * Determines if an error should not trigger retry attempts.
   *
   * @param error - Error to check
   * @returns True if error is non-retryable
   * @internal
   */
  #isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Configuration errors that won't be fixed by retrying
    const nonRetryableMessages = [
      "invalid",
      "must be",
      "parameter",
      "address in use",
      "permission denied",
    ];

    return nonRetryableMessages.some((msg) => message.includes(msg));
  }

  /**
   * Checks if an IP address is in private address space.
   *
   * @param ip - IP address to check
   * @returns True if IP is private
   * @internal
   */
  #isPrivateIp(ip: string): boolean {
    const parts = ip.split(".").map(Number);

    if (
      parts.length !== 4 ||
      parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)
    ) {
      return false;
    }

    const [a, b] = parts as [number, number];

    // Private address ranges (RFC 1918)
    return (
      a === 10 || // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) // 192.168.0.0/16
    );
  }

  /**
   * Cleans up the current socket and associated resources.
   *
   * @internal
   */
  #cleanupSocket(): void {
    if (!this.#socket) {
      return;
    }

    const socket = this.#socket;
    this.#socket = null;

    try {
      // Remove all listeners to prevent memory leaks
      socket.removeAllListeners();

      // Close the socket
      socket.close();
    } catch {
      // Ignore cleanup errors
    }
  }
}
