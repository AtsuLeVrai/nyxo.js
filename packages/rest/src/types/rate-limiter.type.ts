export type RateLimitScope = "user" | "global" | "shared";

export interface QueueEntry {
  resolve: () => void;
  reject: (error: Error) => void;
  addedAt: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#header-format-rate-limit-header-examples}
 */
export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  resetAfter: number;
  bucket: string;
  global: boolean;
  scope: RateLimitScope;
}
