import dgram from "node:dgram";
import { IPDiscoveryUtil, NACKUtil, RTPPacketUtil } from "../utils/index.js";

export class UDPManager {
  #socket: dgram.Socket | null = null;
  #bound = false;
  #connecting = false;
  #externalIp: string | null = null;
  #externalPort: number | null = null;
  #serverAddress: string | null = null;
  #serverPort: number | null = null;
  #ssrc: number | null = null;
  #nackTracker = NACKUtil.createNACKTracker();
  #outgoingSequenceNumbers = new Map<number, Buffer>();
  #keepAliveInterval: NodeJS.Timeout | null = null;

  get isReady(): boolean {
    return (
      this.#bound && this.#externalIp !== null && this.#externalPort !== null
    );
  }

  get localAddress(): string | null {
    return this.#socket?.address().address || null;
  }

  get localPort(): number | null {
    return this.#socket?.address().port || null;
  }

  get discoveredIp(): string | null {
    return this.#externalIp;
  }

  get discoveredPort(): number | null {
    return this.#externalPort;
  }

  async connect(
    serverAddress: string,
    serverPort: number,
    ssrc: number,
  ): Promise<{ ip: string; port: number }> {
    if (this.#connecting || !this.#externalIp || !this.#externalPort) {
      throw new Error("UDP connection already in progress");
    }

    if (this.isReady) {
      return {
        ip: this.#externalIp,
        port: this.#externalPort,
      };
    }

    this.#connecting = true;

    try {
      // Store server info
      this.#serverAddress = serverAddress;
      this.#serverPort = serverPort;
      this.#ssrc = ssrc;

      // Create UDP socket if needed
      if (!this.#socket) {
        await this.createSocket();
      }

      // Perform IP discovery
      const discoveryResult = await IPDiscoveryUtil.discoverIP(
        this.#socket as dgram.Socket,
        serverAddress,
        serverPort,
        ssrc,
      );

      // Store discovered IP and port
      this.#externalIp = discoveryResult.address;
      this.#externalPort = discoveryResult.port;

      // Start keep-alive
      this.#startKeepAlive();

      return {
        ip: this.#externalIp,
        port: this.#externalPort,
      };
    } finally {
      this.#connecting = false;
    }
  }

  async createSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.#socket) {
          this.#socket.removeAllListeners();
          this.#socket.close();
        }

        // Create new UDP socket
        this.#socket = dgram.createSocket("udp4");

        // Set up event handlers
        this.#socket.on("error", (error) => {
          throw error;
        });

        this.#socket.on("message", (message, rinfo) => {
          this.#handleIncomingPacket(message, rinfo);
        });

        this.#socket.on("listening", () => {
          this.#bound = true;
          resolve();
        });

        this.#socket.on("close", () => {
          this.#bound = false;
        });

        // Bind the socket
        this.#socket.bind();
      } catch (error) {
        reject(error);
      }
    });
  }

  close(): void {
    if (this.#keepAliveInterval) {
      clearInterval(this.#keepAliveInterval);
      this.#keepAliveInterval = null;
    }

    if (this.#socket) {
      this.#socket.removeAllListeners();
      this.#socket.close();
      this.#socket = null;
    }

    this.#bound = false;
    this.#connecting = false;
    this.#externalIp = null;
    this.#externalPort = null;
    this.#serverAddress = null;
    this.#serverPort = null;
    this.#ssrc = null;

    this.#outgoingSequenceNumbers.clear();
  }

  send(data: Buffer): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (
        !(
          this.#socket &&
          this.#bound &&
          this.#serverAddress &&
          this.#serverPort
        )
      ) {
        return reject(new Error("Cannot send: UDP socket not ready"));
      }

      this.#socket.send(
        data,
        this.#serverPort,
        this.#serverAddress,
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }

  async sendPacket(packet: Buffer, sequence?: number): Promise<void> {
    await this.send(packet);

    // Store packet for potential retransmission
    if (sequence !== undefined) {
      this.#outgoingSequenceNumbers.set(sequence, packet);

      // Clean up old packets (keep last 100)
      if (this.#outgoingSequenceNumbers.size > 100) {
        const keys = Array.from(this.#outgoingSequenceNumbers.keys()).sort(
          (a, b) => a - b,
        );
        for (let i = 0; i < keys.length - 100; i++) {
          this.#outgoingSequenceNumbers.delete(keys[i] as number);
        }
      }
    }
  }

  destroy(): void {
    this.close();
  }

  #handleIncomingPacket(data: Buffer, _rinfo: dgram.RemoteInfo): void {
    // Handle different packet types
    if (data.length >= 12 && data[0] === RTPPacketUtil.VERSION) {
      // Looks like an RTP packet
      this.#handleRTPPacket(data);
    } else if (
      data.length >= 8 &&
      (data[1] === NACKUtil.RTCP_NACK_PT ||
        data.readUInt16BE(0) === IPDiscoveryUtil.RESPONSE_TYPE)
    ) {
      // Could be a RTCP NACK or IP discovery response
      if (data[1] === NACKUtil.RTCP_NACK_PT) {
        this.#handleNACKPacket(data);
      } else {
        this.#handleIPDiscoveryPacket(data);
      }
    }
  }

  #handleRTPPacket(data: Buffer): void {
    const header = RTPPacketUtil.parseHeader(data);

    if (!RTPPacketUtil.validateHeader(header)) {
      return;
    }

    // Extract the payload data
    const _payloadData = data.subarray(RTPPacketUtil.HEADER_SIZE);

    // Update NACK tracker
    NACKUtil.updateNACKTracker(this.#nackTracker, header.sequence);
  }

  #handleNACKPacket(data: Buffer): void {
    const { sequences } = NACKUtil.processNACKPacket(data);

    // Retransmit missing packets
    for (const sequence of sequences) {
      const packet = this.#outgoingSequenceNumbers.get(sequence);
      if (packet) {
        this.send(packet);
      }
    }
  }

  #handleIPDiscoveryPacket(data: Buffer): void {
    const packet = IPDiscoveryUtil.parseDiscoveryPacket(data);

    // Update external IP and port if needed
    if (
      packet.type === IPDiscoveryUtil.RESPONSE_TYPE &&
      packet.ssrc === this.#ssrc
    ) {
      this.#externalIp = packet.address;
      this.#externalPort = packet.port;
    }
  }

  #startKeepAlive(): void {
    if (this.#keepAliveInterval) {
      clearInterval(this.#keepAliveInterval);
    }

    // Send a keep-alive packet every 5 seconds to maintain NAT mappings
    this.#keepAliveInterval = setInterval(() => {
      if (
        this.#socket &&
        this.#bound &&
        this.#serverAddress &&
        this.#serverPort &&
        this.#ssrc
      ) {
        const keepAlivePacket = IPDiscoveryUtil.createDiscoveryPacket(
          this.#ssrc,
        );

        this.#socket.send(
          keepAlivePacket,
          this.#serverPort,
          this.#serverAddress,
        );
      }
    }, 5000);
  }
}
