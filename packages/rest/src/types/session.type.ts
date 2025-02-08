import type { RateLimitManager, RequestManager } from "../managers/index.js";
import type { RestOptions } from "../options/index.js";

export interface SessionInfo {
  request: RequestManager;
  rateLimiter: RateLimitManager;
  options: RestOptions;
}

export interface SessionCreatedEvent {
  sessionId: string;
  timestamp: number;
  options: RestOptions;
}

export interface SessionUpdatedEvent {
  sessionId: string;
  timestamp: number;
  oldOptions: RestOptions;
  newOptions: RestOptions;
}

export interface SessionDestroyedEvent {
  sessionId: string;
  timestamp: number;
}
