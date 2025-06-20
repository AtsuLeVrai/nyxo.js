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
   * Clients connect notification.
   *
   * **Direction:** Server → Client
   * **Purpose:** Notification that one or more clients have connected to the voice channel.
   * **Contains:** User information for newly connected clients.
   */
  ClientsConnect = 11,

  /**
   * Code version.
   *
   * **Direction:** Server → Client
   * **Purpose:** Provides voice server version information for compatibility.
   * **Use Case:** Helps clients adapt behavior based on server capabilities.
   */
  CodeVersion = 12,

  /**
   * Client disconnect notification.
   *
   * **Direction:** Server → Client
   * **Purpose:** Notification that a client has disconnected from the voice channel.
   * **Contains:** User information for disconnected client.
   */
  ClientDisconnect = 13,

  /**
   * DAVE Protocol Prepare Transition.
   *
   * **Direction:** Server → Client
   * **Purpose:** Announces an upcoming downgrade from the DAVE protocol.
   * **DAVE:** Used when transitioning away from E2EE due to incompatible clients.
   */
  DavePrepareTransition = 21,

  /**
   * DAVE Protocol Execute Transition.
   *
   * **Direction:** Server → Client
   * **Purpose:** Execute a previously announced protocol transition.
   * **DAVE:** Confirms that the protocol transition should be applied.
   */
  DaveExecuteTransition = 22,

  /**
   * DAVE Protocol Transition Ready.
   *
   * **Direction:** Client → Server
   * **Purpose:** Acknowledge readiness for previously announced transition.
   * **DAVE:** Indicates client has prepared for the protocol transition.
   */
  DaveTransitionReady = 23,

  /**
   * DAVE Protocol Prepare Epoch.
   *
   * **Direction:** Server → Client
   * **Purpose:** Announces a DAVE protocol version or MLS group change.
   * **DAVE:** Used for protocol upgrades and MLS epoch transitions.
   */
  DavePrepareEpoch = 24,

  /**
   * DAVE MLS External Sender Package.
   *
   * **Direction:** Server → Client (Binary)
   * **Purpose:** Provides credential and public key for MLS external sender.
   * **DAVE:** Required for MLS group creation and validation.
   */
  DaveMlsExternalSender = 25,

  /**
   * DAVE MLS Key Package.
   *
   * **Direction:** Client → Server (Binary)
   * **Purpose:** Sends MLS Key Package for pending group member.
   * **DAVE:** Required to be added to an MLS group.
   */
  DaveMlsKeyPackage = 26,

  /**
   * DAVE MLS Proposals.
   *
   * **Direction:** Server → Client (Binary)
   * **Purpose:** Sends MLS Proposals to be appended or revoked.
   * **DAVE:** Part of the MLS group management process.
   */
  DaveMlsProposals = 27,

  /**
   * DAVE MLS Commit Welcome.
   *
   * **Direction:** Client → Server (Binary)
   * **Purpose:** Sends MLS Commit with optional MLS Welcome messages.
   * **DAVE:** Commits pending proposals to advance MLS group epoch.
   */
  DaveMlsCommitWelcome = 28,

  /**
   * DAVE MLS Announce Commit Transition.
   *
   * **Direction:** Server → Client
   * **Purpose:** Announces MLS Commit to be processed for upcoming transition.
   * **DAVE:** Indicates the winning commit for MLS group transition.
   */
  DaveMlsAnnounceCommitTransition = 29,

  /**
   * DAVE MLS Welcome.
   *
   * **Direction:** Server → Client (Binary)
   * **Purpose:** Sends MLS Welcome to group for upcoming transition.
   * **DAVE:** Welcomes new members to the MLS group.
   */
  DaveMlsWelcome = 30,

  /**
   * DAVE MLS Invalid Commit Welcome.
   *
   * **Direction:** Client → Server
   * **Purpose:** Flag invalid commit or welcome, request re-add.
   * **DAVE:** Indicates unprocessable MLS commit or welcome message.
   */
  DaveMlsInvalidCommitWelcome = 31,
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
  Aes256GcmRtpSize = "aead_aes256_gcm_rtpsize",

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
  Aes256Gcm = "aead_aes256_gcm",

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
  server_id: string;

  /**
   * User ID
   *
   * Identifies the user or bot establishing the voice connection.
   * Must match the authenticated user's ID.
   */
  user_id: string;

  /**
   * Session ID from the gateway voice state update
   *
   * Session identifier received in the Voice State Update event.
   * Required for associating the voice connection with the gateway session.
   */
  session_id: string;

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
  max_dave_protocol_version?: DaveProtocolVersion;
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
  heartbeat_interval: number;
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
  secret_key: number[];

  /**
   * DAVE protocol version for this session
   *
   * The E2EE protocol version negotiated for this voice session.
   * May be lower than the client's maximum supported version.
   */
  dave_protocol_version?: DaveProtocolVersion;
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
  t: number;

  /**
   * Sequence acknowledgment (required for gateway version 8+)
   *
   * Sequence number of the last numbered message received from the gateway.
   * Used for reliable message delivery and resume functionality.
   */
  seq_ack?: number;
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
  t: number;
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
  heartbeat_interval: number;
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
  user_id?: string;
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
  server_id: string;

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

  /**
   * Sequence acknowledgment (required for gateway version 8+)
   *
   * Sequence number of the last numbered message received from the gateway.
   * Used for reliable message delivery and resume functionality.
   */
  seq_ack?: number; // Sequence acknowledgment for reliable delivery (optional, version 8+)
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
   * Notification of clients connecting to the voice channel.
   * Contains information about newly connected users.
   */
  [VoiceGatewayOpcode.ClientsConnect]: VoiceClientsConnectEntity;

  /**
   * Voice server version information.
   * Provides compatibility information for the voice server.
   */
  [VoiceGatewayOpcode.CodeVersion]: { version: string };

  /**
   * Notification of a client disconnecting from the voice channel.
   * Contains information about the disconnected user.
   */
  [VoiceGatewayOpcode.ClientDisconnect]: VoiceClientDisconnectEntity;

  /**
   * DAVE protocol transition preparation announcement.
   * Announces an upcoming downgrade from E2EE protocol.
   */
  [VoiceGatewayOpcode.DavePrepareTransition]: DavePrepareTransitionEntity;

  /**
   * DAVE protocol transition execution confirmation.
   * Confirms that a protocol transition should be applied.
   */
  [VoiceGatewayOpcode.DaveExecuteTransition]: DaveExecuteTransitionEntity;

  /**
   * DAVE protocol epoch preparation announcement.
   * Announces a protocol version change or MLS group transition.
   */
  [VoiceGatewayOpcode.DavePrepareEpoch]: DavePrepareEpochEntity;

  /**
   * DAVE MLS external sender package (binary).
   * Contains credential and public key for MLS external sender.
   */
  [VoiceGatewayOpcode.DaveMlsExternalSender]: DaveMlsExternalSenderEntity;

  /**
   * DAVE MLS proposals (binary).
   * Contains MLS proposals to be appended or revoked.
   */
  [VoiceGatewayOpcode.DaveMlsProposals]: DaveMlsProposalsEntity;

  /**
   * DAVE MLS announce commit transition.
   * Announces the winning MLS commit for a transition.
   */
  [VoiceGatewayOpcode.DaveMlsAnnounceCommitTransition]: DaveMlsAnnounceCommitTransitionEntity;

  /**
   * DAVE MLS welcome message (binary).
   * Contains MLS welcome message for group transition.
   */
  [VoiceGatewayOpcode.DaveMlsWelcome]: DaveMlsWelcomeEntity;
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
   * Request video streams from specific users.
   * Enables selective video reception for performance optimization.
   */
  [VoiceGatewayOpcode.VideoSinkWants]: { ssrcs: number[] };

  /**
   * DAVE protocol transition readiness acknowledgment.
   * Indicates client has prepared for a protocol transition.
   */
  [VoiceGatewayOpcode.DaveTransitionReady]: DaveTransitionReadyEntity;

  /**
   * DAVE MLS key package (binary).
   * Sends MLS key package for pending group member.
   */
  [VoiceGatewayOpcode.DaveMlsKeyPackage]: DaveMlsKeyPackageEntity;

  /**
   * DAVE MLS commit welcome (binary).
   * Sends MLS commit with optional welcome messages.
   */
  [VoiceGatewayOpcode.DaveMlsCommitWelcome]: DaveMlsCommitWelcomeEntity;

  /**
   * DAVE MLS invalid commit/welcome notification.
   * Flags invalid MLS commit or welcome, requests re-add.
   */
  [VoiceGatewayOpcode.DaveMlsInvalidCommitWelcome]: DaveMlsInvalidCommitWelcomeEntity;
}

/**
 * Voice Clients Connect Data
 *
 * Payload data for clients connect notification.
 * Contains information about users who have joined the voice channel.
 */
export interface VoiceClientsConnectEntity {
  /**
   * Array of user IDs that connected
   *
   * List of user IDs for clients that have joined the voice channel.
   */
  user_ids: string[];
}

/**
 * Voice Client Disconnect Data
 *
 * Payload data for client disconnect notification.
 * Contains information about a user who has left the voice channel.
 */
export interface VoiceClientDisconnectEntity {
  /**
   * User ID that disconnected
   *
   * The ID of the user who has left the voice channel.
   */
  user_id: string;
}

/**
 * DAVE Protocol Prepare Transition Data
 *
 * Payload data for DAVE protocol transition preparation.
 * Announces an upcoming downgrade from E2EE protocol.
 */
export interface DavePrepareTransitionEntity {
  /**
   * Unique identifier for this transition
   *
   * Used to coordinate the transition across all participants.
   */
  transition_id: string;

  /**
   * Target protocol version (typically 0 for downgrades)
   *
   * The DAVE protocol version to transition to.
   */
  dave_protocol_version: DaveProtocolVersion;
}

/**
 * DAVE Protocol Execute Transition Data
 *
 * Payload data for executing a previously announced protocol transition.
 * Confirms that the protocol transition should be applied immediately.
 */
export interface DaveExecuteTransitionEntity {
  /**
   * Transition identifier matching the prepare transition
   *
   * Must match the transition_id from the corresponding prepare transition.
   */
  transition_id: string;
}

/**
 * DAVE Protocol Transition Ready Data
 *
 * Payload data for indicating readiness for a protocol transition.
 * Sent by clients to acknowledge they are prepared for the transition.
 */
export interface DaveTransitionReadyEntity {
  /**
   * Transition identifier
   *
   * Must match the transition_id from the corresponding prepare transition.
   */
  transition_id: string;
}

/**
 * DAVE Protocol Prepare Epoch Data
 *
 * Payload data for DAVE protocol epoch preparation.
 * Announces a protocol version change or MLS group transition.
 */
export interface DavePrepareEpochEntity {
  /**
   * Unique identifier for this transition
   *
   * Used to coordinate the epoch transition across all participants.
   */
  transition_id: string;

  /**
   * MLS epoch identifier
   *
   * The epoch ID for the upcoming MLS group state.
   * Value of 1 indicates a new MLS group is being created.
   */
  epoch_id: number;

  /**
   * DAVE protocol version for the new epoch
   *
   * The protocol version that will be used after the transition.
   */
  dave_protocol_version: DaveProtocolVersion;
}

/**
 * DAVE MLS External Sender Package Data
 *
 * Binary payload containing external sender credentials for MLS group.
 * This is a binary opcode with variable-length payload format.
 */
export interface DaveMlsExternalSenderEntity {
  /**
   * Binary MLS external sender package
   *
   * Contains the credential and public key for the MLS external sender.
   * Format is defined by the DAVE protocol specification.
   */
  external_sender_package: Uint8Array;
}

/**
 * DAVE MLS Key Package Data
 *
 * Binary payload containing an MLS key package for pending group member.
 * This is a binary opcode with variable-length payload format.
 */
export interface DaveMlsKeyPackageEntity {
  /**
   * Binary MLS key package
   *
   * MLS key package for a pending group member.
   * Format is defined by the MLS specification.
   */
  key_package: Uint8Array;
}

/**
 * DAVE MLS Proposals Data
 *
 * Binary payload containing MLS proposals to be processed.
 * This is a binary opcode with variable-length payload format.
 */
export interface DaveMlsProposalsEntity {
  /**
   * Binary MLS proposals
   *
   * MLS proposals that must be appended or revoked.
   * Format is defined by the MLS specification.
   */
  proposals: Uint8Array;
}

/**
 * DAVE MLS Commit Welcome Data
 *
 * Binary payload containing MLS commit and optional welcome messages.
 * This is a binary opcode with variable-length payload format.
 */
export interface DaveMlsCommitWelcomeEntity {
  /**
   * Binary MLS commit message
   *
   * MLS commit message committing pending proposals.
   * Format is defined by the MLS specification.
   */
  commit: Uint8Array;

  /**
   * Optional binary MLS welcome messages
   *
   * MLS welcome messages for new group members (if any).
   * Only present when the commit adds new members to the group.
   */
  welcome?: Uint8Array;
}

/**
 * DAVE MLS Announce Commit Transition Data
 *
 * Payload announcing the winning MLS commit for a transition.
 * Contains the commit and transition information.
 */
export interface DaveMlsAnnounceCommitTransitionEntity {
  /**
   * Transition identifier
   *
   * Must match the transition_id from the corresponding prepare epoch.
   */
  transition_id: string;

  /**
   * Binary MLS commit message
   *
   * The winning MLS commit to be processed for the transition.
   * Format is defined by the MLS specification.
   */
  commit: Uint8Array;
}

/**
 * DAVE MLS Welcome Data
 *
 * Binary payload containing MLS welcome message for group transition.
 * This is a binary opcode with variable-length payload format.
 */
export interface DaveMlsWelcomeEntity {
  /**
   * Transition identifier
   *
   * Must match the transition_id from the corresponding announce commit.
   */
  transition_id: string;

  /**
   * Binary MLS welcome message
   *
   * MLS welcome message for joining the group.
   * Format is defined by the MLS specification.
   */
  welcome: Uint8Array;
}

/**
 * DAVE MLS Invalid Commit Welcome Data
 *
 * Payload for flagging invalid MLS commit or welcome messages.
 * Requests removal and re-addition to the MLS group.
 */
export interface DaveMlsInvalidCommitWelcomeEntity {
  /**
   * Transition identifier (if applicable)
   *
   * The transition_id of the invalid commit or welcome.
   * May be omitted if not related to a specific transition.
   */
  transition_id?: string;

  /**
   * Reason for invalidity
   *
   * Human-readable description of why the commit or welcome was invalid.
   */
  reason?: string;
}
