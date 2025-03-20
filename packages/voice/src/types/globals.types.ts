/**
 * Voice Connection Gateway Version
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-gateway-versioning-gateway-versions}
 */
export enum VoiceGatewayVersion {
  /**
   * Initial voice gateway version
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V1 = 1,

  /**
   * Deprecated voice gateway version 2
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V2 = 2,

  /**
   * Deprecated voice gateway version 3
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V3 = 3,

  /**
   * Available voice gateway version 4
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V4 = 4,

  /**
   * Available voice gateway version 5
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V5 = 5,

  /**
   * Available voice gateway version 6
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V6 = 6,

  /**
   * Available voice gateway version 7
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead
   */
  V7 = 7,

  /**
   * Recommended voice gateway version 8
   */
  V8 = 8,
}

/**
 * Voice opcodes for Discord voice connections
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-opcodes}
 */
export enum VoiceOpcodes {
  /**
   * Begin a voice websocket connection.
   * Direction: client → server
   */
  Identify = 0,

  /**
   * Select the voice protocol.
   * Direction: client → server
   */
  SelectProtocol = 1,

  /**
   * Complete the websocket handshake.
   * Direction: server → client
   */
  Ready = 2,

  /**
   * Keep the websocket connection alive.
   * Direction: client → server
   */
  Heartbeat = 3,

  /**
   * Describe the session.
   * Direction: server → client
   */
  SessionDescription = 4,

  /**
   * Indicate which users are speaking.
   * Direction: client ↔ server (bidirectional)
   */
  Speaking = 5,

  /**
   * Sent to acknowledge a received client heartbeat.
   * Direction: server → client
   */
  HeartbeatAck = 6,

  /**
   * Resume a connection.
   * Direction: client → server
   */
  Resume = 7,

  /**
   * Time to wait between sending heartbeats in milliseconds.
   * Direction: server → client
   */
  Hello = 8,

  /**
   * Acknowledge a successful session resume.
   * Direction: server → client
   */
  Resumed = 9,

  /**
   * One or more clients have connected to the voice channel.
   * Direction: server → client
   */
  ClientsConnect = 11,

  /**
   * A client has disconnected from the voice channel.
   * Direction: server → client
   */
  ClientDisconnect = 13,

  /**
   * A downgrade from the DAVE protocol is upcoming.
   * Direction: server → client
   */
  DavePrepareTransition = 21,

  /**
   * Execute a previously announced protocol transition.
   * Direction: server → client
   */
  DaveExecuteTransition = 22,

  /**
   * Acknowledge readiness for previously announced transition.
   * Direction: client → server
   */
  DaveTransitionReady = 23,

  /**
   * A DAVE protocol version or group change is upcoming.
   * Direction: server → client
   */
  DavePrepareEpoch = 24,

  /**
   * Credential and public key for MLS external sender.
   * Direction: server → client
   */
  DaveMlsExternalSender = 25,

  /**
   * MLS Key Package for pending group member.
   * Direction: client → server
   */
  DaveMlsKeyPackage = 26,

  /**
   * MLS Proposals to be appended or revoked.
   * Direction: server → client
   */
  DaveMlsProposals = 27,

  /**
   * MLS Commit with optional MLS Welcome messages.
   * Direction: client → server
   */
  DaveMlsCommitWelcome = 28,

  /**
   * MLS Commit to be processed for upcoming transition.
   * Direction: server → client
   */
  DaveMlsAnnounceCommitTransition = 29,

  /**
   * MLS Welcome to group for upcoming transition.
   * Direction: server → client
   */
  DaveMlsWelcome = 30,

  /**
   * Flag invalid commit or welcome, request re-add.
   * Direction: client → server
   */
  DaveMlsInvalidCommitWelcome = 31,

  /**
   * Request soundboard sounds from the server.
   * Direction: client → server
   */
  RequestSoundboardSounds = 31,
}

/**
 * Voice encryption modes
 *
 * Only AeadAes256GcmRtpsize and AeadXChaCha20Poly1305Rtpsize are supported by Discord
 */
export enum EncryptionMode {
  /**
   * AES-256-GCM (RTP Size) encryption - Recommended
   */
  AeadAes256GcmRtpsize = "aead_aes256_gcm_rtpsize",

  /**
   * XChaCha20 Poly1305 (RTP Size) encryption - Required
   */
  AeadXChaCha20Poly1305Rtpsize = "aead_xchacha20_poly1305_rtpsize",

  /**
   * Deprecated - XSalsa20 Poly1305 Lite (RTP Size) encryption
   * @deprecated Use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize instead
   */
  XSalsa20Poly1305LiteRtpsize = "xsalsa20_poly1305_lite_rtpsize",

  /**
   * Deprecated - AES-GCM encryption
   * @deprecated Use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize instead
   */
  AeadAes256Gcm = "aead_aes256_gcm",

  /**
   * Deprecated - XSalsa20 Poly1305 encryption
   * @deprecated Use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize instead
   */
  XSalsa20Poly1305 = "xsalsa20_poly1305",

  /**
   * Deprecated - XSalsa20 Poly1305 Suffix encryption
   * @deprecated Use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize instead
   */
  XSalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",

  /**
   * Deprecated - XSalsa20 Poly1305 Lite encryption
   * @deprecated Use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize instead
   */
  XSalsa20Poly1305Lite = "xsalsa20_poly1305_lite",
}

/**
 * Voice connection speaking modes
 *
 * Used as bitflags to indicate different speaking states
 * These flags can be combined with bitwise OR operations
 *
 * @example
 * // Set speaking with microphone and priority
 * const flags = SpeakingFlags.Microphone | SpeakingFlags.Priority;
 */
export enum SpeakingFlags {
  /**
   * Normal transmission of voice audio
   */
  Microphone = 1 << 0, // Value: 1

  /**
   * Transmission of context audio for video, no speaking indicator
   * Used for screen sharing with audio
   */
  Soundshare = 1 << 1, // Value: 2

  /**
   * Priority speaker, lowering audio of other speakers
   */
  Priority = 1 << 2, // Value: 4
}

/**
 * Non-resumable close codes for voice connections
 *
 * These close codes indicate that a session cannot be resumed and a full reconnection is needed
 */
export const NON_RESUMABLE_VOICE_CLOSE_CODES: number[] = [
  4004, 4014, 4016,
] as const;

/**
 * Voice packet structure for RTP audio transmission
 *
 * Discord voice data is sent using RTP (Real-time Transport Protocol).
 * This interface defines the structure of those packets according to
 * Discord's voice implementation.
 */
export interface VoicePacket {
  /**
   * Version and flags (should be 0x80)
   * The first byte of the RTP header
   * 0x80 represents RTP version 2 with no padding, extensions, or CSRC
   */
  version: number;

  /**
   * Payload type (0x78 for voice audio)
   * The second byte of the RTP header
   * Discord uses 0x78 (120) for Opus audio
   */
  payloadType: number;

  /**
   * Sequence number (incremental counter)
   * Used to detect packet loss and reordering
   * Represented as a 16-bit unsigned integer
   */
  sequence: number;

  /**
   * Timestamp (in samples at 48kHz)
   * Represents the sampling instant of the first octet in the payload
   * Typically increments by the number of samples in each packet
   */
  timestamp: number;

  /**
   * Synchronization Source identifier (SSRC)
   * Assigned by Discord to uniquely identify the sender
   * Represented as a 32-bit unsigned integer
   */
  ssrc: number;

  /**
   * Opus encoded audio data to transmit
   * This is the actual audio payload that will be encrypted
   */
  data: Buffer;
}

/**
 * Base voice payload entity structure
 *
 * @template T - Type of the payload data
 */
export interface VoicePayloadEntity<T = unknown> {
  /**
   * Opcode identifying the payload type
   */
  op: VoiceOpcodes;

  /**
   * Payload data specific to the opcode
   */
  d: T;

  /**
   * Sequence number (for some payloads)
   */
  s?: number | null;

  /**
   * Event name (for some payloads)
   */
  t?: string | null;
}

/**
 * Voice Identify payload entity
 *
 * Sent to begin a voice websocket connection
 * Direction: client → server (Opcode 0)
 */
export interface VoiceIdentify {
  /**
   * Server ID (guild ID)
   */
  server_id: string;

  /**
   * User ID
   */
  user_id: string;

  /**
   * Session ID from the gateway
   */
  session_id: string;

  /**
   * Voice token from the voice server update
   */
  token: string;

  /**
   * Optional: Maximum DAVE protocol version supported
   * Set to 0 to indicate no DAVE protocol support
   * Required for v8+ of the voice gateway
   */
  max_dave_protocol_version?: number;
}

/**
 * Voice Select Protocol payload entity
 *
 * Sent to select the voice protocol after IP discovery
 * Direction: client → server (Opcode 1)
 */
export interface VoiceSelectProtocol {
  /**
   * Protocol type ("udp")
   */
  protocol: "udp";

  /**
   * Connection data
   */
  data: {
    /**
     * External IP address discovered through IP discovery
     */
    address: string;

    /**
     * External port discovered through IP discovery
     */
    port: number;

    /**
     * Encryption mode to use
     * Should be one of the modes supported by the server
     */
    mode: EncryptionMode;
  };
}

/**
 * Voice Ready payload entity
 *
 * Received after identifying to complete the websocket handshake
 * Direction: server → client (Opcode 2)
 */
export interface VoiceReady {
  /**
   * Voice SSRC assigned to this connection
   * Used to identify packets from this user
   */
  ssrc: number;

  /**
   * Voice server IP for UDP connection
   */
  ip: string;

  /**
   * Voice server port for UDP connection
   */
  port: number;

  /**
   * Available encryption modes supported by the server
   */
  modes: EncryptionMode[];

  /**
   * Heartbeat interval in milliseconds
   * This field is deprecated and should be ignored
   * Use the Hello opcode's heartbeat_interval instead
   */
  heartbeat_interval?: number;
}

/**
 * Voice Hello payload entity
 *
 * Received immediately after connecting to the voice WebSocket
 * Direction: server → client (Opcode 8)
 */
export interface VoiceHello {
  /**
   * Heartbeat interval in milliseconds
   * How often the client should send heartbeats
   */
  heartbeat_interval: number;
}

/**
 * Voice Heartbeat payload entity (v8+)
 *
 * Sent to keep the WebSocket connection alive
 * Direction: client → server (Opcode 3)
 */
export interface VoiceHeartbeat {
  /**
   * Current timestamp or nonce
   */
  t: number;

  /**
   * Last sequence number received
   * Required for v8+ of the voice gateway
   */
  seq_ack: number;
}

/**
 * Voice Session Description payload entity
 *
 * Received after selecting a protocol to describe the session
 * Direction: server → client (Opcode 4)
 */
export interface VoiceSessionDescription {
  /**
   * Selected encryption mode
   */
  mode: EncryptionMode;

  /**
   * Secret key for encryption (32 bytes)
   */
  secret_key: number[];

  /**
   * DAVE protocol version, if applicable
   * Only present in v8+ with DAVE protocol support
   */
  dave_protocol_version?: number;
}

/**
 * Voice Speaking payload entity
 *
 * Sent to indicate a client is speaking
 * Direction: client → server (Opcode 5)
 */
export interface VoiceSpeaking {
  /**
   * Speaking flags bitfield
   * @see SpeakingFlags
   */
  speaking: number;

  /**
   * Delay in milliseconds (should be 0 for bots)
   */
  delay: number;

  /**
   * SSRC of the speaking user
   */
  ssrc: number;
}

/**
 * Voice Resume payload entity
 *
 * Sent to resume a disconnected session
 * Direction: client → server (Opcode 7)
 */
export interface VoiceResume {
  /**
   * Server ID (guild ID)
   */
  server_id: string;

  /**
   * Session ID from the gateway
   */
  session_id: string;

  /**
   * Voice token from the voice server update
   */
  token: string;

  /**
   * Last received sequence number
   * Required for v8+ of the voice gateway
   */
  seq_ack?: number;
}

/**
 * Client Connect payload entity
 *
 * Received when a user connects to the voice channel
 * Direction: server → client (Opcode 11)
 */
export interface VoiceClientConnect {
  /**
   * User ID of the client that connected
   */
  user_id: string;

  /**
   * Audio SSRC assigned to the user
   */
  audio_ssrc: number;

  /**
   * Video SSRC if the user has video enabled
   */
  video_ssrc?: number;

  /**
   * Whether the user is muted
   */
  mute?: boolean;

  /**
   * Whether the user is deafened
   */
  deaf?: boolean;
}

/**
 * Client Disconnect payload entity
 *
 * Received when a user disconnects from the voice channel
 * Direction: server → client (Opcode 13)
 */
export interface VoiceClientDisconnect {
  /**
   * User ID of the client that disconnected
   */
  user_id: string;
}

/**
 * Base interface for all voice events
 */
export interface VoiceEventBase {
  /** Timestamp when the event occurred (ISO string) */
  timestamp: string;
}

/**
 * Event emitted when connecting to voice
 */
export interface VoiceConnectingEvent extends VoiceEventBase {
  /** Guild ID */
  serverId: string | null;

  /** Channel ID */
  channelId: string | null;
}

/**
 * Event emitted when connected to voice
 */
export interface VoiceConnectedEvent extends VoiceEventBase {
  /** Guild ID */
  serverId: string;

  /** Channel ID */
  channelId: string;
}

/**
 * Event emitted when a voice connection fails
 */
export interface VoiceConnectionFailureEvent extends VoiceEventBase {
  /** Guild ID */
  serverId: string | null;

  /** Channel ID */
  channelId: string | null;

  /** Current retry attempt number (1-based) */
  attempt: number;

  /** Error that caused the failure */
  error: Error;
}

/**
 * Event emitted when disconnected from voice
 */
export interface VoiceDisconnectedEvent extends VoiceEventBase {
  /** Close code */
  code: number;

  /** Close reason */
  reason: string;

  /** Guild ID */
  serverId: string | null;

  /** Channel ID */
  channelId: string | null;
}

/**
 * Event emitted when ready to send/receive voice
 */
export interface VoiceReadyEvent extends VoiceEventBase {
  /** SSRC assigned to this connection */
  ssrc: number;

  /** Public IP address */
  ip: string;

  /** Public port */
  port: number;

  /** Selected encryption mode */
  encryptionMode: string;
}

/**
 * Event emitted when heartbeat interval starts
 */
export interface VoiceHeartbeatStartEvent extends VoiceEventBase {
  /** Heartbeat interval in milliseconds */
  interval: number;

  /** Initial delay before first heartbeat */
  initialDelay: number;
}

/**
 * Event emitted when a heartbeat is sent
 */
export interface VoiceHeartbeatSendEvent extends VoiceEventBase {
  /** Nonce value */
  nonce: number;

  /** Total heartbeats sent */
  total: number;
}

/**
 * Event emitted when a heartbeat is acknowledged
 */
export interface VoiceHeartbeatAckEvent extends VoiceEventBase {
  /** Latency in milliseconds */
  latency: number;
}

/**
 * Event emitted when a heartbeat times out
 */
export interface VoiceHeartbeatTimeoutEvent extends VoiceEventBase {
  /** Number of consecutive missed heartbeats */
  missedHeartbeats: number;

  /** Maximum retries configured */
  maxRetries: number;
}

/**
 * Event emitted when reconnecting to voice
 */
export interface VoiceReconnectingEvent extends VoiceEventBase {
  /** Current reconnection attempt (1-based) */
  attempt: number;

  /** Delay before reconnection in milliseconds */
  delay: number;

  /** Session ID being resumed */
  sessionId: string | null;
}

/**
 * Event emitted when IP discovery completes
 */
export interface VoiceIpDiscoveryEvent extends VoiceEventBase {
  /** Discovered IP address */
  ip: string;

  /** Discovered port */
  port: number;
}

/**
 * Voice client events
 */
export interface VoiceConnectionEvents {
  /**
   * Emitted when the voice client begins connecting
   */
  connecting: [event: VoiceConnectingEvent];

  /**
   * Emitted when the voice client successfully connects
   */
  connected: [event: VoiceConnectedEvent];

  /**
   * Emitted when a connection attempt fails
   */
  connectionFailure: [event: VoiceConnectionFailureEvent];

  /**
   * Emitted when the voice client disconnects
   */
  disconnected: [event: VoiceDisconnectedEvent];

  /**
   * Emitted when the voice client encounters an error
   */
  error: [error: Error];

  /**
   * Emitted when the voice client is ready to transmit audio
   */
  ready: [event: VoiceReadyEvent];

  /**
   * Emitted when heartbeat system is started
   */
  heartbeatStart: [event: VoiceHeartbeatStartEvent];

  /**
   * Emitted when a heartbeat is sent
   */
  heartbeatSend: [event: VoiceHeartbeatSendEvent];

  /**
   * Emitted when a heartbeat acknowledgement is received
   */
  heartbeatAck: [event: VoiceHeartbeatAckEvent];

  /**
   * Emitted when a heartbeat times out
   */
  heartbeatTimeout: [event: VoiceHeartbeatTimeoutEvent];

  /**
   * Emitted when the voice client receives a packet
   */
  packet: [opcode: VoiceOpcodes, data: unknown];

  /**
   * Emitted when the voice client attempts to resume a session
   */
  resuming: [sessionId: string | null];

  /**
   * Emitted when the voice client successfully resumes a session
   */
  resumed: [sessionId: string];

  /**
   * Emitted when reconnecting to voice
   */
  reconnecting: [
    event: { attempt: number; delay: number; sessionId: string | null },
  ];

  /**
   * Emitted when IP discovery completes
   */
  ipDiscovery: [event: VoiceIpDiscoveryEvent];

  /**
   * Emitted when the UDP manager receives a packet
   */
  udpPacket: [packet: Buffer];

  /**
   * Emitted when a user starts speaking
   */
  userSpeaking: [ssrc: number];
}
