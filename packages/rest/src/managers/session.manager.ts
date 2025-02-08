import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import { RateLimitManager, RequestManager } from "../managers/index.js";
import { RestOptions } from "../options/index.js";
import type { SessionInfo } from "../types/index.js";

export class SessionManager {
  readonly #sessions = new Map<string, SessionInfo>();
  readonly #defaultSessionId: string = "default";

  readonly #rest: Rest;

  constructor(rest: Rest, options: z.input<typeof RestOptions>) {
    this.#rest = rest;
    this.addSession(this.#defaultSessionId, options);
  }

  get defaultSessionId(): string {
    return this.#defaultSessionId;
  }

  addSession(sessionId: string, options: z.input<typeof RestOptions>): void {
    if (this.#sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }

    const parsedOptions = RestOptions.safeParse(options);
    if (!parsedOptions.success) {
      throw new Error(fromZodError(parsedOptions.error).message);
    }

    const request = new RequestManager(this.#rest, parsedOptions.data);
    const rateLimiter = new RateLimitManager(
      this.#rest,
      parsedOptions.data.rateLimit,
    );

    this.#sessions.set(sessionId, {
      request,
      rateLimiter,
      options: parsedOptions.data,
    });

    this.#rest.emit("sessionCreated", {
      sessionId,
      timestamp: Date.now(),
      options: parsedOptions.data,
    });
  }

  updateSessionOptions(
    options: z.input<typeof RestOptions>,
    sessionId: string = this.#defaultSessionId,
  ): void {
    const session = this.getSessionInfo(sessionId);
    const oldOptions = { ...session.options };

    const updatedOptions = RestOptions.safeParse({
      ...oldOptions,
      ...options,
    });
    if (!updatedOptions.success) {
      throw new Error(fromZodError(updatedOptions.error).message);
    }

    const request = new RequestManager(this.#rest, updatedOptions.data);
    const rateLimiter = new RateLimitManager(
      this.#rest,
      updatedOptions.data.rateLimit,
    );
    session.rateLimiter.destroy();

    this.#sessions.set(sessionId, {
      request,
      rateLimiter,
      options: updatedOptions.data,
    });

    this.#rest.emit("sessionUpdated", {
      sessionId: sessionId,
      timestamp: Date.now(),
      oldOptions,
      newOptions: updatedOptions.data,
    });
  }

  getSessionInfo(sessionId: string = this.#defaultSessionId): SessionInfo {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session;
  }

  getSessionOptions(sessionId?: string): Readonly<RestOptions> {
    const session = this.getSessionInfo(sessionId);
    return { ...session.options };
  }

  getOption<K extends keyof RestOptions>(
    key: K,
    sessionId?: string,
  ): RestOptions[K] {
    const options = this.getSessionOptions(sessionId);
    return options[key];
  }

  getOptions<K extends keyof RestOptions>(
    keys: K[],
    sessionId?: string,
  ): Pick<RestOptions, K> {
    const options = this.getSessionOptions(sessionId);
    return keys.reduce(
      (acc, key) => {
        acc[key] = options[key];
        return acc;
      },
      {} as Pick<RestOptions, K>,
    );
  }

  hasSession(sessionId: string): boolean {
    return this.#sessions.has(sessionId);
  }

  getSessions(): string[] {
    return Array.from(this.#sessions.keys());
  }

  removeSession(sessionId: string): void {
    if (sessionId === this.#defaultSessionId) {
      throw new Error("Cannot remove the default session");
    }

    const session = this.#sessions.get(sessionId);
    if (session) {
      session.rateLimiter.destroy();
      this.#sessions.delete(sessionId);

      this.#rest.emit("sessionDestroyed", {
        sessionId,
        timestamp: Date.now(),
      });
    }
  }

  destroy(): void {
    for (const session of this.#sessions.values()) {
      session.rateLimiter.destroy();
    }

    this.#sessions.clear();
  }
}
