export interface CacheOptions {
  lifetime?: number;
  maxSize?: number;
  shouldCache?: (path: string, method: string) => boolean;
  keyGenerator?: (path: string, method: string) => string;
  enableSweeping?: boolean;
  sweepInterval?: number;
  disabled?: boolean;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
