import type { SessionStartLimitEntity } from "@nyxjs/rest";
import { Store } from "@nyxjs/store";
import type { SessionInfo, SessionStats } from "../types/index.js";

export class SessionManager {
  #lastIdentifyTime = 0;
  #identifyDelay = 5000;
  #sessions: Store<string, SessionInfo> = new Store();
  #startLimit: SessionStartLimitEntity | null = null;
  #resetTimer: NodeJS.Timeout | null = null;

  updateStartLimit(limit: SessionStartLimitEntity): void {
    this.#startLimit = { ...limit };
    this.#startRateLimitResetTimer();
  }

  getStartLimit(): SessionStartLimitEntity | null {
    return this.#startLimit ? { ...this.#startLimit } : null;
  }

  canStartNewSession(): boolean {
    return this.#startLimit !== null && this.#startLimit.remaining > 0;
  }

  async createSession(shardId?: number): Promise<string> {
    if (!this.canStartNewSession()) {
      throw new Error("Session start limit reached");
    }

    if (shardId !== undefined && !this.validateConcurrentStart(shardId)) {
      throw new Error(`Max concurrency reached for shard ${shardId}`);
    }

    await this.#validateIdentifyRate();

    if (this.#startLimit) {
      this.#startLimit.remaining--;
    }

    const sessionId = this.#generateSessionId();
    this.#sessions.set(sessionId, {
      sessionId,
      sequence: -1,
      resumeGatewayUrl: "",
      shardId,
    });

    return sessionId;
  }

  updateSession(
    sessionId: string,
    resumeGatewayUrl: string,
    sequence = -1,
  ): void {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.resumeGatewayUrl = resumeGatewayUrl;
    if (sequence >= 0) {
      session.sequence = sequence;
    }
  }

  updateSequence(sessionId: string, sequence: number): void {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (sequence > session.sequence) {
      session.sequence = sequence;
    }
  }

  getSession(sessionId: string): SessionInfo | null {
    const session = this.#sessions.get(sessionId);
    return session ? { ...session } : null;
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.#sessions.values()).map((session) => ({
      ...session,
    }));
  }

  canResumeSession(sessionId: string): boolean {
    const session = this.#sessions.get(sessionId);
    return (
      session !== undefined &&
      session.resumeGatewayUrl !== "" &&
      session.sequence >= 0
    );
  }

  deleteSession(sessionId: string): boolean {
    return this.#sessions.delete(sessionId);
  }

  clearSessions(): void {
    this.#sessions.clear();
  }

  getSessionCount(): number {
    return this.#sessions.size;
  }

  hasSession(sessionId: string): boolean {
    return this.#sessions.has(sessionId);
  }

  getSessionsByShard(shardId: number): SessionInfo[] {
    return Array.from(this.#sessions.values())
      .filter((session) => session.shardId === shardId)
      .map((session) => ({ ...session }));
  }

  getStats(): SessionStats {
    return {
      totalSessions: this.#sessions.size,
      startLimit: this.#startLimit,
      sessionsPerShard: this.#getSessionsPerShard(),
    };
  }

  validateConcurrentStart(shardId: number): boolean {
    if (!this.#startLimit) {
      return false;
    }
    const concurrentStarts = this.getSessionsByShard(shardId).length;
    return concurrentStarts < this.#startLimit.max_concurrency;
  }

  destroy(): void {
    if (this.#resetTimer) {
      clearTimeout(this.#resetTimer);
    }
    this.clearSessions();
    this.#startLimit = null;
  }

  #startRateLimitResetTimer(): void {
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

  async #validateIdentifyRate(): Promise<boolean> {
    const now = Date.now();
    if (now - this.#lastIdentifyTime < this.#identifyDelay) {
      const waitTime = this.#identifyDelay - (now - this.#lastIdentifyTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.#lastIdentifyTime = Date.now();
    return true;
  }

  #generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  #getSessionsPerShard(): Store<number, number> {
    const shardsMap = new Store<number, number>();

    for (const session of this.#sessions.values()) {
      if (session.shardId !== undefined) {
        const count = shardsMap.get(session.shardId) ?? 0;
        shardsMap.set(session.shardId, count + 1);
      }
    }

    return shardsMap;
  }
}
