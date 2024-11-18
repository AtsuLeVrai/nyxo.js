export interface GatewayErrorMetadata {
    timestamp: number;
    severity: "low" | "medium" | "high" | "critical";
}

export enum ErrorCodes {
    // Gateway Core
    GatewayConnectionError = "GATEWAY_CONNECTION_ERROR",
    GatewayInitializationError = "GATEWAY_INITIALIZATION_ERROR",
    GatewayMessageError = "GATEWAY_MESSAGE_ERROR",
    GatewayPayloadError = "GATEWAY_PAYLOAD_ERROR",
    GatewayStateError = "GATEWAY_STATE_ERROR",

    // WebSocket
    WebSocketConnectionError = "WEBSOCKET_CONNECTION_ERROR",
    WebSocketSendError = "WEBSOCKET_SEND_ERROR",
    WebSocketCleanupError = "WEBSOCKET_CLEANUP_ERROR",
    WebSocketStateError = "WEBSOCKET_STATE_ERROR",
    WebSocketInvalidState = "WEBSOCKET_INVALID_STATE",

    // Compression
    CompressionInitError = "COMPRESSION_INIT_ERROR",
    CompressionInflatorError = "COMPRESSION_INFLATOR_ERROR",
    CompressionDecompressError = "COMPRESSION_DECOMPRESS_ERROR",
    CompressionInvalidData = "COMPRESSION_INVALID_DATA",
    CompressionMaxSizeError = "COMPRESSION_MAX_SIZE_ERROR",

    // Payload
    PayloadEncodingError = "PAYLOAD_ENCODING_ERROR",
    PayloadDecodingError = "PAYLOAD_DECODING_ERROR",
    PayloadInvalidInput = "PAYLOAD_INVALID_INPUT",
    PayloadInvalidBinary = "PAYLOAD_INVALID_BINARY",
    PayloadUnsupportedFormat = "PAYLOAD_UNSUPPORTED_FORMAT",

    // Session
    SessionNotInitialized = "SESSION_NOT_INITIALIZED",
    SessionLimitExceeded = "SESSION_LIMIT_EXCEEDED",
    SessionAcquisitionError = "SESSION_ACQUISITION_ERROR",
    SessionQueueError = "SESSION_QUEUE_ERROR",
    SessionStateError = "SESSION_STATE_ERROR",
    SessionResetError = "SESSION_RESET_ERROR",

    // Heartbeat
    HeartbeatSendError = "HEARTBEAT_SEND_ERROR",
    HeartbeatMaxMissedError = "HEARTBEAT_MAX_MISSED_ERROR",
    HeartbeatIntervalError = "HEARTBEAT_INTERVAL_ERROR",
    HeartbeatStateError = "HEARTBEAT_STATE_ERROR",

    // Sharding
    ShardInitError = "SHARD_INIT_ERROR",
    ShardConnectionError = "SHARD_CONNECTION_ERROR",
    ShardReconnectionError = "SHARD_RECONNECTION_ERROR",
    ShardConfigError = "SHARD_CONFIG_ERROR",
    ShardLimitError = "SHARD_LIMIT_ERROR",
    ShardQueueError = "SHARD_QUEUE_ERROR",
    ShardStateError = "SHARD_STATE_ERROR",
    ShardSpawnError = "SHARD_SPAWN_ERROR",
    ShardScalingError = "SHARD_SCALING_ERROR",
    ShardAutoError = "SHARD_AUTO_ERROR",
    ShardLargeBotError = "SHARD_LARGE_BOT_ERROR",
}

export class GatewayError extends Error {
    readonly code: ErrorCodes;
    readonly details?: Record<string, unknown>;
    readonly metadata: GatewayErrorMetadata;
    readonly isRetryable: boolean;

    constructor(
        message: string,
        code: ErrorCodes,
        options?: {
            details?: Record<string, unknown>;
            cause?: Error | unknown;
            severity?: GatewayErrorMetadata["severity"];
            isRetryable?: boolean;
        },
    ) {
        super(message);
        this.name = "GatewayError";
        this.code = code;
        this.details = options?.details;
        this.cause = options?.cause;
        this.isRetryable = options?.isRetryable ?? this.#determineRetryable();

        this.metadata = {
            timestamp: Date.now(),
            severity: options?.severity ?? this.#determineSeverity(),
        };

        if (process.env["NODE_ENV"] === "development") {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJson(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            metadata: this.metadata,
            isRetryable: this.isRetryable,
            cause:
                this.cause instanceof Error
                    ? {
                          name: this.cause.name,
                          message: this.cause.message,
                      }
                    : undefined,
        };
    }

    override toString(): string {
        return `${this.name}[${this.code}]: ${this.message}`;
    }

    #determineSeverity(): GatewayErrorMetadata["severity"] {
        switch (this.code) {
            case ErrorCodes.HeartbeatMaxMissedError:
            case ErrorCodes.GatewayConnectionError:
            case ErrorCodes.ShardLargeBotError:
                return "critical";
            case ErrorCodes.SessionLimitExceeded:
            case ErrorCodes.ShardReconnectionError:
                return "high";
            case ErrorCodes.PayloadDecodingError:
            case ErrorCodes.CompressionDecompressError:
                return "medium";
            default:
                return "low";
        }
    }

    #determineRetryable(): boolean {
        return ![
            ErrorCodes.PayloadUnsupportedFormat,
            ErrorCodes.ShardLimitError,
            ErrorCodes.SessionLimitExceeded,
            ErrorCodes.ShardLargeBotError,
        ].includes(this.code);
    }
}
