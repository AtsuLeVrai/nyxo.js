import type dgram from "node:dgram";
import { type IPDiscoveryPacket, IPDiscoveryType } from "../types/index.js";

export const IPDiscoveryUtil = {
  PACKET_SIZE: 74,
  ADDRESS_SIZE: 64,
  REQUEST_TYPE: IPDiscoveryType.Request,
  RESPONSE_TYPE: IPDiscoveryType.Response,
  DEFAULT_LENGTH: 70,

  createDiscoveryPacket(ssrc: number): Buffer {
    const buffer = Buffer.alloc(IPDiscoveryUtil.PACKET_SIZE);

    // Write type (0x1 for request)
    buffer.writeUInt16BE(IPDiscoveryUtil.REQUEST_TYPE, 0);

    // Write length (70)
    buffer.writeUInt16BE(IPDiscoveryUtil.DEFAULT_LENGTH, 2);

    // Write SSRC
    buffer.writeUInt32BE(ssrc, 4);

    // Rest remains as zeros (address and port)

    return buffer;
  },

  parseDiscoveryPacket(buffer: Buffer): IPDiscoveryPacket {
    if (buffer.length < IPDiscoveryUtil.PACKET_SIZE) {
      throw new Error(`IP discovery packet too small: ${buffer.length} bytes`);
    }

    const type = buffer.readUInt16BE(0) as IPDiscoveryType;
    const length = buffer.readUInt16BE(2);
    const ssrc = buffer.readUInt32BE(4);

    // Read null-terminated address string
    const addressBytes = buffer.subarray(8, 8 + IPDiscoveryUtil.ADDRESS_SIZE);
    const nullTerminatorIndex = addressBytes.indexOf(0);
    const addressLength =
      nullTerminatorIndex >= 0
        ? nullTerminatorIndex
        : IPDiscoveryUtil.ADDRESS_SIZE;
    const address = addressBytes.toString("utf8", 0, addressLength);

    // Read port (last 2 bytes)
    const port = buffer.readUInt16BE(8 + IPDiscoveryUtil.ADDRESS_SIZE);

    return { type, length, ssrc, address, port };
  },

  createResponsePacket(ssrc: number, address: string, port: number): Buffer {
    const buffer = Buffer.alloc(IPDiscoveryUtil.PACKET_SIZE);

    // Write type (0x2 for response)
    buffer.writeUInt16BE(IPDiscoveryUtil.RESPONSE_TYPE, 0);

    // Write length (70)
    buffer.writeUInt16BE(IPDiscoveryUtil.DEFAULT_LENGTH, 2);

    // Write SSRC
    buffer.writeUInt32BE(ssrc, 4);

    // Write address (null-terminated string)
    buffer.write(address, 8, "utf8");

    // Write port
    buffer.writeUInt16BE(port, 8 + IPDiscoveryUtil.ADDRESS_SIZE);

    return buffer;
  },

  async discoverIP(
    udpSocket: dgram.Socket,
    serverAddress: string,
    serverPort: number,
    ssrc: number,
  ): Promise<IPDiscoveryPacket> {
    return new Promise((resolve, reject) => {
      const packet = IPDiscoveryUtil.createDiscoveryPacket(ssrc);

      const messageHandler = (msg: Buffer) => {
        try {
          const response = IPDiscoveryUtil.parseDiscoveryPacket(msg);

          if (
            response.type === IPDiscoveryUtil.RESPONSE_TYPE &&
            response.ssrc === ssrc
          ) {
            // Cleanup and resolve
            udpSocket.removeListener("message", messageHandler);
            resolve(response);
          }
        } catch (_error) {
          // Ignore malformed packets
        }
      };

      const errorHandler = (error: Error) => {
        udpSocket.removeListener("message", messageHandler);
        reject(error);
      };

      // Set up timeout
      const timeout = setTimeout(() => {
        udpSocket.removeListener("message", messageHandler);
        udpSocket.removeListener("error", errorHandler);
        reject(new Error("IP discovery timed out"));
      }, 10000); // 10 seconds timeout

      // Set up handlers
      udpSocket.on("message", messageHandler);
      udpSocket.on("error", errorHandler);

      // Send discovery packet
      udpSocket.send(packet, serverPort, serverAddress, (error) => {
        if (error) {
          clearTimeout(timeout);
          udpSocket.removeListener("message", messageHandler);
          udpSocket.removeListener("error", errorHandler);
          reject(error);
        }
      });
    });
  },
} as const;
