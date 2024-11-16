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
