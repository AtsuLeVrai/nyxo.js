import { type Socket, createSocket } from "node:dgram";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { VoiceOperationHandler } from "../handlers/index.js";
import { VoiceHeartbeatManager } from "../managers/index.js";
import {
  AudioOptions,
  DaveProtocolService,
  IpDiscoveryOptions,
  IpDiscoveryService,
  VoiceAudioService,
  VoiceEncryptionMode,
  VoiceEncryptionService,
} from "../services/index.js";
import {
  type E2eeFrame,
  type VoiceConnectionEvents,
  VoiceConnectionState,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceSendEvents,
  type VoiceServerInfo,
  type VoiceSessionDescriptionData,
  VoiceSpeakingFlags,
  type VoiceUdpConfig,
} from "../types/index.js";

interface VoiceUser {
  speaking: number;
  ssrc: number;
  delay: number;
}

export const VoiceConnectionOptions = z
  .object({
    ...AudioOptions.unwrap().shape,
    ...IpDiscoveryOptions.unwrap().shape,
  })
  .readonly();

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;

export class VoiceConnection extends EventEmitter<VoiceConnectionEvents> {
  readonly heartbeat: VoiceHeartbeatManager;
  readonly audio: VoiceAudioService;
  readonly encryption: VoiceEncryptionService;
  dave: DaveProtocolService | null = null;
  readonly #operationHandler: VoiceOperationHandler;
  #ipDiscovery: IpDiscoveryService | null = null;

  #ws: WebSocket | null = null;
  #udp: Socket | null = null;
  #state = VoiceConnectionState.Disconnected;
  #ssrc = 0;
  #mode: VoiceEncryptionMode = VoiceEncryptionMode.AeadXchacha20Poly1305;
  #sequence = 0;
  #timestamp = 0;
  #speaking = false;
  #sessionId: string | null = null;
  #token: string | null = null;
  #endpoint: string | null = null;
  #udpConfig: VoiceUdpConfig | null = null;
  #serverInfo: VoiceServerInfo | null = null;
  #connectStartTime = 0;
  #users = new Map<string, VoiceUser>();

  readonly #options: VoiceConnectionOptions;

  constructor(options: z.input<typeof VoiceConnectionOptions> = {}) {
    super();

    try {
      this.#options = VoiceConnectionOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.heartbeat = new VoiceHeartbeatManager(this);
    this.audio = new VoiceAudioService(this.#options);
    this.encryption = new VoiceEncryptionService();
    this.#operationHandler = new VoiceOperationHandler(this);
  }

  get state(): VoiceConnectionState {
    return this.#state;
  }

  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  get connectStartTime(): number {
    return this.#connectStartTime;
  }

  get webSocket(): WebSocket | null {
    return this.#ws;
  }

  get sequence(): number {
    return this.#sequence;
  }

  get speaking(): boolean {
    return this.#speaking;
  }

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get ssrc(): number {
    return this.#ssrc;
  }

  get serverInfo(): VoiceServerInfo | null {
    return this.#serverInfo;
  }

  setState(state: VoiceConnectionState): void {
    this.#state = state;
    this.emit("stateChange", state);
  }

  setSessionId(sessionId: string): void {
    this.#sessionId = sessionId;
  }

  setServerInfo(info: VoiceServerInfo): void {
    this.#serverInfo = info;
    this.#token = info.token;
    this.#endpoint = info.endpoint;
    this.#sessionId = info.session_id;
    this.emit("debug", `Received voice server info ${JSON.stringify(info)}`);
  }

  setSsrc(ssrc: number): void {
    this.#ssrc = ssrc;
  }

  setUdpInfo(config: VoiceUdpConfig): void {
    this.#udpConfig = config;
  }

  setUserSpeaking(
    userId: string,
    data: { speaking: number; ssrc: number; delay: number },
  ): void {
    this.#users.set(userId, data);
  }

  setSessionInfo(data: VoiceSessionDescriptionData): void {
    this.#mode = data.mode;
    this.encryption.initialize(Buffer.from(data.secret_key), this.#mode);

    if (data.dave_protocol_version !== undefined) {
      this.dave = new DaveProtocolService(this);
      this.dave.initialize(data.dave_protocol_version);
    }
  }

  cleanupUser(userId: string): void {
    this.#users.delete(userId);
  }

  async connect(): Promise<void> {
    try {
      if (!(this.#endpoint && this.#token)) {
        throw new Error("No voice endpoint or token available");
      }

      this.setState(VoiceConnectionState.Connecting);
      this.#connectStartTime = Date.now();

      await this.#initializeWebSocket();
    } catch (error) {
      this.setState(VoiceConnectionState.Disconnected);
      throw new Error("Failed to connect to voice server", { cause: error });
    }
  }

  async initializeUdp(): Promise<void> {
    if (!this.#udpConfig) {
      throw new Error("No UDP configuration available");
    }

    this.#udp = createSocket("udp4");

    this.#ipDiscovery = new IpDiscoveryService(this, this.#udp, this.#options);

    this.#udp.on("error", (error) => {
      this.emit("error", error);
    });

    this.#udp.on("message", (message) => {
      this.#handleUdpMessage(message);
    });

    await this.#performIpDiscovery();
  }

  canResume(): boolean {
    return Boolean(
      this.#sessionId &&
        this.#token &&
        this.state !== VoiceConnectionState.Disconnected,
    );
  }

  send<T extends keyof VoiceSendEvents>(
    opcode: T,
    data: VoiceSendEvents[T],
  ): void {
    if (!this.isConnectionValid()) {
      throw new Error("Voice WebSocket connection is not open");
    }

    const payload: VoicePayloadEntity = {
      op: opcode,
      d: data,
    };

    this.#ws?.send(JSON.stringify(payload));
  }

  sendAudioPacket(buffer: Buffer): void {
    if (!(this.#udp && this.#udpConfig)) {
      throw new Error("UDP connection not initialized");
    }

    let packet = this.#createAudioPacket(buffer);

    if (this.dave) {
      const e2eeFrame = this.dave.encryptFrame(buffer);
      packet = this.#createE2eePacket(e2eeFrame);
    }

    const encrypted = this.encryption.encryptPacket(packet, this.#sequence);

    this.#udp.send(
      encrypted,
      this.#udpConfig.port,
      this.#udpConfig.ip,
      (error) => {
        if (error) {
          this.emit(
            "error",
            new Error("Failed to send audio packet", { cause: error }),
          );
        }
      },
    );

    this.#sequence++;
  }

  setSpeaking(speaking: boolean, flags = VoiceSpeakingFlags.Microphone): void {
    if (!this.isConnectionValid()) {
      throw new Error("Voice WebSocket connection is not open");
    }

    this.#speaking = speaking;
    this.send(VoiceOpcodes.Speaking, {
      speaking: speaking ? flags : 0,
      delay: 0,
      ssrc: this.#ssrc,
    });
  }

  isConnectionValid(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  destroy(code = 1000): void {
    this.emit("debug", `Destroying voice connection with code ${code}`);

    try {
      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws.close(code);
        this.#ws = null;
      }

      if (this.#udp) {
        this.#udp.close();
        this.#udp = null;
      }

      this.#cleanup();
      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy voice connection", { cause: error });
    }
  }

  stopSpeaking(): void {
    for (let i = 0; i < 5; i++) {
      this.sendAudioPacket(Buffer.from([0xf8, 0xff, 0xfe]));
    }
    this.setSpeaking(false);
  }

  #createE2eePacket(frame: E2eeFrame): Buffer {
    const bufferSize =
      frame.opusFrame.length +
      frame.authTag.length +
      4 + // nonce size
      1 + // unencrypted ranges size
      2; // magic marker

    const packet = Buffer.alloc(bufferSize);
    let offset = 0;

    frame.opusFrame.copy(packet, offset);
    offset += frame.opusFrame.length;

    frame.authTag.copy(packet, offset);
    offset += frame.authTag.length;

    packet.writeUInt32BE(frame.nonce, offset);
    offset += 4;

    packet.writeUInt8(0, offset);
    offset += 1;

    packet.writeUInt16BE(0xfafa, offset);

    return packet;
  }

  async #initializeWebSocket(): Promise<void> {
    if (!this.#endpoint) {
      return;
    }

    const wsUrl = `wss://${this.#endpoint}?v=8`;
    const ws = new WebSocket(wsUrl);
    this.#ws = ws;

    ws.on("message", this.#handleMessage.bind(this));
    ws.on("close", (code, reason) =>
      this.#operationHandler.handleClose(code, reason.toString()),
    );
    ws.on("error", (error) => this.emit("error", error));

    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => {
        this.emit("debug", `Voice WebSocket connected to ${wsUrl}`);
        resolve();
      });
      ws.once("error", reject);
    });
  }

  async #performIpDiscovery(): Promise<void> {
    if (!(this.#udp && this.#udpConfig && this.#ipDiscovery)) {
      throw new Error("UDP not initialized");
    }

    try {
      const { ip, port } = await this.#ipDiscovery.discover(
        this.#ssrc,
        this.#udpConfig.ip,
        this.#udpConfig.port,
      );

      this.send(VoiceOpcodes.SelectProtocol, {
        protocol: "udp",
        data: {
          address: ip,
          port,
          mode: this.#mode,
        },
      });
    } catch (error) {
      throw new Error("IP Discovery failed", { cause: error });
    }
  }

  #createAudioPacket(opusPacket: Buffer): Buffer {
    const packetBuffer = Buffer.alloc(12 + opusPacket.length);

    packetBuffer[0] = 0x80;
    packetBuffer[1] = 0x78;
    packetBuffer.writeUInt16BE(this.#sequence, 2);
    packetBuffer.writeUInt32BE(this.#timestamp, 4);
    packetBuffer.writeUInt32BE(this.#ssrc, 8);

    opusPacket.copy(packetBuffer, 12);
    return packetBuffer;
  }

  #handleMessage(data: Buffer | string): void {
    let payload: VoicePayloadEntity;

    try {
      payload = Buffer.isBuffer(data) ? JSON.parse(data.toString()) : data;
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to parse voice payload", { cause: error }),
      );
      return;
    }

    this.#operationHandler.handlePayload(payload);
  }

  #handleUdpMessage(message: Buffer): void {
    if (message.length === 74) {
      const ipBuffer = message.subarray(8, 72);
      const ip = ipBuffer.toString().split("\0")[0];
      if (!ip) {
        throw new Error("Failed to parse IP from UDP packet");
      }

      const port = message.readUInt16BE(72);

      this.send(VoiceOpcodes.SelectProtocol, {
        protocol: "udp",
        data: {
          address: ip,
          port,
          mode: this.#mode,
        },
      });
    }
  }

  #cleanup(): void {
    this.#state = VoiceConnectionState.Disconnected;
    this.#sessionId = null;
    this.#token = null;
    this.#endpoint = null;
    this.#ssrc = 0;
    this.#sequence = 0;
    this.#timestamp = 0;
    this.#speaking = false;
    this.#udpConfig = null;
    this.#users.clear();
    this.heartbeat.destroy();
    this.encryption.destroy();
    if (this.#ipDiscovery) {
      this.#ipDiscovery.cancel();
    }
    if (this.dave) {
      this.dave.destroy();
    }
  }
}
