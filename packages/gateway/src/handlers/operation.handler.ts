import { setTimeout } from "node:timers/promises";
import type { Gateway } from "../core/index.js";
import {
  type HelloEntity,
  IdentifyEntity,
  type ReadyEntity,
} from "../events/index.js";
import {
  type GatewayCloseCodes,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type PayloadEntity,
} from "../types/index.js";

export const NON_RESUMABLE_CODES: GatewayCloseCodes[] = [
  4004, // Authentication failed
  4010, // Invalid shard
  4011, // Sharding required
  4012, // Invalid API version
  4013, // Invalid intents
  4014, // Disallowed intents
] as const;

export class OperationHandler {
  readonly #gateway: Gateway;

  constructor(gateway: Gateway) {
    this.#gateway = gateway;
  }

  handlePayload(payload: PayloadEntity): void {
    if (payload.s !== null) {
      this.#gateway.session.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        this.handleHello(payload.d as HelloEntity);
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

    if (this.#gateway.session.sessionId) {
      this.#gateway.emit("sessionUpdate", {
        type: "end",
        sessionId: this.#gateway.session.sessionId,
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

    if (resumable && this.#gateway.session.canResume()) {
      await this.#handleResume();
    } else {
      this.#gateway.session.reset();
      await this.handleReconnect();
    }
  }

  handleHello(hello: HelloEntity): void {
    this.#gateway.heartbeat.start(hello.heartbeat_interval);

    if (this.#gateway.session.canResume()) {
      this.#sendResume();
    } else {
      this.#identify();
    }
  }

  shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(
      isClean || NON_RESUMABLE_CODES.includes(code as GatewayCloseCodes)
    );
  }

  async handleReconnect(): Promise<void> {
    if (this.#gateway.heartbeat.isReconnecting()) {
      this.#gateway.emit("debug", "Reconnection already in progress, skipping");
      return;
    }

    this.#gateway.emit("connectionUpdate", {
      type: "reconnect",
      attempt: this.#gateway.reconnection.attempts,
    });

    this.#gateway.destroy();

    await this.#handleDisconnect(4000);
  }

  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    if (payload.t === "READY") {
      this.#handleReady(payload.d as ReadyEntity);
    }

    this.#gateway.emit(
      "dispatch",
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  #handleReady(data: ReadyEntity): void {
    this.#gateway.session.setSession(data.session_id, data.resume_gateway_url);
    this.#gateway.reconnection.reset();

    const readyTime = Date.now() - this.#gateway.connectStartTime;
    this.#gateway.emit("sessionUpdate", {
      type: "start",
      sessionId: data.session_id,
      readyTime,
      data,
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
    const sessionId = this.#gateway.session.sessionId;
    if (!sessionId) {
      throw new Error("No session ID available to resume");
    }

    this.#gateway.emit("debug", `Resuming session ${sessionId}`);

    this.#gateway.send(GatewayOpcodes.Resume, {
      token: this.#gateway.options.token,
      session_id: sessionId,
      seq: this.#gateway.session.sequence,
    });
  }

  #identify(): void {
    const payload = this.#createIdentifyPayload();

    try {
      const validatedPayload = IdentifyEntity.parse(payload);
      this.#gateway.send(GatewayOpcodes.Identify, validatedPayload);
    } catch (error) {
      throw new Error("Invalid identify payload", { cause: error });
    }
  }

  #createIdentifyPayload(): IdentifyEntity {
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
      payload.shard = this.#gateway.shard.getNextShard();
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
    if (!this.#gateway.canRetry()) {
      this.#gateway.emit(
        "debug",
        "Retry not allowed, stopping reconnection process",
      );
      return;
    }

    this.#gateway.reconnection.increment();

    const delay = this.#gateway.reconnection.getDelay();
    this.#gateway.emit(
      "debug",
      `Waiting ${delay}ms before reconnecting (attempt ${this.#gateway.reconnection.attempts})`,
    );
    await setTimeout(delay);

    try {
      if (this.shouldResume(code) && this.#gateway.session.canResume()) {
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
    const resumeUrl = this.#gateway.session.resumeUrl;
    if (!resumeUrl) {
      throw new Error("No resume URL available for session resumption");
    }

    try {
      this.#gateway.emit("debug", "Attempting to resume session");
      await this.#gateway.initializeWebSocket(resumeUrl);
      this.#sendResume();
    } catch (_error) {
      this.#gateway.emit(
        "debug",
        "Resume attempt failed, falling back to reconnect",
      );

      await this.#handleDisconnect(4000);
    }
  }
}
