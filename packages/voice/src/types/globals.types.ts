/**
 * Voice Gateway opcodes
 * @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice
 */
export enum VoiceOpcodes {
  /**
   * Used to begin a voice websocket connection
   */
  Identify = 0,

  /**
   * Used to select the voice protocol
   */
  SelectProtocol = 1,

  /**
   * Used to complete the websocket handshake
   */
  Ready = 2,

  /**
   * Used to keep the websocket connection alive
   */
  Heartbeat = 3,

  /**
   * Describes the session
   */
  SessionDescription = 4,

  /**
   * Used to indicate which users are speaking
   */
  Speaking = 5,

  /**
   * Sent to acknowledge a received client heartbeat
   */
  HeartbeatAck = 6,

  /**
   * Resume a connection
   */
  Resume = 7,

  /**
   * Used to inform clients they need to reconnect to the gateway
   */
  Hello = 8,

  /**
   * Sent when a client's session has been resumed
   */
  Resumed = 9,

  /**
   * Required client to send an Identify payload
   */
  ClientDisconnect = 13,
}

/**
 * Voice connection speaking modes
 */
export enum SpeakingFlags {
  /**
   * Normal transmission of voice audio
   */
  Microphone = 1 << 0,

  /**
   * Transmission of context audio for video, no speaking indicator
   */
  Soundshare = 1 << 1,

  /**
   * Priority speaker, lowering audio of other speakers
   */
  Priority = 1 << 2,
}

/**
 * Voice encryption modes
 */
export enum EncryptionMode {
  /**
   * AES-GCM (RTP Size) encryption
   */
  AeadAes256GcmRtpsize = "aead_aes256_gcm_rtpsize",

  /**
   * XChaCha20 Poly1305 (RTP Size) encryption
   */
  AeadXChaCha20Poly1305Rtpsize = "aead_xchacha20_poly1305_rtpsize",

  /**
   * Deprecated - XSalsa20 Poly1305 Lite (RTP Size) encryption
   * @deprecated Use {@link EncryptionMode.AeadAes256GcmRtpsize} instead
   */
  XSalsa20Poly1305LiteRtpsize = "xsalsa20_poly1305_lite_rtpsize",

  /**
   * Deprecated - AES-GCM encryption
   * @deprecated Use {@link EncryptionMode.AeadAes256GcmRtpsize} instead
   */
  AeadAes256Gcm = "aead_aes256_gcm",

  /**
   * Deprecated - XSalsa20 Poly1305 encryption
   * @deprecated Use {@link EncryptionMode.AeadAes256GcmRtpsize} instead
   */
  XSalsa20Poly1305 = "xsalsa20_poly1305",

  /**
   * Deprecated - XSalsa20 Poly1305 Suffix encryption
   * @deprecated Use {@link EncryptionMode.AeadAes256GcmRtpsize} instead
   */
  XSalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",

  /**
   * Deprecated - XSalsa20 Poly1305 Lite encryption
   * @deprecated Use {@link EncryptionMode.AeadAes256GcmRtpsize} instead
   */
  XSalsa20Poly1305Lite = "xsalsa20_poly1305_lite",
}

/**
 * Voice close codes
 * @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes
 */
export enum VoiceCloseEventCodes {
  /**
   * You sent an invalid opcode
   */
  UnknownOpcode = 4001,

  /**
   * You sent an invalid payload in your identifying to the Gateway
   */
  FailedToDecodePayload = 4002,

  /**
   * You sent a payload before identifying with the Gateway
   */
  NotAuthenticated = 4003,

  /**
   * The token you sent in your identify payload is incorrect
   */
  AuthenticationFailed = 4004,

  /**
   * You sent more than one identify payload. Stagger your identifies
   */
  AlreadyAuthenticated = 4005,

  /**
   * Your session is no longer valid
   */
  SessionNoLongerValid = 4006,

  /**
   * Your session has timed out
   */
  SessionTimeout = 4009,

  /**
   * We can't find the server you're trying to connect to
   */
  ServerNotFound = 4011,

  /**
   * We didn't recognize the protocol you sent
   */
  UnknownProtocol = 4012,

  /**
   * Either the channel was deleted, you were kicked, voice server changed, or the main gateway session was dropped. Should not reconnect
   */
  Disconnected = 4014,

  /**
   * The server crashed. Our bad! Try resuming
   */
  VoiceServerCrashed = 4015,

  /**
   * We didn't recognize your encryption
   */
  UnknownEncryptionMode = 4016,
}

/**
 * Non-resumable close codes for voice connections
 */
export const NON_RESUMABLE_VOICE_CLOSE_CODES: VoiceCloseEventCodes[] = [
  VoiceCloseEventCodes.AuthenticationFailed,
  VoiceCloseEventCodes.Disconnected,
  VoiceCloseEventCodes.UnknownEncryptionMode,
] as const;

/**
 * Voice state entity
 */
export interface VoiceState {
  /**
   * The guild ID this voice state is for
   */
  guild_id: string;

  /**
   * The channel ID this voice state is for, or null if leaving
   */
  channel_id: string | null;

  /**
   * Whether the client is muted
   */
  self_mute: boolean;

  /**
   * Whether the client is deafened
   */
  self_deaf: boolean;
}

/**
 * Voice server info entity
 */
export interface VoiceServer {
  /**
   * Voice token
   */
  token: string;

  /**
   * The guild ID this voice server update is for
   */
  guild_id: string;

  /**
   * The voice server host
   */
  endpoint: string | null;
}

/**
 * Voice Identify payload entity
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
   * Session ID
   */
  session_id: string;

  /**
   * Voice token
   */
  token: string;
}

/**
 * Voice Select Protocol payload entity
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
     * IP address
     */
    address: string;

    /**
     * Port number
     */
    port: number;

    /**
     * Encryption mode
     */
    mode: EncryptionMode;
  };
}

/**
 * Voice Ready payload entity
 */
export interface VoiceReady {
  /**
   * Voice SSRC
   */
  ssrc: number;

  /**
   * Voice server IP
   */
  ip: string;

  /**
   * Voice server port
   */
  port: number;

  /**
   * Available encryption modes
   */
  modes: EncryptionMode[];

  /**
   * Heartbeat interval (should be ignored - use Hello)
   */
  heartbeat_interval?: number;
}

/**
 * Voice Hello payload entity
 */
export interface VoiceHello {
  /**
   * Heartbeat interval in milliseconds
   */
  heartbeat_interval: number;
}

/**
 * Voice Session Description payload entity
 */
export interface VoiceSessionDescription {
  /**
   * Encryption mode
   */
  mode: EncryptionMode;

  /**
   * Secret key
   */
  secret_key: number[];
}

/**
 * Voice Speaking payload entity
 */
export interface VoiceSpeaking {
  /**
   * Speaking flag
   */
  speaking: number;

  /**
   * Delay (should be 0 for bots)
   */
  delay: number;

  /**
   * SSRC
   */
  ssrc: number;
}

/**
 * Voice Resume payload entity
 */
export interface VoiceResume {
  /**
   * Server ID (guild ID)
   */
  server_id: string;

  /**
   * Session ID
   */
  session_id: string;

  /**
   * Voice token
   */
  token: string;

  /**
   * Last received sequence
   */
  seq_ack?: number;
}

/**
 * Voice packet structure
 */
export interface VoicePacket {
  /**
   * Version and flags (0x80)
   */
  version: number;

  /**
   * Payload type (0x78)
   */
  payloadType: number;

  /**
   * Sequence number
   */
  sequence: number;

  /**
   * Timestamp
   */
  timestamp: number;

  /**
   * SSRC
   */
  ssrc: number;

  /**
   * Encrypted audio data
   */
  data: Buffer;
}

/**
 * Voice connection payload entity
 */
export interface VoicePayloadEntity<T = unknown> {
  /**
   * Opcode
   */
  op: VoiceOpcodes;

  /**
   * Payload data
   */
  d: T;

  /**
   * Sequence number
   */
  s?: number | null;

  /**
   * Event name
   */
  t?: string | null;
}

/**
 * Voice client events
 */
export interface VoiceConnectionEvents {
  /**
   * Emitted when the voice client connects to voice gateway
   */
  connected: [serverId: string, channelId: string];

  /**
   * Emitted when the voice client disconnects from voice gateway
   */
  disconnected: [code: number, reason: string];

  /**
   * Emitted when the voice client encounters an error
   */
  error: [error: Error];

  /**
   * Emitted when the voice client is ready to transmit audio
   */
  ready: [ssrc: number, ip: string, port: number];

  /**
   * Emitted when the voice client receives a speaking event
   */
  speaking: [userId: string, speaking: number, ssrc: number];

  /**
   * Emitted when a heartbeat acknowledgement is received
   */
  heartbeatAck: [latency: number];

  /**
   * Emitted when debug information is available
   */
  debug: [message: string];

  /**
   * Emitted when the voice client receives a packet
   */
  packet: [opcode: VoiceOpcodes, data: unknown];

  /**
   * Emitted when the voice client attempts to resume a session
   */
  resuming: [sessionId: string];

  /**
   * Emitted when the voice client successfully resumes a session
   */
  resumed: [sessionId: string];

  /**
   * Emitted when a UDP connection is established
   */
  udpReady: [address: string, port: number];

  /**
   * Emitted when the UDP manager receives a packet
   */
  udpPacket: [packet: Buffer];

  /**
   * Emitted when IP discovery completes
   */
  ipDiscovery: [ip: string, port: number];
}
