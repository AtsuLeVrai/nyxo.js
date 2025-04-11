// Voice Gateway Opcodes
export enum VoiceOpcodes {
  Identify = 0,
  SelectProtocol = 1,
  Ready = 2,
  Heartbeat = 3,
  SessionDescription = 4,
  Speaking = 5,
  HeartbeatAck = 6,
  Resume = 7,
  Hello = 8,
  Resumed = 9,
  ClientDisconnect = 13,
  DAVEProtocolPrepareTransition = 21,
  DAVEProtocolExecuteTransition = 22,
  DAVEProtocolTransitionReady = 23,
  DAVEProtocolPrepareEpoch = 24,
  DAVEMLSExternalSenderPackage = 25,
  DAVEMLSKeyPackage = 26,
  DAVEMLSProposals = 27,
  DAVEMLSCommitWelcome = 28,
  DAVEMLSAnnounceCommitTransition = 29,
  DAVEMLSWelcome = 30,
  DAVEMLSInvalidCommitWelcome = 31,
}

// Voice WebSocket Close Event Codes
export enum VoiceCloseEventCodes {
  UnknownOpcode = 4001,
  FailedToDecodePayload = 4002,
  NotAuthenticated = 4003,
  AuthenticationFailed = 4004,
  AlreadyAuthenticated = 4005,
  SessionNoLongerValid = 4006,
  SessionTimeout = 4009,
  ServerNotFound = 4011,
  UnknownProtocol = 4012,
  Disconnected = 4014,
  VoiceServerCrashed = 4015,
  UnknownEncryptionMode = 4016,
}

// Speaking Flags (Bitwise)
export enum SpeakingFlags {
  Microphone = 1 << 0, // Normal voice audio
  Soundshare = 1 << 1, // Context audio for video
  Priority = 1 << 2, // Priority speaker
}

// Voice Gateway Versions
export enum VoiceGatewayVersion {
  V8 = 8,
  V7 = 7,
  V6 = 6,
  V5 = 5,
  V4 = 4,
  V3 = 3, // Deprecated
  V2 = 2, // Deprecated
  V1 = 1, // Deprecated
}

// Encryption Modes
export enum EncryptionMode {
  AEAD_AES256_GCM_RTPSize = "aead_aes256_gcm_rtpsize", // Preferred
  AEAD_XChaCha20_Poly1305_RTPSize = "aead_xchacha20_poly1305_rtpsize", // Required
  XSalsa20_Poly1305_Lite_RTPSize = "xsalsa20_poly1305_lite_rtpsize", // Deprecated
  AEAD_AES256_GCM = "aead_aes256_gcm", // Deprecated
  XSalsa20_Poly1305 = "xsalsa20_poly1305", // Deprecated
  XSalsa20_Poly1305_Suffix = "xsalsa20_poly1305_suffix", // Deprecated
  XSalsa20_Poly1305_Lite = "xsalsa20_poly1305_lite", // Deprecated
}

// Voice Protocol Types
export enum VoiceProtocol {
  UDP = "udp",
}

// WebSocket Connection States
export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

// Voice Connection States
export enum VoiceConnectionState {
  Disconnected = 0,
  Connecting = 1,
  Authenticating = 2,
  Establishing = 3,
  Ready = 4,
  Speaking = 5,
  Reconnecting = 6,
}

// Payload Types
// ============================================================

// Basic payload structure
export interface VoicePayload {
  op: VoiceOpcodes;
  d: unknown;
  seq?: number; // For buffered resume
}

// Identify Payload (Opcode 0)
export interface IdentifyPayload {
  server_id: string;
  user_id: string;
  session_id: string;
  token: string;
  max_dave_protocol_version?: number; // For supporting E2EE
}

// Select Protocol Payload (Opcode 1)
export interface SelectProtocolPayload {
  protocol: VoiceProtocol;
  data: {
    address: string;
    port: number;
    mode: EncryptionMode;
  };
}

// Ready Payload (Opcode 2)
export interface ReadyPayload {
  ssrc: number;
  ip: string;
  port: number;
  modes: EncryptionMode[];
  heartbeat_interval: number; // Ignore this - use Hello payload instead
}

// Heartbeat Payload (Opcode 3)
export interface HeartbeatPayloadV8 {
  t: number;
  seq_ack: number;
}

export type HeartbeatPayloadLegacy = number;

// Session Description Payload (Opcode 4)
export interface SessionDescriptionPayload {
  mode: EncryptionMode;
  secret_key: number[];
  dave_protocol_version?: number; // Optional, for E2EE
}

// Speaking Payload (Opcode 5)
export interface SpeakingPayload {
  speaking: number; // Bitwise flag from SpeakingFlags
  delay: number;
  ssrc: number;
}

// Heartbeat ACK Payload (Opcode 6)
export interface HeartbeatAckPayloadV8 {
  t: number;
}

export type HeartbeatAckPayloadLegacy = number;

// Resume Payload (Opcode 7)
export interface ResumePayloadV8 {
  server_id: string;
  session_id: string;
  token: string;
  seq_ack: number;
}

export interface ResumePayloadLegacy {
  server_id: string;
  session_id: string;
  token: string;
}

// Hello Payload (Opcode 8)
export interface HelloPayload {
  heartbeat_interval: number;
}

// DAVE Protocol Types
// ============================================================

// DAVE Protocol Prepare Transition Payload (Opcode 21)
export interface DAVEProtocolPrepareTransitionPayload {
  transition_id: string;
  dave_protocol_version: number;
}

// DAVE Protocol Execute Transition Payload (Opcode 22)
export interface DAVEProtocolExecuteTransitionPayload {
  transition_id: string;
}

// DAVE Protocol Transition Ready Payload (Opcode 23)
export interface DAVEProtocolTransitionReadyPayload {
  transition_id: string;
}

// DAVE Protocol Prepare Epoch Payload (Opcode 24)
export interface DAVEProtocolPrepareEpochPayload {
  transition_id: string;
  epoch_id: number;
}

// DAVE MLS External Sender Package Payload (Opcode 25)
export interface DAVEMLSExternalSenderPackagePayload {
  mls_external_sender_public_key: Uint8Array;
  mls_external_sender_credential: Uint8Array;
}

// DAVE MLS Key Package Payload (Opcode 26)
export interface DAVEMLSKeyPackagePayload {
  mls_key_package: Uint8Array;
}

// DAVE MLS Proposals Payload (Opcode 27)
export interface DAVEMLSProposalsPayload {
  mls_proposal_messages: Uint8Array[];
  revoke: boolean;
}

// DAVE MLS Commit Welcome Payload (Opcode 28)
export interface DAVEMLSCommitWelcomePayload {
  mls_commit_message: Uint8Array;
  mls_welcome_messages: Uint8Array[];
}

// DAVE MLS Announce Commit Transition Payload (Opcode 29)
export interface DAVEMLSAnnounceCommitTransitionPayload {
  transition_id: string;
  mls_commit_message: Uint8Array;
}

// DAVE MLS Welcome Payload (Opcode 30)
export interface DAVEMLSWelcomePayload {
  transition_id: string;
  mls_welcome_message: Uint8Array;
}

// DAVE MLS Invalid Commit Welcome Payload (Opcode 31)
export interface DAVEMLSInvalidCommitWelcomePayload {
  reason: string;
}

// RTP Packet Structure
// ============================================================
export interface RTPPacketHeader {
  version: number; // Version (always 0x80)
  payloadType: number; // Payload type (always 0x78)
  sequence: number; // Unsigned short (big endian)
  timestamp: number; // Unsigned integer (big endian)
  ssrc: number; // Unsigned integer (big endian)
}

export interface RTPPacket extends RTPPacketHeader {
  encryptedAudio: Uint8Array; // Encrypted audio data
}

// E2EE OPUS Frame Structure
// ============================================================
export interface E2EEOpusFrame {
  ciphertext: Uint8Array; // E2EE OPUS frame
  authTag: Uint8Array; // 8-byte AES-GCM auth tag
  nonce: Uint8Array; // ULEB128 encoded nonce
  unencryptedRanges: Uint8Array; // ULEB128 offset/length pairs
  supplementalDataSize: number; // Size of supplemental data (1 byte)
  magicMarker: number; // 0xFAFA (2 bytes)
}

// Voice Connection Options
// ============================================================
export interface VoiceConnectionOptions {
  token: string;
  endpoint: string;
  sessionId: string;
  serverId: string;
  userId: string;
  ssrc?: number;
  selfDeaf?: boolean;
  selfMute?: boolean;
  debug?: boolean;
  enableE2EE?: boolean;
  maxDaveProtocolVersion?: number;
  preferredEncryptionModes?: EncryptionMode[];
  reconnect?: {
    maxAttempts: number;
    delay: number;
    maxDelay: number;
  };
  opusEncoder?: {
    rate: number; // Sample rate (48000)
    channels: number; // Channel count (2)
    frameSize: number; // Frame size in samples (960)
  };
}

// Voice Events
// ============================================================
export interface VoiceEvents {
  debug: [message: string];
  warn: [message: string];
  error: [error: Error];

  // Connection lifecycle
  connecting: [];
  connected: [];
  ready: [ssrc: number];
  speaking: [userId: string, speaking: boolean, ssrc: number];
  disconnect: [code: number, reason: string];
  reconnecting: [];
  resumed: [];

  // E2EE events
  e2eeEnabled: [version: number];
  e2eeDisabled: [];
  e2eeTransition: [transitionId: string];

  // Audio events
  audioReceived: [userId: string, audio: Buffer, sequence: number];
  audioPacketSent: [sequence: number];

  // Raw events for advanced usage
  raw: [payload: VoicePayload];
  udpRaw: [packet: Buffer];
}

// IP Discovery
// ============================================================
export enum IPDiscoveryType {
  Request = 0x1,
  Response = 0x2,
}

export interface IPDiscoveryPacket {
  type: IPDiscoveryType;
  length: number; // Value 70
  ssrc: number;
  address: string;
  port: number;
}

// RPC Types (for voice channel joins via Gateway)
// ============================================================
export interface VoiceStateUpdate {
  guild_id: string;
  channel_id: string | null;
  self_mute: boolean;
  self_deaf: boolean;
}

export interface VoiceServerUpdate {
  token: string;
  guild_id: string;
  endpoint: string;
}

// Voice State Response
export interface VoiceState {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  member?: unknown;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_stream?: boolean;
  self_video: boolean;
  suppress: boolean;
  request_to_speak_timestamp: string | null;
}
