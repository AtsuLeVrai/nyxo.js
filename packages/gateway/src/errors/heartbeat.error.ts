export enum HeartbeatErrorCode {
  ValidationError = "VALIDATION_ERROR",
  InvalidInterval = "INVALID_INTERVAL",
  InvalidSequence = "INVALID_SEQUENCE",
  ZombieConnection = "ZOMBIE_CONNECTION",
  HighLatency = "HIGH_LATENCY",
  ConnectionLost = "CONNECTION_LOST",
  AlreadyRunning = "ALREADY_RUNNING",
}

export class HeartbeatError extends Error {
  readonly code: HeartbeatErrorCode;
  readonly metadata: Record<string, unknown>;

  constructor(
    code: HeartbeatErrorCode,
    message: string,
    cause?: unknown,
    metadata: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "HeartbeatError";
    this.code = code;
    this.cause = cause;
    this.metadata = metadata;
  }

  static validationError(cause: unknown): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.ValidationError,
      "Options validation error",
      cause,
    );
  }

  static invalidInterval(interval: number): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.InvalidInterval,
      `Invalid heartbeat interval: ${interval}ms`,
      undefined,
      { interval },
    );
  }

  static invalidSequence(
    sequence: number,
    min: number,
    max: number,
  ): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.InvalidSequence,
      `Invalid sequence number: ${sequence} (must be between ${min} and ${max})`,
      undefined,
      { sequence, min, max },
    );
  }

  static zombieConnection(missedHeartbeats: number): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.ZombieConnection,
      `Zombie connection detected after ${missedHeartbeats} missed heartbeats`,
      undefined,
      { missedHeartbeats },
    );
  }

  static highLatency(latency: number, maxLatency: number): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.HighLatency,
      `High latency detected: ${latency}ms (max: ${maxLatency}ms)`,
      undefined,
      { latency, maxLatency },
    );
  }

  static connectionLost(attempts: number): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.ConnectionLost,
      `Connection lost after ${attempts} retry attempts`,
      undefined,
      { attempts },
    );
  }

  static alreadyRunning(): HeartbeatError {
    return new HeartbeatError(
      HeartbeatErrorCode.AlreadyRunning,
      "Heartbeat service is already running",
    );
  }
}
