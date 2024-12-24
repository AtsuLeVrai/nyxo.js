import type { SessionStartLimitEntity } from "@nyxjs/rest";
import type { Store } from "@nyxjs/store";

export interface SessionInfo {
  sessionId: string;
  sequence: number;
  resumeGatewayUrl: string;
  shardId?: number;
}

export interface SessionStats {
  totalSessions: number;
  startLimit: SessionStartLimitEntity | null;
  sessionsPerShard: Store<number, number>;
}
