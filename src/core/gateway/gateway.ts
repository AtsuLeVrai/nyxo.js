import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import {
  ApiVersion,
  type GatewayCloseEventCodes,
  GatewayIntentBits,
  GatewayOpcodes,
} from "../../enum/index.js";
import type { HelloEntity, ReadyEntity } from "../../resources/index.js";
import { BitField, safeModuleImport, sleep } from "../../utils/index.js";
import type { Rest } from "../rest/index.js";
import type {
  GatewayReceiveEvents,
  GatewaySendEvents,
  IdentifyEntity,
  PayloadEntity,
  RequestGuildMembersEntity,
  RequestSoundboardSoundsEntity,
  ResumeEntity,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
} from "./gateway.types.js";
import { HeartbeatManager } from "./heartbeat.manager.js";

export enum GatewayConnectionState {
  Idle = "idle",
  Connecting = "connecting",
  Connected = "connected",
  Identifying = "identifying",
  Resuming = "resuming",
  Authenticating = "authenticating",
  Ready = "ready",
  Reconnecting = "reconnecting",
  Disconnecting = "disconnecting",
  Disconnected = "disconnected",
  Failed = "failed",
}

export interface GatewayEvents {
  stateChange: [oldState: GatewayConnectionState, newState: GatewayConnectionState];
  dispatch: [
    event: keyof GatewayReceiveEvents,
    data: GatewayReceiveEvents[keyof GatewayReceiveEvents],
  ];
  wsOpen: [];
  wsClose: [code: GatewayCloseEventCodes, reason: string];
  wsError: [error: Error];
  wsMessage: [data: Buffer];
  heartbeatSent: [timestamp: number, sequence: number];
  heartbeatAck: [timestamp: number, latency: number];
}

export const gatewayEventKeys = [
  "stateChange",
  "dispatch",
  "wsOpen",
  "wsClose",
  "wsError",
  "wsMessage",
  "heartbeatSent",
  "heartbeatAck",
] as const satisfies (keyof GatewayEvents)[];

const MAX_PAYLOAD_SIZE = 4096;
const ZLIB_SYNC_FLUSH_SUFFIX = Buffer.from([0x00, 0x00, 0xff, 0xff]);

export const GatewayOptions = z.object({
  token: z.string(),
  intents: z.union([
    z
      .array(z.enum(GatewayIntentBits))
      .transform((value) => Number(BitField.combine(...value).valueOf())),
    z.int().min(0),
  ]),
  version: z.literal(ApiVersion.V10).default(ApiVersion.V10),
  largeThreshold: z.int().min(50).max(250).default(50),
  encodingType: z.enum(["json", "etf"]).default("json"),
  compressionType: z.enum(["zlib-stream"]).optional(),
  shard: z.tuple([z.int().nonnegative(), z.int().nonnegative()]).optional(),
});

export class Gateway extends EventEmitter<GatewayEvents> {
  state: GatewayConnectionState = GatewayConnectionState.Idle;

  sessionId: string | null = null;
  resumeUrl: string | null = null;
  sequence = 0;
  readyAt: number | null = null;
  resumable = false;

  readonly heartbeat: HeartbeatManager;

  #erlpack: typeof import("erlpack") | null = null;
  #zlibInflate: import("zlib-sync").Inflate | null = null;
  #zlibBuffer: Buffer = Buffer.alloc(0);

  #ws: WebSocket | null = null;
  #reconnectCount = 0;
  #gatewayUrl: string | null = null;

  #rateLimitBucket = {
    count: 0,
    resetAt: 0,
  };

  readonly #rest: Rest;
  readonly #options: z.infer<typeof GatewayOptions>;

  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();
    this.#rest = rest;

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }

    this.heartbeat = new HeartbeatManager(this);
  }

  get isReady(): boolean {
    return this.state === GatewayConnectionState.Ready;
  }

  get uptime(): number {
    return this.readyAt ? Date.now() - this.readyAt : 0;
  }

  get latency(): number {
    return this.heartbeat.latency;
  }

  get canResume(): boolean {
    return this.resumable && this.sessionId !== null && this.sequence > 0;
  }

  updatePresence(presence: UpdatePresenceEntity): void {
    if (!this.isReady) {
      throw new Error("Gateway not ready");
    }

    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  updateVoiceState(options: UpdateVoiceStateEntity): void {
    if (!this.isReady) {
      throw new Error("Gateway not ready");
    }

    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  requestGuildMembers(options: RequestGuildMembersEntity): void {
    if (!this.isReady) {
      throw new Error("Gateway not ready");
    }

    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    if (!this.isReady) {
      throw new Error("Gateway not ready");
    }

    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  async connect(): Promise<void> {
    if (
      this.state !== GatewayConnectionState.Idle &&
      this.state !== GatewayConnectionState.Disconnected
    ) {
      return;
    }

    this.#setState(GatewayConnectionState.Connecting);

    try {
      if (!this.#gatewayUrl) {
        const gatewayInfo = await this.#rest.gateway.fetchBotGatewayInfo();
        this.#gatewayUrl = gatewayInfo.url;
      }

      await this.#connectToGateway();
    } catch (error) {
      this.#setState(GatewayConnectionState.Failed);
      throw error;
    }
  }

  send<T extends keyof GatewaySendEvents>(opcode: T, data: GatewaySendEvents[T]): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }

    const now = Date.now();
    if (now >= this.#rateLimitBucket.resetAt) {
      this.#rateLimitBucket.count = 0;
      this.#rateLimitBucket.resetAt = now + 60000; // 60 secondes
    }

    if (this.#rateLimitBucket.count >= 120) {
      throw new Error("Rate limit exceeded: 120 events per minute");
    }

    const encoded = this.#encodePayload({
      op: opcode,
      d: data,
      s: null,
      t: null,
    });

    this.#ws.send(encoded);
    this.#rateLimitBucket.count++;
  }

  setShard(shardId: number, shardCount: number): void {
    if (shardId < 0 || shardCount <= 0 || shardId >= shardCount) {
      throw new Error("Invalid shard configuration");
    }

    this.#options.shard = [shardId, shardCount];
  }

  disconnect(code = 1000, reason = "Normal closure"): void {
    if (this.state === GatewayConnectionState.Disconnected) {
      return;
    }

    this.#setState(GatewayConnectionState.Disconnecting);
    this.#closeWebSocket(code, reason);

    if (code === 1000 || code === 1001) {
      this.#resetSession();
    }
  }

  destroy(): void {
    if (this.state === GatewayConnectionState.Disconnected) {
      return;
    }

    this.#setState(GatewayConnectionState.Disconnecting);
    this.#closeWebSocket(1000);
    this.#resetSession();
    this.heartbeat.destroy();
    this.#erlpack = null;
    this.#zlibInflate = null;
    this.#zlibBuffer = Buffer.alloc(0);
    this.removeAllListeners();
    this.#setState(GatewayConnectionState.Disconnected);
  }

  async #setupCodecs(): Promise<void> {
    if (this.#options.encodingType === "etf") {
      const result = await safeModuleImport<typeof import("erlpack")>("erlpack");
      if (!result.success) {
        throw new Error("erlpack is required for ETF encoding. Install with: npm install erlpack");
      }

      this.#erlpack = result.module;
    }

    if (this.#options.compressionType === "zlib-stream") {
      const result = await safeModuleImport<typeof import("zlib-sync")>("zlib-sync");
      if (!result.success) {
        throw new Error(
          "zlib-sync is required for zlib-stream compression. Install with: npm install zlib-sync",
        );
      }

      this.#zlibInflate = new result.module.Inflate();
    }
  }

  async #connectToGateway(): Promise<void> {
    await this.#setupCodecs();

    const wsUrl = this.#buildGatewayUrl();
    this.#ws = new WebSocket(wsUrl);

    this.#ws.on("message", this.#handleMessage.bind(this));
    this.#ws.on("close", this.#handleClose.bind(this));
    this.#ws.on("open", () => this.emit("wsOpen"));
    this.#ws.on("error", (error) => this.emit("wsError", error));

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Connection timeout")), 15000);

      this.#ws?.once("open", () => {
        clearTimeout(timeout);
        this.#setState(GatewayConnectionState.Connected);
        resolve();
      });

      this.#ws?.once("error", (err) => {
        clearTimeout(timeout);
        this.#setState(GatewayConnectionState.Failed);
        reject(err);
      });
    });
  }

  #buildGatewayUrl(): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.#options.encodingType,
    });

    if (this.#options.compressionType) {
      params.append("compress", this.#options.compressionType);
    }

    return `${this.#gatewayUrl}?${params}`;
  }

  #decompressZlib(data: Buffer): Buffer | null {
    if (!this.#zlibInflate) {
      throw new Error("Zlib not initialized");
    }

    this.#zlibBuffer = Buffer.concat([this.#zlibBuffer, data]);

    if (!this.#hasZlibSyncFlush(this.#zlibBuffer)) {
      return null;
    }

    try {
      this.#zlibInflate.push(this.#zlibBuffer, 2);

      if (this.#zlibInflate.err < 0) {
        this.#zlibBuffer = Buffer.alloc(0);
        const errorMessage = this.#zlibInflate.msg || `Zlib error code: ${this.#zlibInflate.err}`;
        throw new Error(`Zlib decompression failed: ${errorMessage}`);
      }

      const decompressed = Buffer.from(this.#zlibInflate.result || []);
      this.#zlibBuffer = Buffer.alloc(0);
      return decompressed;
    } catch (error) {
      this.#zlibBuffer = Buffer.alloc(0);
      throw error;
    }
  }

  #encodePayload(data: PayloadEntity): Buffer | string {
    let result: Buffer | string;

    switch (this.#options.encodingType) {
      case "etf":
        if (!this.#erlpack) {
          throw new Error("Erlpack not initialized");
        }
        result = this.#erlpack.pack(data);
        break;
      case "json":
        result = JSON.stringify(data);
        break;
      default:
        throw new Error(`Unsupported encoding type: ${this.#options.encodingType}`);
    }

    const size = Buffer.isBuffer(result) ? result.length : Buffer.byteLength(result);
    if (size > MAX_PAYLOAD_SIZE) {
      throw new Error(`Payload exceeds maximum size of ${MAX_PAYLOAD_SIZE} bytes`);
    }

    return result;
  }

  #decodePayload(data: Buffer | string): PayloadEntity {
    switch (this.#options.encodingType) {
      case "etf":
        if (!this.#erlpack) {
          throw new Error("Erlpack not initialized");
        }
        return this.#erlpack.unpack(Buffer.isBuffer(data) ? data : Buffer.from(data));
      case "json":
        return JSON.parse(typeof data === "string" ? data : data.toString("utf-8"));
      default:
        throw new Error(`Unsupported encoding type: ${this.#options.encodingType}`);
    }
  }

  async #handleMessage(data: Buffer): Promise<void> {
    this.emit("wsMessage", data);
    let processedData = data;

    if (this.#options.compressionType === "zlib-stream") {
      const decompressed = this.#decompressZlib(data);
      if (!decompressed) return;
      processedData = decompressed;
    }

    const payload = this.#decodePayload(processedData);

    if (payload.s !== null && payload.s > this.sequence) {
      this.sequence = payload.s;
    }

    await this.#processPayload(payload);
  }

  async #processPayload(payload: PayloadEntity): Promise<void> {
    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;
      case GatewayOpcodes.Heartbeat:
        this.heartbeat.sendHeartbeat();
        break;
      case GatewayOpcodes.Reconnect:
        await this.#handleReconnect();
        break;
      case GatewayOpcodes.InvalidSession:
        await this.#handleInvalidSession(Boolean(payload.d));
        break;
      case GatewayOpcodes.Hello:
        this.#handleHello(payload.d as HelloEntity);
        break;
      case GatewayOpcodes.HeartbeatAck:
        this.heartbeat.ackHeartbeat();
        break;
    }
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) return;

    switch (payload.t) {
      case "READY":
        this.#handleReady(payload.d as ReadyEntity);
        break;
      case "RESUMED":
        this.#handleResumed();
        break;
    }

    this.emit("dispatch", payload.t, payload.d as GatewayReceiveEvents[keyof GatewayReceiveEvents]);
  }

  #handleReady(data: ReadyEntity): void {
    this.sessionId = data.session_id;
    this.resumeUrl = data.resume_gateway_url;
    this.readyAt = Date.now();
    this.resumable = true;
    this.#reconnectCount = 0;

    this.#setState(GatewayConnectionState.Ready);
  }

  #handleResumed(): void {
    this.readyAt = Date.now();
    this.resumable = true;
    this.#reconnectCount = 0;

    this.#setState(GatewayConnectionState.Ready);
  }

  #handleHello(data: HelloEntity): void {
    this.heartbeat.start(data.heartbeat_interval);

    if (this.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
    } else {
      this.#setState(GatewayConnectionState.Identifying);
      this.#sendIdentify();
    }

    this.#setState(GatewayConnectionState.Authenticating);
  }

  #sendIdentify(): void {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyxo.js",
        device: "nyxo.js",
      },
      compress: this.#options.compressionType === "zlib-stream",
      large_threshold: this.#options.largeThreshold,
      intents: this.#options.intents,
    };

    if (this.#options.shard) {
      payload.shard = this.#options.shard;
    }

    this.send(GatewayOpcodes.Identify, payload);
  }

  #sendResume(): void {
    if (!this.sessionId) return;

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.sessionId,
      seq: this.sequence,
    };

    this.send(GatewayOpcodes.Resume, payload);
  }

  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.resumable = resumable;

    if (!resumable) {
      this.#resetSession();
    }

    await sleep(1000 + Math.random() * 4000);

    if (resumable && this.canResume) {
      this.#setState(GatewayConnectionState.Resuming);
      this.#sendResume();
      this.#setState(GatewayConnectionState.Authenticating);
    } else {
      this.#closeWebSocket();
      await this.connect();
    }
  }

  async #handleReconnect(): Promise<void> {
    const canResume = this.canResume;
    this.#setState(GatewayConnectionState.Reconnecting);
    this.#closeWebSocket(4000);
    await sleep(500);

    if (canResume) {
      await this.#attemptResume();
    } else {
      await this.connect();
    }
  }

  async #handleClose(code: number, reason: string): Promise<void> {
    this.emit("wsClose", code, reason);
    this.heartbeat.destroy();

    if (code === 1000 || code === 1001 || [4004, 4010, 4011, 4012, 4013, 4014].includes(code)) {
      this.#resetSession();
      this.#setState(GatewayConnectionState.Disconnected);
      return;
    }

    if (this.state !== GatewayConnectionState.Disconnecting) {
      this.#setState(GatewayConnectionState.Reconnecting);
      this.#reconnectCount++;
      const delay = this.#getReconnectionDelay();
      await sleep(delay);

      if (this.canResume && ![4004, 4010, 4011, 4012, 4013, 4014].includes(code)) {
        await this.#attemptResume();
      } else {
        await this.connect();
      }
    } else {
      this.#setState(GatewayConnectionState.Disconnected);
    }
  }

  async #attemptResume(): Promise<void> {
    if (!this.canResume || !this.resumeUrl) {
      await this.connect();
      return;
    }

    const oldUrl = this.#gatewayUrl;
    try {
      this.#setState(GatewayConnectionState.Resuming);
      this.#gatewayUrl = this.resumeUrl;
      await this.#connectToGateway();
    } catch {
      this.#gatewayUrl = oldUrl;
      this.#resetSession();
      await this.connect();
    }
  }

  #closeWebSocket(code?: number, reason?: string): void {
    if (!this.#ws) return;

    this.#ws.removeAllListeners();
    try {
      this.#ws.close(code, reason);
    } catch {}
    this.#ws = null;
  }

  #resetSession(): void {
    this.sessionId = null;
    this.resumeUrl = null;
    this.sequence = 0;
    this.readyAt = null;
    this.resumable = false;
  }

  #setState(newState: GatewayConnectionState): void {
    if (!this.#isValidTransition(this.state, newState)) {
      throw new Error(`Invalid state transition: ${this.state} -> ${newState}`);
    }

    const oldState = this.state;
    this.state = newState;
    this.emit("stateChange", oldState, newState);
  }

  #isValidTransition(from: GatewayConnectionState, to: GatewayConnectionState): boolean {
    const transitions: Record<GatewayConnectionState, GatewayConnectionState[]> = {
      [GatewayConnectionState.Idle]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Connecting]: [
        GatewayConnectionState.Connected,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Connected]: [
        GatewayConnectionState.Identifying,
        GatewayConnectionState.Resuming,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Identifying]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Resuming]: [
        GatewayConnectionState.Authenticating,
        GatewayConnectionState.Ready,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Authenticating]: [
        GatewayConnectionState.Ready,
        GatewayConnectionState.Failed,
        GatewayConnectionState.Reconnecting,
      ],
      [GatewayConnectionState.Ready]: [
        GatewayConnectionState.Disconnecting,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Reconnecting,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Reconnecting]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Resuming,
        GatewayConnectionState.Disconnected,
        GatewayConnectionState.Failed,
      ],
      [GatewayConnectionState.Disconnecting]: [GatewayConnectionState.Disconnected],
      [GatewayConnectionState.Disconnected]: [
        GatewayConnectionState.Connecting,
        GatewayConnectionState.Idle,
      ],
      [GatewayConnectionState.Failed]: [
        GatewayConnectionState.Idle,
        GatewayConnectionState.Connecting,
      ],
    };

    return transitions[from]?.includes(to) ?? false;
  }

  #getReconnectionDelay(): number {
    const delays = [1000, 5000, 10000];
    const index = Math.min(this.#reconnectCount - 1, delays.length - 1);
    const baseDelay = (delays[index] as number) ?? (delays[delays.length - 1] as number);
    return Math.min(baseDelay * (0.8 + Math.random() * 0.4), 30000);
  }

  #hasZlibSyncFlush(buffer: Buffer): boolean {
    if (buffer.length < 4) {
      return false;
    }

    return buffer.subarray(-4).equals(ZLIB_SYNC_FLUSH_SUFFIX);
  }
}
