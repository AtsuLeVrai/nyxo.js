import { setTimeout } from "node:timers/promises";
import type { UnavailableGuildEntity } from "@nyxjs/core";
import type { Gateway } from "../core/index.js";
import {
  type GuildCreateEntity,
  type HelloEntity,
  IdentifyEntity,
  type ReadyEntity,
} from "../events/index.js";
import {
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type PayloadEntity,
} from "../types/index.js";

const NON_RESUMABLE_CODES: number[] = [
  4004, // Authentication failed
  4010, // Invalid shard
  4011, // Sharding required
  4012, // Invalid API version
  4013, // Invalid intents
  4014, // Disallowed intents
] as const;

export class OperationHandler {
  #reconnectionAttempts = 0;

  readonly #gateway: Gateway;

  constructor(gateway: Gateway) {
    this.#gateway = gateway;
  }

  handlePayload(payload: PayloadEntity): void {
    if (payload.s !== null) {
      this.#gateway.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.handleHello(payload.d as HelloEntity).catch((error) =>
          this.#gateway.emit("error", error),
        );
        break;

      case GatewayOpcodes.Heartbeat: {
        this.#gateway.heartbeat.sendHeartbeat();
        break;
      }

      case GatewayOpcodes.HeartbeatAck: {
        this.#gateway.heartbeat.ackHeartbeat();
        break;
      }

      case GatewayOpcodes.InvalidSession:
        this.handleInvalidSession(Boolean(payload.d)).catch((error) =>
          this.#gateway.emit("error", error),
        );
        break;

      case GatewayOpcodes.Reconnect:
        this.handleReconnect().catch((error) =>
          this.#gateway.emit("error", error),
        );
        break;

      default:
        this.#gateway.emit("debug", `Unhandled payload op: ${payload.op}`);
    }
  }

  async handleClose(code: number): Promise<void> {
    this.#gateway.heartbeat.destroy();

    if (this.#gateway.sessionId) {
      this.#gateway.emit("sessionUpdate", {
        type: "close",
        sessionId: this.#gateway.sessionId,
        code,
      });
    }

    await this.#handleDisconnect(code);
  }

  async handleInvalidSession(resumable: boolean): Promise<void> {
    this.#gateway.emit("sessionUpdate", {
      type: "invalid",
      resumable,
    });

    this.#gateway.emit("debug", `Invalid session (resumable: ${resumable})`);

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      await this.handleReconnect();
    }
  }

  async handleHello(hello: HelloEntity): Promise<void> {
    this.#gateway.heartbeat.start(hello.heartbeat_interval);

    if (this.#canResume()) {
      this.#sendResume();
    } else {
      await this.#identify();
    }
  }

  shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(isClean || NON_RESUMABLE_CODES.includes(code));
  }

  async handleReconnect(): Promise<void> {
    if (this.#gateway.heartbeat.isReconnecting()) {
      this.#gateway.emit("debug", "Reconnection already in progress, skipping");
      return;
    }

    this.#gateway.destroy();
    await this.#handleDisconnect(4000);
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    switch (payload.t) {
      case "READY": {
        const data = payload.d as ReadyEntity;
        this.#handleReady(data);
        break;
      }

      case "GUILD_CREATE": {
        if (this.#gateway.shard.isEnabled()) {
          const data = payload.d as GuildCreateEntity;
          if ("id" in data && !("unavailable" in data)) {
            this.#gateway.shard.addGuildToShard(data.id);
          }
        }
        break;
      }

      case "GUILD_DELETE": {
        if (this.#gateway.shard.isEnabled()) {
          const data = payload.d as UnavailableGuildEntity;
          if ("id" in data) {
            this.#gateway.shard.removeGuildFromShard(data.id);
          }
        }
        break;
      }

      default: {
        break;
      }
    }

    this.#gateway.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  #handleReady(data: ReadyEntity): void {
    this.#gateway.setSession(data.session_id, data.resume_gateway_url);

    if (this.#gateway.shard.isEnabled()) {
      const shard = this.#gateway.shard.getShardInfo(data.shard?.[0] ?? 0);
      if (shard) {
        this.#gateway.shard.setShardStatus(shard.shardId, "ready");
        const guildIds = data.guilds.map((guild) => guild.id);
        this.#gateway.shard.addGuildsToShard(shard.shardId, guildIds);
      }
    }

    const readyTime = Date.now() - this.#gateway.connectStartTime;
    this.#gateway.emit("sessionUpdate", {
      type: "state",
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
    });

    const details = [
      `🤖 ${data.user.username} (${data.application.id})`,
      `📡 Session ${data.session_id}`,
      `🌐 v${data.v} | ${data.guilds.length} guilds`,
      `⏱ Ready in ${readyTime}ms`,
      data.shard ? `✨ Shard [${data.shard}]` : "",
    ]
      .filter(Boolean)
      .join("\n");

    this.#gateway.emit("debug", details);
  }

  #sendResume(): void {
    const sessionId = this.#gateway.sessionId;
    if (!sessionId) {
      throw new Error("No session ID available to resume");
    }

    this.#gateway.emit("debug", `Resuming session ${sessionId}`);

    this.#gateway.send(GatewayOpcodes.Resume, {
      token: this.#gateway.options.token,
      session_id: sessionId,
      seq: this.#gateway.sequence,
    });
  }

  async #identify(): Promise<void> {
    try {
      const payload = await this.#createIdentifyPayload();
      const validatedPayload = IdentifyEntity.parse(payload);
      this.#gateway.send(GatewayOpcodes.Identify, validatedPayload);
    } catch (error) {
      throw new Error("Invalid identify payload", { cause: error });
    }
  }

  async #createIdentifyPayload(): Promise<IdentifyEntity> {
    const payload: IdentifyEntity = {
      token: this.#gateway.options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.#gateway.compression.isInitialized(),
      large_threshold: this.#gateway.options.largeThreshold,
      intents: this.#gateway.options.intents,
    };

    if (
      this.#gateway.shard.isEnabled() &&
      this.#gateway.shard.totalShards > 0
    ) {
      payload.shard = await this.#gateway.shard.getAvailableShard();
      this.#gateway.emit(
        "debug",
        `Using shard ${payload.shard[0]}/${payload.shard[1]}`,
      );
    }

    if (this.#gateway.options.presence) {
      payload.presence = this.#gateway.options.presence;
    }

    return payload;
  }

  async #handleDisconnect(code: number): Promise<void> {
    if (!this.#gateway.options.heartbeat.autoReconnect) {
      this.#gateway.emit(
        "debug",
        "Retry not allowed, stopping reconnection process",
      );
      return;
    }

    this.#incrementReconnectionAttempts();

    const delay = this.#getReconnectionDelay();
    this.#gateway.emit(
      "debug",
      `Waiting ${delay}ms before reconnecting (attempt ${this.#reconnectionAttempts})`,
    );
    await setTimeout(delay);

    try {
      if (this.shouldResume(code) && this.#canResume()) {
        this.#gateway.emit("debug", "Attempting to resume previous session");
        await this.#handleResume();
      } else {
        this.#gateway.emit("debug", "Starting new connection");
        this.#gateway.destroy();
        await this.#gateway.connect();
      }
    } catch (error) {
      this.#gateway.emit(
        "error",
        new Error("Reconnection failed", { cause: error }),
      );
      await this.#handleDisconnect(code);
    }
  }

  async #handleResume(): Promise<void> {
    const resumeUrl = this.#gateway.resumeUrl;
    if (!resumeUrl) {
      throw new Error("No resume URL available for session resumption");
    }

    try {
      this.#gateway.emit("debug", "Attempting to resume session");
      await this.#gateway.initializeWebSocket(resumeUrl);
      this.#sendResume();
    } catch {
      this.#gateway.emit(
        "debug",
        "Resume attempt failed, falling back to reconnect",
      );

      await this.#handleDisconnect(4000);
    }
  }

  #canResume(): boolean {
    return Boolean(this.#gateway.sessionId && this.#gateway.sequence > 0);
  }

  #incrementReconnectionAttempts(): void {
    this.#reconnectionAttempts++;
  }

  #getReconnectionDelay(): number {
    return (
      this.#gateway.options.backoffSchedule[this.#reconnectionAttempts] ??
      this.#gateway.options.backoffSchedule.at(-1) ??
      0
    );
  }
}
