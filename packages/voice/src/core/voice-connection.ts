import { type Socket, createSocket } from "node:dgram";
import { Snowflake } from "@nyxjs/core";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { VoiceHeartbeatManager } from "../managers/index.js";
import {
  AudioOptions,
  IpDiscoveryOptions,
  IpDiscoveryService,
  VoiceAudioService,
  VoiceEncryptionService,
} from "../services/index.js";
import {
  type VoiceConnectionEvents,
  VoiceEncryptionMode,
  VoiceGatewayOpcodes,
  VoiceGatewayVersion,
  type VoiceHeartbeatAckPayload,
  type VoiceHelloPayload,
  type VoiceIdentifyPayload,
  type VoicePayload,
  type VoiceReadyPayload,
  type VoiceResumePayload,
  type VoiceSendEvents,
  type VoiceSessionDescriptionPayload,
  VoiceSpeakingFlags,
  type VoiceSpeakingPayload,
} from "../types/index.js";

const NON_RESUMABLE_CODES = [4004, 4006, 4011, 4012, 4014, 4015, 4016];

export const VoiceConnectionOptions = z
  .object({
    endpoint: z.string(),
    token: z.string(),
    sessionId: z.string(),
    guildId: Snowflake,
    userId: Snowflake,
    version: z.nativeEnum(VoiceGatewayVersion).default(VoiceGatewayVersion.V8),
    ...AudioOptions.unwrap().shape,
    ...IpDiscoveryOptions.unwrap().shape,
  })
  .readonly();

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;

export class VoiceConnection extends EventEmitter<VoiceConnectionEvents> {
  readonly heartbeat: VoiceHeartbeatManager;
  readonly audio: VoiceAudioService;
  readonly encryption: VoiceEncryptionService;
  readonly #options: VoiceConnectionOptions;

  #ipDiscovery: IpDiscoveryService | null = null;
  #ws: WebSocket | null = null;
  #udp: Socket | null = null;
  #ssrc = 0;
  #mode: VoiceEncryptionMode = VoiceEncryptionMode.AeadAes256GcmRtpSize;
  #sequence = 0;
  #timestamp = 0;
  #hasValidSession = false;
  #udpIp: string | null = null;
  #udpPort: number | null = null;

  constructor(options: z.input<typeof VoiceConnectionOptions>) {
    super();

    try {
      this.#options = VoiceConnectionOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.heartbeat = new VoiceHeartbeatManager(this);
    this.audio = new VoiceAudioService(this.#options);
    this.encryption = new VoiceEncryptionService();
  }

  get sequence(): number {
    return this.#sequence;
  }

  get sessionId(): string {
    return this.#options.sessionId;
  }

  get ssrc(): number {
    return this.#ssrc;
  }

  get hasValidSession(): boolean {
    return this.#hasValidSession;
  }

  get udpIp(): string | null {
    return this.#udpIp;
  }

  get udpPort(): number | null {
    return this.#udpPort;
  }

  get mode(): VoiceEncryptionMode {
    return this.#mode;
  }

  async connect(): Promise<void> {
    try {
      const wsUrl = `wss://${this.#options.endpoint}?v=${this.#options.version}`;
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      ws.on("message", (data) => {
        try {
          const payload: VoicePayload = JSON.parse(data.toString());
          this.#handlePayload(payload);
        } catch (error) {
          this.emit(
            "error",
            new Error("Failed to parse voice payload", { cause: error }),
          );
        }
      });

      ws.on("error", (error) => this.emit("error", error));
      ws.on("close", (code, reason) =>
        this.#handleWebSocketClose(code, reason.toString()),
      );

      return new Promise((resolve, reject) => {
        ws.once("open", resolve);
        ws.once("error", reject);
      });
    } catch (error) {
      throw new Error("Failed to connect to voice server", { cause: error });
    }
  }

  async initializeUdp(ip: string, port: number): Promise<void> {
    this.#udp = createSocket("udp4");
    this.#ipDiscovery = new IpDiscoveryService(this, this.#udp, this.#options);

    try {
      const discoveredInfo = await this.#ipDiscovery?.discover(
        this.#ssrc,
        ip,
        port,
      );

      this.#udpIp = ip;
      this.#udpPort = port;

      this.send(VoiceGatewayOpcodes.SelectProtocol, {
        protocol: "udp",
        data: {
          address: discoveredInfo.ip,
          port: discoveredInfo.port,
          mode: this.#mode,
        },
      });
    } catch (error) {
      throw new Error("UDP initialization failed", { cause: error });
    }
  }

  canResume(): boolean {
    return Boolean(
      this.#hasValidSession &&
        this.#ws?.readyState === WebSocket.OPEN &&
        this.#options.guildId &&
        this.#options.sessionId &&
        this.#options.token,
    );
  }

  send<T extends keyof VoiceSendEvents>(
    opcode: T,
    data: VoiceSendEvents[T],
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Voice WebSocket connection is not open");
    }

    const payload: VoicePayload = {
      op: opcode,
      d: data,
    };

    this.#ws.send(JSON.stringify(payload));
  }

  sendAudioPacket(opusPacket: Buffer): void {
    if (!this.#udp) {
      throw new Error("UDP connection not initialized");
    }

    if (!(this.#udpIp && this.#udpPort)) {
      throw new Error("UDP destination not set");
    }

    const packet = this.#createAudioPacket(opusPacket);
    const encrypted = this.encryption.encryptPacket(packet, this.#sequence);

    this.#udp.send(encrypted, this.#udpPort, this.#udpIp, (error) => {
      if (error) {
        this.emit(
          "error",
          new Error("Failed to send audio packet", { cause: error }),
        );
      }
    });

    this.#sequence++;
    this.#timestamp += this.#options.frameSize;
  }

  setSpeaking(speaking: boolean, flags = VoiceSpeakingFlags.Microphone): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("Voice WebSocket connection is not open");
    }

    this.send(VoiceGatewayOpcodes.Speaking, {
      speaking: speaking ? flags : 0,
      delay: 0,
      ssrc: this.#ssrc,
    });
  }

  stopSpeaking(): void {
    for (let i = 0; i < 5; i++) {
      this.sendAudioPacket(Buffer.from([0xf8, 0xff, 0xfe]));
    }
    this.setSpeaking(false);
  }

  destroy(): void {
    try {
      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws.close(1000);
        this.#ws = null;
      }

      if (this.#udp) {
        this.#udp.close();
        this.#udp = null;
      }

      this.#cleanup();
      this.#hasValidSession = false;
      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy voice connection", { cause: error });
    }
  }

  canSend(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  #handlePayload(payload: VoicePayload): void {
    switch (payload.op) {
      case VoiceGatewayOpcodes.Ready:
        this.#handleReady(payload.d as VoiceReadyPayload);
        break;

      case VoiceGatewayOpcodes.SessionDescription:
        this.#handleSessionDescription(
          payload.d as VoiceSessionDescriptionPayload,
        );
        break;

      case VoiceGatewayOpcodes.HeartbeatAck:
        this.heartbeat.ackHeartbeat(payload.d as VoiceHeartbeatAckPayload);
        break;

      case VoiceGatewayOpcodes.Hello:
        this.#handleHello(payload.d as VoiceHelloPayload);
        break;

      case VoiceGatewayOpcodes.Resumed:
        this.#handleResumed();
        break;

      case VoiceGatewayOpcodes.Speaking: {
        this.#handleSpeaking(payload.d as VoiceSpeakingPayload);
        break;
      }

      default:
        break;
    }
  }

  #handleWebSocketClose(code: number, reason: string): void {
    this.emit("debug", `Voice WebSocket closed with code ${code}: ${reason}`);
    this.heartbeat.destroy();

    if (code === 1000 || NON_RESUMABLE_CODES.includes(code)) {
      this.destroy();
      return;
    }

    this.connect().catch((error) => {
      this.emit(
        "error",
        new Error("Failed to reconnect after close", { cause: error }),
      );
      this.destroy();
    });
  }

  #handleReady(data: VoiceReadyPayload): void {
    this.#ssrc = data.ssrc;
    this.initializeUdp(data.ip, data.port).catch((error) => {
      this.emit(
        "error",
        new Error("Failed to initialize UDP", { cause: error }),
      );
    });
    this.emit("ready", data);
  }

  #handleSessionDescription(data: VoiceSessionDescriptionPayload): void {
    try {
      this.encryption.initialize(Buffer.from(data.secret_key), data.mode);
      this.#hasValidSession = true;
      this.emit("sessionDescription", data);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to handle session description", { cause: error }),
      );
      this.destroy();
    }
  }

  #handleHello(data: VoiceHelloPayload): void {
    try {
      this.emit("debug", `Handling Hello - Can resume: ${this.canResume()}`);

      if (this.canResume()) {
        this.#sendResume();
      } else {
        this.#sendIdentify();
      }

      this.heartbeat.start(data.heartbeat_interval);
    } catch (error) {
      this.emit("error", new Error("Failed to handle hello", { cause: error }));
      this.destroy();
    }
  }

  #handleResumed(): void {
    this.emit("resumed");
  }

  #sendIdentify(): void {
    const identifyPayload: VoiceIdentifyPayload = {
      server_id: this.#options.guildId,
      user_id: this.#options.userId,
      session_id: this.#options.sessionId,
      token: this.#options.token,
    };

    this.send(VoiceGatewayOpcodes.Identify, identifyPayload);
  }

  #sendResume(): void {
    if (
      !(this.#options.sessionId && this.#options.token && this.#options.guildId)
    ) {
      throw new Error("Missing required fields for resume");
    }

    const resumePayload: VoiceResumePayload = {
      server_id: this.#options.guildId,
      session_id: this.#options.sessionId,
      token: this.#options.token,
      seq_ack: this.sequence,
    };

    this.send(VoiceGatewayOpcodes.Resume, resumePayload);
  }

  #createAudioPacket(opusPacket: Buffer): Buffer {
    // RTP Header (12 bytes) + Opus packet
    const packetBuffer = Buffer.alloc(12 + opusPacket.length);

    // RTP Header:
    // [0] Version (2), Padding (0), Extension (0), CSRC Count (0) = 0x80
    packetBuffer[0] = 0x80;
    // [1] Marker (0), Payload Type (0x78) = 0x78
    packetBuffer[1] = 0x78;
    // [2-3] Sequence Number (16 bits)
    packetBuffer.writeUInt16BE(this.#sequence & 0xffff, 2);
    // [4-7] Timestamp (32 bits)
    packetBuffer.writeUInt32BE(this.#timestamp, 4);
    // [8-11] SSRC (32 bits)
    packetBuffer.writeUInt32BE(this.#ssrc, 8);

    // Copy the Opus packet after the header
    opusPacket.copy(packetBuffer, 12);

    return packetBuffer;
  }

  #handleSpeaking(data: VoiceSpeakingPayload): void {
    this.emit("speaking", data);
  }

  #cleanup(): void {
    this.#ssrc = 0;
    this.#sequence = 0;
    this.#timestamp = 0;
    this.#udpIp = null;
    this.#udpPort = null;

    this.heartbeat.destroy();
    this.encryption.destroy();

    if (this.#ipDiscovery) {
      this.#ipDiscovery.cancel();
      this.#ipDiscovery = null;
    }
  }
}
