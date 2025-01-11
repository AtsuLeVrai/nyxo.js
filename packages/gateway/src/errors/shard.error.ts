export enum ShardErrorCode {
  ValidationError = "VALIDATION_ERROR",
  NoShardsAvailable = "NO_SHARDS_AVAILABLE",
  InvalidShardId = "INVALID_SHARD_ID",
  SpawnTimeout = "SPAWN_TIMEOUT",
  ConcurrencyExceeded = "CONCURRENCY_EXCEEDED",
  TooManyGuilds = "TOO_MANY_GUILDS",
  InvalidSession = "INVALID_SESSION",
  SpawnError = "SPAWN_ERROR",
}

export class ShardError extends Error {
  readonly code: ShardErrorCode;
  readonly metadata: Record<string, unknown>;

  constructor(
    code: ShardErrorCode,
    message: string,
    cause?: unknown,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ShardError";
    this.code = code;
    this.cause = cause;
    this.metadata = metadata;
  }

  static validationError(cause: unknown): ShardError {
    return new ShardError(
      ShardErrorCode.ValidationError,
      "Options validation error",
      cause,
    );
  }

  static noShardsAvailable(): ShardError {
    return new ShardError(
      ShardErrorCode.NoShardsAvailable,
      "No shards are available",
    );
  }

  static invalidShardId(shardId: number): ShardError {
    return new ShardError(
      ShardErrorCode.InvalidShardId,
      `Invalid shard ID: ${shardId}`,
      undefined,
      { shardId },
    );
  }

  static spawnTimeout(shardId: number, timeout: number): ShardError {
    return new ShardError(
      ShardErrorCode.SpawnTimeout,
      `Shard ${shardId} spawn timed out after ${timeout}ms`,
      undefined,
      { shardId, timeout },
    );
  }

  static concurrencyExceeded(current: number, max: number): ShardError {
    return new ShardError(
      ShardErrorCode.ConcurrencyExceeded,
      `Max concurrency exceeded: ${current} > ${max}`,
      undefined,
      { current, max },
    );
  }

  static tooManyGuilds(guildsPerShard: number, maxGuilds: number): ShardError {
    return new ShardError(
      ShardErrorCode.TooManyGuilds,
      `Too many guilds per shard: ${guildsPerShard} exceeds maximum of ${maxGuilds}`,
      undefined,
      { guildsPerShard, maxGuilds },
    );
  }

  static invalidSession(shardId: number, numShards: number): ShardError {
    return new ShardError(
      ShardErrorCode.InvalidSession,
      `Invalid shard session: ID ${shardId} >= total shards ${numShards}`,
      undefined,
      { shardId, numShards },
    );
  }

  static spawnError(shardId: number, cause?: unknown): ShardError {
    return new ShardError(
      ShardErrorCode.SpawnError,
      `Failed to spawn shard ${shardId}`,
      cause,
      { shardId },
    );
  }
}
