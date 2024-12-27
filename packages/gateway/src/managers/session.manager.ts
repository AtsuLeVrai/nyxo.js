import type { SessionStartLimitEntity } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { SessionInfo, SessionStats } from "../types/index.js";

interface SessionState {
  sessionId: string;
  sequence: number;
  resumeGatewayUrl: string;
  shardId?: number;
  lastIdentifyTime: number;
  identifyDelay: number;
  lastHeartbeatAck: number | null;
  lastHeartbeatSent: number | null;
  heartbeatInterval?: number;
  status: "connecting" | "ready" | "resuming" | "disconnected";
  version?: number;
  encoding?: string;
}

export class SessionManager {
  static readonly DEFAULT_IDENTIFY_DELAY = 5000;

  readonly #sessions = new Store<string, SessionState>();
  #startLimit: SessionStartLimitEntity | null = null;
  #resetTimer: NodeJS.Timeout | null = null;

  get activeSessions(): number {
    return this.#sessions.size;
  }

  get startLimit(): Readonly<SessionStartLimitEntity> | null {
    return this.#startLimit ? { ...this.#startLimit } : null;
  }

  hasSession(sessionId: string): boolean {
    return this.#sessions.has(sessionId);
  }

  updateStartLimit(limit: SessionStartLimitEntity): void {
    if (!this.#validateStartLimit(limit)) {
      throw new Error("Invalid session start limit");
    }

    this.#startLimit = { ...limit };
    this.#scheduleRateLimitReset();
  }

  registerSession(
    sessionId: string,
    shardId?: number,
    version?: number,
    encoding?: string,
  ): void {
    if (this.#sessions.has(sessionId)) {
      throw new Error("Session already exists");
    }

    this.#sessions.set(sessionId, {
      sessionId,
      sequence: -1,
      resumeGatewayUrl: "",
      shardId,
      version,
      encoding,
      lastIdentifyTime: Date.now(),
      identifyDelay: SessionManager.DEFAULT_IDENTIFY_DELAY,
      lastHeartbeatAck: null,
      lastHeartbeatSent: null,
      status: "connecting",
    });
  }

  async createSession(
    shardId?: number,
    version?: number,
    encoding?: string,
  ): Promise<string> {
    this.#validateCanCreateSession();
    await this.#enforceIdentifyRateLimit();

    if (shardId !== undefined) {
      this.#validateConcurrentShardSession(shardId);
    }

    const sessionId = `session_${Date.now()}_${crypto.randomUUID()}`;

    this.#sessions.set(sessionId, {
      sessionId,
      sequence: -1,
      resumeGatewayUrl: "",
      shardId,
      version,
      encoding,
      lastIdentifyTime: Date.now(),
      identifyDelay: SessionManager.DEFAULT_IDENTIFY_DELAY,
      lastHeartbeatAck: null,
      lastHeartbeatSent: null,
      status: "connecting",
    });

    if (this.#startLimit) {
      this.#startLimit.remaining--;
    }

    return sessionId;
  }

  updateSession(
    sessionId: string,
    resumeGatewayUrl: string,
    sequence = -1,
    heartbeatInterval?: number,
  ): void {
    const session = this.#getSessionOrThrow(sessionId);

    if (session.status === "ready") {
      throw new Error("Session already authenticated");
    }

    session.resumeGatewayUrl = resumeGatewayUrl;
    if (sequence >= 0) {
      session.sequence = sequence;
    }
    if (heartbeatInterval) {
      session.heartbeatInterval = heartbeatInterval;
    }
    session.status = "ready";
  }

  updateSequence(sessionId: string, sequence: number): void {
    const session = this.#getSessionOrThrow(sessionId);

    if (sequence > session.sequence) {
      session.sequence = sequence;
    }
  }

  updateHeartbeat(sessionId: string, sent: boolean, ack?: boolean): void {
    const session = this.#getSessionOrThrow(sessionId);
    const now = Date.now();

    if (sent) {
      session.lastHeartbeatSent = now;
    }
    if (ack) {
      session.lastHeartbeatAck = now;
    }

    if (sent && session.lastHeartbeatSent && session.lastHeartbeatAck) {
      const timeSinceLastAck = now - session.lastHeartbeatAck;
      if (
        session.heartbeatInterval &&
        timeSinceLastAck > session.heartbeatInterval * 2
      ) {
        session.status = "disconnected";
        throw new Error("Session heartbeat timed out");
      }
    }
  }

  getSession(sessionId: string): SessionInfo | null {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      sequence: session.sequence,
      resumeGatewayUrl: session.resumeGatewayUrl,
      shardId: session.shardId,
    };
  }

  canResumeSession(sessionId: string): boolean {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      return false;
    }

    /**
     * @remarks
     * A session can be resumed if:
     * 1. It has a resume_gateway_url (received in READY)
     * 2. It has a valid sequence number
     * 3. Its last heartbeat was acknowledged
     */
    return Boolean(
      session.resumeGatewayUrl &&
        session.sequence >= 0 &&
        session.lastHeartbeatAck &&
        session.status !== "disconnected",
    );
  }

  getSessionsByShard(shardId: number): SessionInfo[] {
    return Array.from(this.#sessions.values())
      .filter((session) => session.shardId === shardId)
      .map((session) => ({
        sessionId: session.sessionId,
        sequence: session.sequence,
        resumeGatewayUrl: session.resumeGatewayUrl,
        shardId: session.shardId,
      }));
  }

  getStats(): SessionStats {
    return {
      totalSessions: this.activeSessions,
      startLimit: this.startLimit,
      sessionsPerShard: this.#calculateSessionsPerShard(),
    };
  }

  deleteSession(sessionId: string): boolean {
    return this.#sessions.delete(sessionId);
  }

  destroy(): void {
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
      this.#resetTimer = null;
    }
    this.#sessions.clear();
    this.#startLimit = null;
  }

  #validateStartLimit(limit: SessionStartLimitEntity): boolean {
    return Boolean(
      limit &&
        typeof limit.total === "number" &&
        typeof limit.remaining === "number" &&
        typeof limit.reset_after === "number" &&
        typeof limit.max_concurrency === "number" &&
        limit.total > 0 &&
        limit.remaining >= 0 &&
        limit.reset_after >= 0 &&
        limit.max_concurrency > 0,
    );
  }

  #validateCanCreateSession(): void {
    if (!this.#startLimit) {
      throw new Error("Session start limit not initialized");
    }

    if (this.#startLimit.remaining <= 0) {
      throw new Error("Session start limit reached");
    }
  }

  #validateConcurrentShardSession(shardId: number): void {
    if (!this.#startLimit) {
      throw new Error("Session start limit not initialized");
    }

    const concurrentSessions = this.getSessionsByShard(shardId).length;
    if (concurrentSessions >= this.#startLimit.max_concurrency) {
      throw new Error(`Max concurrent sessions reached for shard ${shardId}`);
    }
  }

  async #enforceIdentifyRateLimit(): Promise<void> {
    const sessions = Array.from(this.#sessions.values());
    if (sessions.length === 0) {
      return;
    }

    const lastSession = sessions.at(-1);
    if (!lastSession) {
      return;
    }

    const timeSinceLastIdentify = Date.now() - lastSession.lastIdentifyTime;
    if (timeSinceLastIdentify < lastSession.identifyDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, lastSession.identifyDelay - timeSinceLastIdentify),
      );
    }
  }

  #scheduleRateLimitReset(): void {
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
    }

    if (this.#startLimit?.reset_after) {
      this.#resetTimer = setTimeout(() => {
        if (this.#startLimit) {
          this.#startLimit.remaining = this.#startLimit.total;
        }
      }, this.#startLimit.reset_after);
    }
  }

  #calculateSessionsPerShard(): Store<number, number> {
    const shardsMap = new Store<number, number>();

    for (const session of this.#sessions.values()) {
      if (session.shardId !== undefined) {
        const count = shardsMap.get(session.shardId) ?? 0;
        shardsMap.set(session.shardId, count + 1);
      }
    }

    return shardsMap;
  }

  #getSessionOrThrow(sessionId: string): SessionState {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session;
  }
}
