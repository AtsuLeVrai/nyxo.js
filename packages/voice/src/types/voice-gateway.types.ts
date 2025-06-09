import type { Snowflake } from "@nyxojs/core";

/**
 * Voice Connection State
 *
 * Enumeration representing the current operational state of a voice connection.
 * These states track the lifecycle from initial connection through to termination.
 *
 * **State Flow:** Connecting → Signalling → Ready → (Disconnected/Destroying)
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#connection-lifecycle}
 */
export enum VoiceConnectionState {
  /**
   * Connection is being established
   *
   * **Phase:** Initial WebSocket connection and handshake
   * **Next States:** Signalling, Disconnected
   */
  Connecting = "connecting",

  /**
   * Connection is ready and functional
   *
   * **Phase:** Fully operational, can send/receive voice data
   * **Capabilities:** Voice transmission, speaking updates, media streaming
   */
  Ready = "ready",

  /**
   * Connection is disconnected
   *
   * **Phase:** No active connection, may attempt automatic reconnection
   * **Recovery:** Can transition back to Connecting for reconnection
   */
  Disconnected = "disconnected",

  /**
   * Connection is being destroyed
   *
   * **Phase:** Permanent shutdown, cleanup in progress
   * **Final State:** No recovery possible, requires new connection
   */
  Destroying = "destroying",

  /**
   * Connection is signalling
   *
   * **Phase:** UDP connection establishment and protocol negotiation
   * **Next States:** Ready, Disconnected
   */
  Signalling = "signalling",
}

/**
 * Voice Gateway Opcodes
 *
 * Enumeration of all voice gateway opcodes for Discord Voice WebSocket communication.
 * These opcodes determine the type of payload being sent or received over the voice gateway
 * and control the voice connection lifecycle from identification to media transmission.
 *
 * Voice gateway communication follows a specific flow: Identify → Ready → Select Protocol →
 * Session Description → Speaking state updates and media transmission.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice}
 */
export enum VoiceGatewayOpcode {
  /**
   * Begin a voice websocket connection.
   *
   * **Direction:** Client → Server
   * **Purpose:** Used to identify the voice connection and authenticate with the voice server.
   * **Required:** Yes, first message after connecting to voice WebSocket.
   */
  Identify = 0,

  /**
   * Select the voice protocol.
   *
   * **Direction:** Client → Server
   * **Purpose:** Used to select the voice protocol and encryption mode after IP discovery.
   * **Required:** Yes, sent after receiving Ready payload and completing IP discovery.
   */
  SelectProtocol = 1,

  /**
   * Complete the websocket handshake.
   *
   * **Direction:** Server → Client
   * **Purpose:** Confirms connection readiness and provides SSRC, IP, port, and encryption modes.
   * **Contains:** SSRC, IP address, port, available encryption modes, heartbeat interval.
   */
  Ready = 2,

  /**
   * Keep the connection alive.
   *
   * **Direction:** Client → Server
   * **Purpose:** Heartbeat to maintain the voice connection and prevent timeout.
   * **Frequency:** At the interval specified in the Hello payload.
   */
  Heartbeat = 3,

  /**
   * Describe the session.
   *
   * **Direction:** Server → Client
   * **Purpose:** Provides session description with encryption details and media configuration.
   * **Contains:** Encryption mode, secret key, audio/video codecs, DAVE protocol version.
   */
  SessionDescription = 4,

  /**
   * Indicate which users are speaking.
   *
   * **Direction:** Client ↔ Server (Bidirectional)
   * **Purpose:** Communicate speaking status and SSRC association.
   * **Required:** Must send at least once before transmitting voice data.
   */
  Speaking = 5,

  /**
   * Sent to acknowledge a received heartbeat.
   *
   * **Direction:** Server → Client
   * **Purpose:** Acknowledges that a heartbeat was received and processed.
   * **Contains:** The nonce value from the original heartbeat.
   */
  HeartbeatAck = 6,

  /**
   * Resume a connection.
   *
   * **Direction:** Client → Server
   * **Purpose:** Resume a previous voice connection after disconnection.
   * **Alternative:** Used instead of Identify when resuming an existing session.
   */
  Resume = 7,

  /**
   * Time to wait between sending heartbeats in milliseconds.
   *
   * **Direction:** Server → Client
   * **Purpose:** Provides the heartbeat interval for connection maintenance.
   * **Timing:** Sent immediately after WebSocket connection is established.
   */
  Hello = 8,

  /**
   * Acknowledge Resume.
   *
   * **Direction:** Server → Client
   * **Purpose:** Acknowledges a successful resume operation.
   * **Result:** Session is restored without requiring full re-identification.
   */
  Resumed = 9,

  /**
   * Video sink wants.
   *
   * **Direction:** Client → Server
   * **Purpose:** Request video streams from specific users in the voice channel.
   * **Use Case:** Enables selective video reception for performance optimization.
   */
  VideoSinkWants = 10,

  /**
   * Channel options.
   *
   * **Direction:** Server → Client
   * **Purpose:** Provides channel-specific audio/video configuration options.
   * **Contains:** Audio quality, video quality, noise suppression settings.
   */
  ChannelOptionsUpdate = 11,

  /**
   * Code version.
   *
   * **Direction:** Server → Client
   * **Purpose:** Provides voice server version information for compatibility.
   * **Use Case:** Helps clients adapt behavior based on server capabilities.
   */
  CodeVersion = 12,
}

/**
 * Voice Gateway Version
 *
 * Enumeration of Discord Voice Gateway API versions with their capabilities and status.
 * Each version introduced new features and changes to the voice protocol.
 *
 * **Recommendation:** Use version 8 for new implementations as it provides the most
 * reliable experience with server message buffering and resume capabilities.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-gateway-versioning}
 */
export enum VoiceGatewayVersion {
  /**
   * Version 1 - Initial version (deprecated)
   *
   * **Status:** Deprecated, will be discontinued
   * **Features:** Basic voice connection support
   * **Issues:** No heartbeat ACK opcode, limited resume support
   *
   * @deprecated Use V8 instead for new implementations
   */
  V1 = 1,

  /**
   * Version 2 - Changed heartbeat reply to heartbeat ACK opcode (deprecated)
   *
   * **Status:** Deprecated, will be discontinued
   * **Changes:** Introduced proper heartbeat acknowledgment mechanism
   * **Issues:** Limited speaking status support
   *
   * @deprecated Use V8 instead for new implementations
   */
  V2 = 2,

  /**
   * Version 3 - Added video support (deprecated)
   *
   * **Status:** Deprecated, will be discontinued
   * **Changes:** Basic video transmission capabilities
   * **Issues:** Boolean speaking status instead of bitmask
   *
   * @deprecated Use V8 instead for new implementations
   */
  V3 = 3,

  /**
   * Version 4 - Changed speaking status to bitmask from boolean
   *
   * **Status:** Available but not recommended
   * **Changes:** Speaking flags as bitfield for multiple speaking types
   * **Improvements:** Better speaking state granularity
   *
   * @deprecated Use V8 instead for new implementations
   */
  V4 = 4,

  /**
   * Version 5 - Added video sink wants opcode
   *
   * **Status:** Available
   * **Changes:** Selective video stream requesting for performance
   * **Use Case:** Bandwidth optimization in multi-user video calls
   *
   * @deprecated Use V8 instead for new implementations
   */
  V5 = 5,

  /**
   * Version 6 - Added code version opcode
   *
   * **Status:** Available
   * **Changes:** Voice server version reporting for compatibility
   * **Benefits:** Better client-server compatibility detection
   * **Deprecation:** Planned for removal in future versions
   *
   * @deprecated Use V8 instead for new implementations
   */
  V6 = 6,

  /**
   * Version 7 - Added channel options opcode
   *
   * **Status:** Available
   * **Changes:** Channel-specific audio/video configuration
   * **Features:** Dynamic quality and processing settings
   *
   * @deprecated Use V8 instead for new implementations
   */
  V7 = 7,

  /**
   * Version 8 - Added server message buffering, missed messages re-delivered on resume (recommended)
   *
   * **Status:** Recommended for all new implementations
   * **Changes:** Reliable message delivery and enhanced resume capabilities
   * **Benefits:** Improved connection stability and event replay on reconnection
   */
  V8 = 8,
}

/**
 * Voice Protocol
 *
 * Enumeration of supported voice protocols for audio/video data transmission.
 * The protocol determines how media data is packaged and transmitted.
 *
 * **Current Standard:** UDP is the primary protocol used for Discord voice connections.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-data}
 */
export enum VoiceProtocol {
  /**
   * UDP protocol for voice data transmission
   *
   * **Type:** User Datagram Protocol
   * **Characteristics:** Low latency, connectionless, optimized for real-time media
   * **Use Case:** Primary protocol for Discord voice connections
   */
  Udp = "udp",

  /**
   * WebRTC protocol for voice data transmission
   *
   * **Type:** Web Real-Time Communication
   * **Characteristics:** Browser-optimized, built-in encryption, adaptive quality
   * **Use Case:** Web-based clients and specialized implementations
   */
  WebRtc = "webrtc",
}

/**
 * Voice Encryption Modes
 *
 * Enumeration of encryption modes supported by Discord voice connections for transport encryption.
 * These modes determine how voice data is encrypted during transmission between client and server.
 *
 * **Security Note:** This is transport encryption (client ↔ server). End-to-end encryption
 * between users is handled separately by the DAVE protocol.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-modes}
 */
export enum VoiceEncryptionMode {
  /**
   * AES256 GCM with RTP extension for DAVE protocol (Preferred)
   *
   * **Status:** Available, preferred when supported
   * **Encryption:** AES-256 GCM with proper RTP header handling
   * **Compatibility:** Better support for RTP extensions and CSRC
   * **Nonce:** 32-bit incremental value appended to payload
   */
  Aes256GcmRtpSize = "aes256_gcm_rtpsize",

  /**
   * XChaCha20 Poly1305 encryption with RTP extension (Required)
   *
   * **Status:** Required support, always available
   * **Encryption:** XChaCha20 stream cipher with Poly1305 authenticator
   * **Compatibility:** Universally supported across all implementations
   * **Nonce:** 32-bit incremental value appended to payload
   */
  XChaCha20Poly1305RtpSize = "aead_xchacha20_poly1305_rtpsize",

  /**
   * AES256 GCM encryption for DAVE protocol (Preferred)
   *
   * **Status:** Available, preferred when supported
   * **Encryption:** AES-256 in Galois/Counter Mode
   * **Performance:** Hardware-accelerated on most platforms
   * **Nonce:** 32-bit incremental value appended to payload
   *
   * @deprecated Not recommended for new implementations, use Aes256GcmRtpSize or XChaCha20Poly1305RtpSize instead
   */
  Aes256Gcm = "aes256_gcm",

  /**
   * XSalsa20 Poly1305 encryption (Deprecated)
   *
   * **Status:** Deprecated, will be discontinued November 18, 2024
   * **Encryption:** XSalsa20 stream cipher with Poly1305 authenticator
   * **Nonce:** Copy of RTP header (12 bytes + 12 null bytes)
   *
   * @deprecated Not recommended for new implementations, use Aes256GcmRtpSize or XChaCha20Poly1305RtpSize instead
   */
  XSalsa20Poly1305 = "xsalsa20_poly1305",

  /**
   * XSalsa20 Poly1305 suffix encryption (Deprecated)
   *
   * **Status:** Deprecated, will be discontinued November 18, 2024
   * **Encryption:** XSalsa20 with Poly1305, random nonce suffix
   * **Nonce:** 24 random bytes appended to payload
   *
   * @deprecated Not recommended for new implementations, use Aes256GcmRtpSize or XChaCha20Poly1305RtpSize instead
   */
  XSalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",

  /**
   * XSalsa20 Poly1305 lite encryption (Deprecated)
   *
   * **Status:** Deprecated, will be discontinued November 18, 2024
   * **Encryption:** XSalsa20 with Poly1305, incremental nonce
   * **Nonce:** 32-bit incremental value appended to payload
   *
   * @deprecated Not recommended for new implementations, use Aes256GcmRtpSize or XChaCha20Poly1305RtpSize instead
   */
  XSalsa20Poly1305Lite = "xsalsa20_poly1305_lite",

  /**
   * XSalsa20 Poly1305 lite with RTP extension (Deprecated)
   *
   * **Status:** Deprecated, will be discontinued November 18, 2024
   * **Encryption:** XSalsa20 Poly1305 with RTP size calculation
   * **Nonce:** 32-bit incremental value appended to payload
   *
   * @deprecated Not recommended for new implementations, use Aes256GcmRtpSize or XChaCha20Poly1305RtpSize instead
   */
  XSalsa20Poly1305LiteRtpSize = "xsalsa20_poly1305_lite_rtpsize",
}

/**
 * Speaking Flags
 *
 * Bitfield enumeration indicating what type of audio a user is transmitting.
 * Multiple flags can be combined to represent different audio sources simultaneously.
 *
 * **Usage:** Must send at least one Speaking payload before transmitting voice data.
 * The speaking mode should not be 0 to allow sending audio.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export enum SpeakingFlags {
  /**
   * Not speaking
   *
   * **Value:** 0 (no bits set)
   * **Usage:** Indicates the user is not transmitting any audio
   * **Warning:** Setting this flag prevents audio transmission
   */
  None = 0,

  /**
   * Normal voice audio (Microphone)
   *
   * **Value:** 1 (bit 0)
   * **Usage:** Standard voice transmission from microphone input
   * **Display:** Shows speaking indicator in Discord UI
   */
  Microphone = 1 << 0,

  /**
   * Soundshare audio (Music, game audio, etc.)
   *
   * **Value:** 2 (bit 1)
   * **Usage:** Audio from applications, music, or system sounds
   * **Display:** Shows soundshare indicator, no speaking indicator
   */
  Soundshare = 1 << 1,

  /**
   * Priority speaker (Stage channels)
   *
   * **Value:** 4 (bit 2)
   * **Usage:** Priority speaker status in stage channels
   * **Effect:** Lowers audio of other speakers when active
   */
  Priority = 1 << 2,
}

/**
 * DAVE Protocol Version
 *
 * Enumeration of Discord's end-to-end encryption protocol versions.
 * DAVE (Discord Audio Video Encryption) provides E2EE for voice and video in DMs,
 * Group DMs, voice channels, and Go Live streams.
 *
 * **Migration Timeline:** Discord is migrating to E2EE, with non-E2EE support
 * to be deprecated after at least a six month window.
 *
 * @see {@link https://daveprotocol.com}
 */
export enum DaveProtocolVersion {
  /**
   * No DAVE protocol support
   *
   * **Status:** Legacy mode, will be deprecated
   * **Encryption:** Transport encryption only (client ↔ server)
   * **Compatibility:** Works with all clients but provides less security
   */
  None = 0,

  /**
   * DAVE protocol version 1
   *
   * **Status:** Current implementation
   * **Encryption:** End-to-end encryption using MLS (Message Layer Security)
   * **Features:** Per-sender ratcheted media keys, forward secrecy
   */
  V1 = 1,
}

/**
 * Voice Audio Codec
 *
 * Enumeration of supported audio codecs for voice transmission.
 * Different codecs provide different quality, compression, and compatibility characteristics.
 *
 * **Standard:** Opus is the primary codec used for Discord voice due to its excellent
 * quality-to-bandwidth ratio and low latency characteristics.
 */
export enum VoiceAudioCodec {
  /**
   * Opus audio codec
   *
   * **Type:** Modern, low-latency audio codec
   * **Quality:** Excellent quality at various bitrates
   * **Use Case:** Primary codec for Discord voice communications
   */
  Opus = "opus",

  /**
   * PCM audio codec
   *
   * **Type:** Uncompressed Pulse Code Modulation
   * **Quality:** Perfect quality but high bandwidth
   * **Use Case:** Raw audio for special applications
   */
  Pcm = "pcm",
}

/**
 * Voice Video Codec
 *
 * Enumeration of supported video codecs for video transmission.
 * Different codecs provide different compression efficiency, quality, and hardware support.
 *
 * **Hardware Acceleration:** Many modern devices support hardware encoding/decoding
 * for H.264, providing better performance and battery life.
 */
export enum VoiceVideoCodec {
  /**
   * H.264 video codec
   *
   * **Type:** Advanced Video Coding (AVC)
   * **Support:** Widely supported with hardware acceleration
   * **Use Case:** Primary codec for most Discord video applications
   */
  H264 = "h264",

  /**
   * VP8 video codec
   *
   * **Type:** Open-source video codec by Google
   * **Support:** Good software support, limited hardware acceleration
   * **Use Case:** WebRTC-based applications and web clients
   */
  Vp8 = "vp8",

  /**
   * VP9 video codec
   *
   * **Type:** Successor to VP8 with better compression
   * **Support:** Modern browsers and devices
   * **Use Case:** High-quality video with efficient compression
   */
  Vp9 = "vp9",

  /**
   * AV1 video codec
   *
   * **Type:** Next-generation open video codec
   * **Support:** Growing support, excellent compression
   * **Use Case:** Future-oriented applications requiring maximum efficiency
   */
  Av1 = "av1",
}

/**
 * Voice Payload
 *
 * Base structure for all voice gateway payloads sent and received through the WebSocket.
 * Every voice gateway message follows this standardized format.
 *
 * **Binary Messages:** Some DAVE protocol opcodes are sent as binary data with a different
 * format that includes sequence numbers for reliable delivery.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-payloads}
 */
export interface VoicePayloadEntity<T = unknown> {
  /**
   * Opcode for the payload
   *
   * Determines how the payload should be processed and what data structure to expect.
   * Each opcode corresponds to a specific voice operation.
   */
  op: VoiceGatewayOpcode;

  /**
   * Event data
   *
   * The actual payload data, structure varies based on the opcode.
   * Can be an object, array, or primitive value depending on the operation.
   */
  d: T;

  /**
   * Sequence number (for binary messages only, server → client)
   *
   * Used for reliable message delivery in voice gateway version 8+.
   * Only present in server-to-client binary messages for message ordering and replay.
   */
  seq?: number;
}

/**
 * Voice Identify Data
 *
 * Payload data for the Identify operation to authenticate and establish a voice connection.
 * This is the first message sent after connecting to the voice WebSocket.
 *
 * **Authentication:** Uses the same user/bot token, session ID, and voice token from
 * the Voice State Update and Voice Server Update gateway events.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection}
 */
export interface VoiceIdentifyEntity {
  /**
   * Server ID (Guild ID)
   *
   * Identifies which guild's voice server this connection belongs to.
   * Must match the guild_id from the Voice Server Update event.
   */
  serverId: Snowflake;

  /**
   * User ID
   *
   * Identifies the user or bot establishing the voice connection.
   * Must match the authenticated user's ID.
   */
  userId: Snowflake;

  /**
   * Session ID from the gateway voice state update
   *
   * Session identifier received in the Voice State Update event.
   * Required for associating the voice connection with the gateway session.
   */
  sessionId: string;

  /**
   * Voice connection token from the gateway voice server update
   *
   * Authentication token received in the Voice Server Update event.
   * Provides authorization to connect to the specific voice server.
   */
  token: string;

  /**
   * Maximum DAVE protocol version supported (optional)
   *
   * Indicates the highest E2EE protocol version this client supports.
   * Omitting this field or setting to 0 indicates no E2EE support.
   */
  maxDaveProtocolVersion?: DaveProtocolVersion;
}

/**
 * Voice Ready Data
 *
 * Payload data received after successful identification. Provides essential connection
 * details needed to establish the UDP voice data connection.
 *
 * **Next Steps:** Use the provided IP and port for IP discovery, then send Select Protocol.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection}
 */
export interface VoiceReadyEntity {
  /**
   * Voice connection SSRC
   *
   * Synchronization Source identifier for this voice connection.
   * Used in RTP headers for voice packet identification and routing.
   */
  ssrc: number;

  /**
   * UDP server IP address
   *
   * IP address of the voice server for UDP voice data transmission.
   * Use this for IP discovery and subsequent voice packet transmission.
   */
  ip: string;

  /**
   * UDP server port
   *
   * Port number of the voice server for UDP voice data transmission.
   * Use this for IP discovery and subsequent voice packet transmission.
   */
  port: number;

  /**
   * Available encryption modes
   *
   * Array of encryption modes supported by the voice server.
   * Client must select one of these modes in the Select Protocol operation.
   */
  modes: VoiceEncryptionMode[];

  /**
   * Heartbeat interval in milliseconds (erroneous field, use Hello payload instead)
   *
   * **Warning:** This field is incorrect and should be ignored.
   * The actual heartbeat interval comes from the Hello payload (opcode 8).
   */
  heartbeatInterval: number;

  /**
   * Experiments enabled for this connection
   *
   * Array of experimental features enabled for this voice connection.
   * Used for A/B testing and gradual feature rollouts.
   */
  experiments?: string[];
}

/**
 * Voice Select Protocol Data
 *
 * Payload data for selecting the voice protocol and providing connection details.
 * Sent after completing IP discovery to inform the server of the selected configuration.
 *
 * **Timing:** Send after receiving Ready payload and completing IP discovery process.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 */
export interface VoiceSelectProtocolEntity {
  /**
   * Protocol to use for voice communication
   *
   * Specifies whether to use UDP or WebRTC for voice data transmission.
   * UDP is the standard protocol for most Discord voice implementations.
   */
  protocol: VoiceProtocol;

  /**
   * Protocol data containing connection details
   *
   * Contains the discovered external IP/port and selected encryption mode.
   * This information is used by the server to configure the voice session.
   */
  data: VoiceSelectProtocolDataInfoEntity;
}

/**
 * Voice Select Protocol Data Information
 *
 * Connection details discovered through IP discovery and client configuration.
 * These details are sent to the voice server to establish the voice session.
 *
 * **IP Discovery:** The address and port should be obtained through the IP discovery
 * process to ensure proper NAT traversal and connectivity.
 */
export interface VoiceSelectProtocolDataInfoEntity {
  /**
   * External IP address discovered through IP discovery
   *
   * The public IP address that the voice server should use to send voice data.
   * Obtained through the IP discovery process to handle NAT configurations.
   */
  address: string;

  /**
   * External port discovered through IP discovery
   *
   * The public port that the voice server should use to send voice data.
   * Obtained through the IP discovery process to handle NAT configurations.
   */
  port: number;

  /**
   * Selected encryption mode
   *
   * The encryption mode chosen from the available modes in the Ready payload.
   * Must be one of the modes supported by the voice server.
   */
  mode: VoiceEncryptionMode;
}

/**
 * Voice Session Description Data
 *
 * Payload data containing encryption and media configuration for the voice session.
 * Received after sending Select Protocol, provides the final session configuration.
 *
 * **Session Start:** After receiving this payload, the voice connection is ready
 * for sending speaking updates and voice data transmission.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-and-sending-voice}
 */
export interface VoiceSessionDescriptionEntity {
  /**
   * Selected encryption mode
   *
   * The encryption mode that will be used for voice data transmission.
   * Matches the mode selected in the Select Protocol operation.
   */
  mode: VoiceEncryptionMode;

  /**
   * Encryption secret key
   *
   * 32-byte array used for voice data encryption and decryption.
   * This key is used with the selected encryption mode for all voice packets.
   */
  secretKey: number[];

  /**
   * Audio codec used
   *
   * The audio codec that will be used for voice transmission.
   * Typically Opus for high-quality audio compression.
   */
  audioCodec?: VoiceAudioCodec;

  /**
   * Video codec used
   *
   * The video codec that will be used for video transmission.
   * Various codecs supported depending on client and server capabilities.
   */
  videoCodec?: VoiceVideoCodec;

  /**
   * Media session ID
   *
   * Unique identifier for this media session.
   * Used for tracking and debugging voice connection issues.
   */
  mediaSessionId?: string;

  /**
   * DAVE protocol version being used
   *
   * The E2EE protocol version negotiated for this session.
   * If present and > 0, end-to-end encryption is enabled.
   */
  daveProtocolVersion?: DaveProtocolVersion;
}

/**
 * Voice Heartbeat Data
 *
 * Payload data for heartbeat messages to maintain the voice connection.
 * Heartbeats must be sent at the interval specified in the Hello payload.
 *
 * **Timing:** Send at the interval from Hello payload to prevent connection timeout.
 * **Version 8+:** Must include sequence acknowledgment for reliable message delivery.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHeartbeatEntity {
  /**
   * Nonce value for heartbeat identification
   *
   * Unique identifier for this heartbeat, typically a timestamp.
   * Used to match heartbeat acknowledgments with sent heartbeats.
   */
  nonce: number;

  /**
   * Sequence acknowledgment (required for gateway version 8+)
   *
   * Sequence number of the last numbered message received from the gateway.
   * Used for reliable message delivery and resume functionality.
   */
  seqAck?: number;
}

/**
 * Voice Heartbeat ACK Data
 *
 * Payload data acknowledging a received heartbeat from the client.
 * Contains the nonce from the original heartbeat for correlation.
 *
 * **Latency Calculation:** Use the time difference between sending heartbeat
 * and receiving ACK to calculate connection latency.
 */
export interface VoiceHeartbeatAckEntity {
  /**
   * Nonce value from the original heartbeat
   *
   * The same nonce value that was sent in the heartbeat.
   * Used to correlate ACKs with specific heartbeat messages.
   */
  nonce: number;
}

/**
 * Voice Hello Data
 *
 * Payload data providing the heartbeat interval for connection maintenance.
 * This is the first message received after connecting to the voice WebSocket.
 *
 * **Important:** Use this interval, not the one in the Ready payload which is incorrect.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHelloEntity {
  /**
   * Heartbeat interval in milliseconds
   *
   * The interval at which the client should send heartbeat messages.
   * This is the authoritative heartbeat interval, not the one in Ready payload.
   */
  heartbeatInterval: number;
}

/**
 * Voice Speaking Data
 *
 * Payload data indicating speaking status and user information for voice transmission.
 * Must be sent before transmitting voice data and can be sent to update speaking state.
 *
 * **Requirement:** Send at least once before sending voice data to avoid disconnection
 * with invalid SSRC error.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export interface VoiceSpeakingEntity {
  /**
   * Speaking flags as a bitfield
   *
   * Indicates what type of audio is being transmitted.
   * Can be combined (e.g., Microphone | Priority = 5).
   */
  speaking: SpeakingFlags;

  /**
   * Delay in milliseconds
   *
   * Audio processing delay for this speaker.
   * Should be set to 0 for bots using the voice gateway.
   */
  delay?: number;

  /**
   * Voice connection SSRC
   *
   * Synchronization Source identifier for this voice connection.
   * Must match the SSRC provided in the Ready payload.
   */
  ssrc: number;

  /**
   * User ID (when received from server)
   *
   * ID of the user whose speaking state changed.
   * Only present in server-to-client speaking updates.
   */
  user_id?: Snowflake;
}

/**
 * Voice Resume Data
 *
 * Payload data for resuming a previous voice connection after disconnection.
 * Used instead of Identify when reconnecting to an existing session.
 *
 * **Use Case:** Recover from temporary network issues without full re-authentication.
 * **Fallback:** If resume fails, fall back to full Identify flow.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#resuming-voice-connection}
 */
export interface VoiceResumeEntity {
  /**
   * Server ID (Guild ID)
   *
   * Must match the server ID from the original session.
   * Used to validate the resume request.
   */
  server_id: Snowflake;

  /**
   * Session ID
   *
   * Session identifier from the original connection.
   * Used to identify which session to resume.
   */
  session_id: string;

  /**
   * Voice connection token
   *
   * Authentication token for the voice connection.
   * Must be valid and match the original session.
   */
  token: string;
}

/**
 * Voice Video Sink Wants Data
 *
 * Payload data requesting video streams from specific users in the voice channel.
 * Used for performance optimization by selectively receiving video streams.
 *
 * **Performance:** Allows clients to request only the video streams they need,
 * reducing bandwidth and processing requirements.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#video-sink-wants}
 */
export interface VoiceVideoSinkWantsEntity {
  /**
   * Array of user SSRCs to receive video from
   *
   * List of users whose video streams should be sent to this client.
   * Each entry can specify quality preferences for the video stream.
   */
  wants: Array<{
    /**
     * User SSRC
     *
     * Synchronization Source identifier for the user's video stream.
     * Identifies which user's video is being requested.
     */
    ssrc: number;

    /**
     * Video quality settings
     *
     * Preferred quality configuration for this video stream.
     * Server will attempt to honor these preferences when possible.
     */
    quality?: VoiceVideoQualityEntity;
  }>;
}

/**
 * Voice Channel Options Data
 *
 * Payload data providing channel-specific configuration options for audio and video.
 * Contains settings that can be dynamically adjusted based on channel requirements.
 *
 * **Dynamic Configuration:** These settings can change during a voice session
 * based on channel policies and server performance.
 */
export interface VoiceChannelOptionsEntity {
  /**
   * Audio quality settings
   *
   * Recommended audio quality configuration for this channel.
   * Clients should adjust their encoding parameters accordingly.
   */
  audio_quality?: VoiceAudioQualityEntity;

  /**
   * Video quality settings
   *
   * Recommended video quality configuration for this channel.
   * Clients should adjust their encoding parameters accordingly.
   */
  video_quality?: VoiceVideoQualityEntity;

  /**
   * Auto gain control enabled
   *
   * Indicates whether automatic gain control should be applied.
   * Helps normalize audio levels across different microphones.
   */
  auto_gain_control?: boolean;

  /**
   * Echo cancellation enabled
   *
   * Indicates whether echo cancellation should be applied.
   * Reduces feedback between speakers and microphones.
   */
  echo_cancellation?: boolean;

  /**
   * Noise suppression enabled
   *
   * Indicates whether noise suppression should be applied.
   * Reduces background noise in voice transmission.
   */
  noise_suppression?: boolean;

  /**
   * Noise gate enabled
   *
   * Indicates whether noise gate should be applied.
   * Mutes audio below a certain threshold to eliminate background noise.
   */
  noise_gate?: boolean;
}

/**
 * Voice Code Version Data
 *
 * Payload data providing version information about the voice server.
 * Used for compatibility checking and feature capability detection.
 *
 * **Compatibility:** Clients can use this information to adjust behavior
 * based on server capabilities and known version differences.
 */
export interface VoiceCodeVersionEntity {
  /**
   * Voice server version
   *
   * Version string identifying the voice server software version.
   * Format may vary but typically includes major and minor version numbers.
   */
  version: string;

  /**
   * Build information
   *
   * Additional build details such as build number or commit hash.
   * Useful for detailed debugging and support scenarios.
   */
  build?: string;
}

/**
 * Voice Audio Quality
 *
 * Configuration options for audio transmission quality and processing.
 * These settings control the balance between audio quality and bandwidth usage.
 *
 * **Adaptive Quality:** Settings may be adjusted automatically based on network
 * conditions and server recommendations.
 */
export interface VoiceAudioQualityEntity {
  /**
   * Audio bitrate in kbps
   *
   * Target bitrate for audio encoding. Higher values provide better quality
   * but require more bandwidth. Typical range: 8-512 kbps.
   */
  bitrate?: number;

  /**
   * Sample rate in Hz
   *
   * Audio sampling frequency. Higher rates provide better frequency response.
   * Common values: 8000, 16000, 24000, 48000 Hz.
   */
  sample_rate?: number;

  /**
   * Number of audio channels
   *
   * Channel configuration for audio transmission.
   * 1 = mono, 2 = stereo. Discord typically uses stereo (2 channels).
   */
  channels?: number;

  /**
   * Packet loss concealment enabled
   *
   * Whether to enable audio recovery techniques for lost packets.
   * Improves audio quality in poor network conditions.
   */
  packet_loss_concealment?: boolean;

  /**
   * Forward error correction enabled
   *
   * Whether to include redundant data for error recovery.
   * Increases bandwidth but improves reliability.
   */
  forward_error_correction?: boolean;

  /**
   * Discontinuous transmission enabled
   *
   * Whether to reduce transmission during silence periods.
   * Saves bandwidth by not transmitting during quiet periods.
   */
  discontinuous_transmission?: boolean;
}

/**
 * Voice Video Quality
 *
 * Configuration options for video transmission quality and performance.
 * These settings control the balance between video quality and system resources.
 *
 * **Performance Impact:** Higher quality settings require more CPU/GPU resources
 * and network bandwidth.
 */
export interface VoiceVideoQualityEntity {
  /**
   * Video width in pixels
   *
   * Horizontal resolution of the video stream.
   * Common values: 320, 640, 1280, 1920 pixels.
   */
  width?: number;

  /**
   * Video height in pixels
   *
   * Vertical resolution of the video stream.
   * Common values: 240, 480, 720, 1080 pixels.
   */
  height?: number;

  /**
   * Frame rate in fps
   *
   * Number of video frames per second.
   * Common values: 15, 30, 60 fps. Higher rates provide smoother motion.
   */
  framerate?: number;

  /**
   * Video bitrate in kbps
   *
   * Target bitrate for video encoding. Higher values provide better quality
   * but require more bandwidth. Typical range: 100-8000 kbps.
   */
  bitrate?: number;

  /**
   * Hardware acceleration enabled
   *
   * Whether to use hardware encoding/decoding when available.
   * Improves performance and reduces CPU usage on supported devices.
   */
  hardware_acceleration?: boolean;
}

/**
 * Voice Gateway Receive Payloads
 *
 * Comprehensive mapping of voice gateway opcodes to their corresponding data interfaces
 * for payloads received from Discord through the Voice Gateway connection.
 * These are the payloads that clients can receive from the voice server.
 *
 * This interface serves as a type-safe registry of all possible voice gateway receive
 * operations and their expected data structures.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-payloads}
 */
export interface VoiceReceivePayloads {
  /**
   * Voice connection is ready for UDP setup.
   * Contains SSRC, IP, port, and available encryption modes.
   */
  [VoiceGatewayOpcode.Ready]: VoiceReadyEntity;

  /**
   * Session description with encryption and media configuration.
   * Contains secret key, encryption mode, and codec information.
   */
  [VoiceGatewayOpcode.SessionDescription]: VoiceSessionDescriptionEntity;

  /**
   * Acknowledgment of a received heartbeat.
   * Contains the nonce from the original heartbeat for correlation.
   */
  [VoiceGatewayOpcode.HeartbeatAck]: VoiceHeartbeatAckEntity;

  /**
   * Initial message with heartbeat interval.
   * Provides the authoritative heartbeat timing for connection maintenance.
   */
  [VoiceGatewayOpcode.Hello]: VoiceHelloEntity;

  /**
   * Speaking state update from another user.
   * Indicates what type of audio another user is transmitting.
   */
  [VoiceGatewayOpcode.Speaking]: VoiceSpeakingEntity;

  /**
   * Confirmation of successful session resume.
   * Indicates the voice connection has been restored without re-identification.
   */
  [VoiceGatewayOpcode.Resumed]: null;

  /**
   * Channel-specific audio/video configuration options.
   * Provides recommended settings for this voice channel.
   */
  [VoiceGatewayOpcode.ChannelOptionsUpdate]: VoiceChannelOptionsEntity;

  /**
   * Voice server version information.
   * Used for compatibility checking and feature detection.
   */
  [VoiceGatewayOpcode.CodeVersion]: VoiceCodeVersionEntity;
}

/**
 * Voice Gateway Send Payloads
 *
 * Mapping of voice gateway opcodes to their corresponding data interfaces for sending
 * payloads to Discord through the Voice Gateway connection. These are the operations
 * and data structures that clients can send to the voice server.
 *
 * This interface serves as a type-safe registry of all voice gateway operations
 * that can be sent by the client.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-payloads}
 */
export interface VoiceSendPayloads {
  /**
   * Initiate voice connection with authentication.
   * Must be the first operation sent after connecting to the voice WebSocket.
   */
  [VoiceGatewayOpcode.Identify]: VoiceIdentifyEntity;

  /**
   * Select voice protocol and provide connection details.
   * Sent after IP discovery to configure the voice session.
   */
  [VoiceGatewayOpcode.SelectProtocol]: VoiceSelectProtocolEntity;

  /**
   * Maintain connection with periodic heartbeat.
   * Must be sent at the interval specified in the Hello payload.
   */
  [VoiceGatewayOpcode.Heartbeat]: VoiceHeartbeatEntity;

  /**
   * Update speaking status and user information.
   * Must be sent before transmitting voice data to avoid disconnection.
   */
  [VoiceGatewayOpcode.Speaking]: VoiceSpeakingEntity;

  /**
   * Resume a previous voice connection after disconnection.
   * Used instead of Identify when reconnecting to an existing session.
   */
  [VoiceGatewayOpcode.Resume]: VoiceResumeEntity;

  /**
   * Request specific video streams for performance optimization.
   * Allows selective video reception to reduce bandwidth usage.
   */
  [VoiceGatewayOpcode.VideoSinkWants]: VoiceVideoSinkWantsEntity;
}
