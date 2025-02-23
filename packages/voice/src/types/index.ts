/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-gateway-versioning-gateway-versions}
 */
export enum VoiceGatewayVersion {
  /**
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead - Version 3 has been deprecated
   */
  V3 = 3,
  /**
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead - Version 4 has been deprecated
   */
  V4 = 4,
  /**
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead - Version 5 has been deprecated
   */
  V5 = 5,
  /**
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead - Version 6 has been deprecated
   */
  V6 = 6,
  /**
   * @deprecated Use {@link VoiceGatewayVersion.V8} instead - Nyx.js supports only version 8 of the Discord Voice Gateway
   */
  V7 = 7,
  V8 = 8,
}

export interface VoicePayload {
  op: VoiceGatewayOpcodes;
  d: unknown;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection-example-voice-identify-payload}
 */
export interface VoiceIdentifyPayload {
  server_id: string;
  user_id: string;
  session_id: string;
  token: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection-example-voice-ready-payload}
 */
export interface VoiceReadyPayload {
  ssrc: number;
  ip: string;
  port: number;
  modes: VoiceEncryptionMode[];
  /**
   * @deprecated `heartbeat_interval` here is an erroneous field and should be ignored. The correct `heartbeat_interval` value comes from the Hello payload.
   */
  heartbeat_interval: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating-example-hello-payload}
 */
export interface VoiceHelloPayload {
  heartbeat_interval: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating-example-heartbeat-payload-since-v8}
 */
export interface VoiceHeartbeatPayload {
  t: number;
  seq_ack: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating-example-heartbeat-ack-payload-since-v8}
 */
export interface VoiceHeartbeatAckPayload {
  t: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection-example-select-protocol-payload}
 */
export interface VoiceSelectProtocolPayload {
  protocol: "udp";
  data: {
    address: string;
    port: number;
    mode: VoiceEncryptionMode;
  };
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-modes-example-session-description-payload}
 */
export interface VoiceSessionDescriptionPayload {
  mode: VoiceEncryptionMode;
  secret_key: Uint8Array;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export enum VoiceSpeakingFlags {
  Microphone = 1 << 0,
  Soundboard = 1 << 1,
  Priority = 1 << 2,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking-example-speaking-payload}
 */
export interface VoiceSpeakingPayload {
  speaking: number;
  delay: number;
  ssrc: number;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#resuming-voice-connection-example-resume-connection-payload-since-v8}
 */
export interface VoiceResumePayload {
  server_id: string;
  session_id: string;
  token: string;
  seq_ack: number;
}

export interface VoiceSendEvents {
  [VoiceGatewayOpcodes.Identify]: VoiceIdentifyPayload;
  [VoiceGatewayOpcodes.SelectProtocol]: VoiceSelectProtocolPayload;
  [VoiceGatewayOpcodes.Heartbeat]: VoiceHeartbeatPayload;
  [VoiceGatewayOpcodes.Speaking]: VoiceSpeakingPayload;
  [VoiceGatewayOpcodes.Resume]: VoiceResumePayload;
}

export interface VoiceConnectionEvents {
  debug: [message: string, context?: Record<string, unknown>];
  error: [error: Error | string, context?: Record<string, unknown>];
  resumed: [];
  sessionDescription: [session: VoiceSessionDescriptionPayload];
  ready: [ready: VoiceReadyPayload];
  ipDiscovered: [ip: string, port: number];
  ipTimeout: [];
  ipRetrying: [retryCount: number];
  speaking: [data: VoiceSpeakingPayload];
}

export enum VoiceEncryptionMode {
  AeadAes256GcmRtpSize = "aead_aes256_gcm_rtpsize",
  AeadXChaCha20Poly1305RtpSize = "aead_xchacha20_poly1305_rtpsize",
  /**
   * @deprecated Use {@link VoiceEncryptionMode.AeadAes256GcmRtpSize} instead
   */
  Xsalsa20Poly1305LiteRtpSize = "xsalsa20_poly1305_lite_rtpsize",
  /**
   * @deprecated Use {@link VoiceEncryptionMode.AeadAes256GcmRtpSize} instead
   */
  AeadAes256Gcm = "aead_aes256_gcm",
  /**
   * @deprecated Use {@link VoiceEncryptionMode.AeadAes256GcmRtpSize} instead
   */
  Xsalsa20Poly1305 = "xsalsa20_poly1305",
  /**
   * @deprecated Use {@link VoiceEncryptionMode.AeadAes256GcmRtpSize} instead
   */
  Xsalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",
  /**
   * @deprecated Use {@link VoiceEncryptionMode.AeadAes256GcmRtpSize} instead
   */
  Xsalsa20Poly1305Lite = "xsalsa20_poly1305_lite",
}

/**
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-opcodes}
 */
export enum VoiceGatewayOpcodes {
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
  ClientsConnect = 11,
  ClientDisconnect = 13,
  DavePrepareTransition = 21,
  DaveExecuteTransition = 22,
  DaveTransitionReady = 23,
  DavePrepareEpoch = 24,
  DaveMlsExternalSender = 25,
  DaveMlsKeyPackage = 26,
  DaveMlsProposals = 27,
  DaveMlsCommitWelcome = 28,
  DaveMlsAnnounceCommitTransition = 29,
  DaveMlsWelcome = 30,
  DaveMlsInvalidCommitWelcome = 31,
}
