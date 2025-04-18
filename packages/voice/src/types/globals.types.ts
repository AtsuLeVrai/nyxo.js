import type { Snowflake } from "@nyxjs/core";

/**
 * Represents the available versions of the voice gateway.
 * Determines available features and behavior of the voice connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-gateway-versioning}
 */
export enum VoiceGatewayVersion {
  /**
   * Version 8: Added server message buffering and ability to receive missed messages on resume
   */
  V8 = 8,

  /** Version 7: Added channel options opcode */
  V7 = 7,

  /** Version 6: Added code version opcode */
  V6 = 6,

  /** Version 5: Added video sink wants opcode */
  V5 = 5,

  /** Version 4: Changed speaking status from boolean to bitmask */
  V4 = 4,

  /**
   * Version 3: Added video (deprecated)
   * @deprecated This version is no longer supported and should not be used.
   */
  V3 = 3,

  /**
   * Version 2: Changed heartbeat reply from server to heartbeat ACK opcode (deprecated)
   * @deprecated This version is no longer supported and should not be used.
   */
  V2 = 2,

  /**
   * Version 1: Initial version (deprecated)
   * @deprecated This version is no longer supported and should not be used.
   */
  V1 = 1,
}

/**
 * Payload sent to identify to the voice WebSocket.
 * Establishes the voice session and authenticates the user.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection}
 */
export interface VoiceIdentifyEntity {
  /**
   * Server ID (guild) for which the voice connection is being established.
   * Must match the guild ID in the VoiceServerUpdate.
   */
  server_id: Snowflake;

  /**
   * ID of the user who is connecting.
   * Identifies the user establishing the voice connection.
   */
  user_id: Snowflake;

  /**
   * Session ID obtained from the Voice State Update event.
   * Authenticates the specific voice connection.
   */
  session_id: string;

  /**
   * Authentication token obtained from the Voice Server Update event.
   * Verifies the legitimacy of the connection request.
   */
  token: string;

  /**
   * Version of the voice gateway being used.
   * Determines the features and behavior of the voice connection.
   */
  max_dave_protocol_version?: number;
}

/**
 * Response received after successful identification to the voice WebSocket.
 * Contains information needed to establish a UDP connection and start sending/receiving audio.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection}
 */
export interface VoiceReadyEntity {
  /**
   * Unique SSRC (Synchronization Source) value for this connection.
   * Identifies the audio source in RTP packets.
   */
  ssrc: number;

  /**
   * IP address of the UDP voice server.
   * Endpoint for sending and receiving audio data.
   */
  ip: string;

  /**
   * UDP port of the voice server.
   * Used with the IP address for UDP communication.
   */
  port: number;

  /**
   * Encryption modes supported by the voice server.
   * List of available encryption algorithms for securing audio data.
   */
  modes: string[];

  /**
   * Heartbeat interval in milliseconds.
   * Erroneous field that should be ignored; the correct value comes from the Hello payload.
   * @deprecated Use the heartbeat interval from the Hello payload.
   */
  heartbeat_interval: number;
}

/**
 * Hello payload received from voice server after connection.
 * Provides the correct heartbeat interval to maintain the connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHelloEntity {
  /**
   * Heartbeat interval in milliseconds.
   * Indicates how frequently the client should send heartbeats.
   */
  heartbeat_interval: number;
}

/**
 * Heartbeat payload sent to maintain the voice WebSocket connection.
 * Must be sent regularly according to the interval specified in the Hello payload.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHeartbeatEntity {
  /**
   * Timestamp in milliseconds used as a nonce.
   * Value used to correlate heartbeats with their acknowledgements.
   */
  t: number;

  /**
   * Sequence number of the last numbered message received from gateway.
   * Required for version 8 and later of the voice protocol.
   */
  seq_ack?: number;
}

/**
 * Heartbeat acknowledgement sent by the voice server.
 * Confirms that the server received the client's heartbeat.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHeartbeatAckEntity {
  /**
   * Timestamp corresponding to that sent in the heartbeat.
   * Allows calculating latency between client and server.
   */
  t: number;
}

/**
 * Payload sent to select the UDP communication protocol.
 * Finalizes the establishment of the voice connection after IP discovery.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection}
 */
export interface VoiceSelectProtocolEntity {
  /**
   * Protocol to use, currently always "udp".
   * Identifies the type of connection to establish.
   */
  protocol: "udp";

  /**
   * Information about the local endpoint for UDP communication.
   * Contains the IP address, port, and encryption mode.
   */
  data: {
    /**
     * External IP address of the client discovered via the IP discovery procedure.
     * Allows the server to know where to send audio packets.
     */
    address: string;

    /**
     * External UDP port of the client discovered via the IP discovery procedure.
     * Completes the IP address to form the complete endpoint.
     */
    port: number;

    /**
     * Encryption mode to use for audio data.
     * Must be one of the supported modes listed in the Ready payload.
     */
    mode: string;
  };
}

/**
 * Session description sent by the voice server after protocol selection.
 * Contains the secret key for encrypting audio data.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection}
 */
export interface VoiceSessionDescriptionEntity {
  /**
   * Encryption mode selected for this session.
   * Confirms the mode requested in VoiceSelectProtocol.
   */
  mode: string;

  /**
   * Secret key used for encrypting audio data.
   * 32-byte array representing the encryption key.
   */
  secret_key: number[];

  /**
   * Version of the DAVE protocol, if E2EE is enabled.
   * Present only when the DAVE protocol is used.
   */
  dave_protocol_version?: number;
}

/**
 * Available encryption modes for voice connections.
 * Determines how audio data is encrypted and decrypted.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-and-sending-voice}
 */
export enum VoiceEncryptionMode {
  /** AEAD AES256-GCM with RTP size. Preferred. */
  AeadAes256GcmRtpsize = "aead_aes256_gcm_rtpsize",

  /** AEAD XChaCha20 Poly1305 with RTP size. Required. */
  AeadXchacha20Poly1305Rtpsize = "aead_xchacha20_poly1305_rtpsize",

  /**
   * XSalsa20 Poly1305 Lite with RTP size.
   * @deprecated This mode is no longer supported and should not be used.
   */
  Xsalsa20Poly1305LiteRtpsize = "xsalsa20_poly1305_lite_rtpsize",

  /**
   * AEAD AES256-GCM.
   * @deprecated This mode is no longer supported and should not be used.
   */
  AeadAes256Gcm = "aead_aes256_gcm",

  /**
   * XSalsa20 Poly1305.
   * @deprecated This mode is no longer supported and should not be used.
   */
  Xsalsa20Poly1305 = "xsalsa20_poly1305",

  /**
   * XSalsa20 Poly1305 Suffix.
   * @deprecated This mode is no longer supported and should not be used.
   */
  Xsalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",

  /**
   * XSalsa20 Poly1305 Lite.
   * @deprecated This mode is no longer supported and should not be used.
   */
  Xsalsa20Poly1305Lite = "xsalsa20_poly1305_lite",
}

/**
 * Payload to update speaking mode.
 * Signals to the server the intention to transmit audio data.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export interface VoiceSpeakingEntity {
  /**
   * Bit mask representing the speaking mode.
   * Combination of flags from VoiceSpeakingFlags.
   */
  speaking: number;

  /**
   * Delay in milliseconds for audio.
   * Should be 0 for bots using the voice gateway.
   */
  delay: number;

  /**
   * SSRC value for this voice connection.
   * Must match the SSRC value received in VoiceReady.
   */
  ssrc: number;
}

/**
 * Flags for different speaking modes.
 * Used as a bit mask in the speaking field of VoiceSpeaking.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export enum VoiceSpeakingFlags {
  /** Normal voice audio transmission */
  Microphone = 1 << 0,

  /** Contextual audio transmission for video, with no speaking indicator */
  Soundshare = 1 << 1,

  /** Priority speaker, reducing audio from other speakers */
  Priority = 1 << 2,
}

/**
 * Generic payload for WebSocket communications with Discord voice server
 * All messages follow this structure with an opcode and specific data
 */
export interface VoicePayloadEntity<T = unknown> {
  /**
   * Operation code indicating the message type
   * For example:
   * - 0: Identify
   * - 1: Select Protocol
   * - 3: Heartbeat
   * - 5: Speaking
   * - 7: Resume
   * etc.
   */
  op: number;

  /**
   * Data specific to the operation type
   * Content varies depending on the opcode
   */
  d: T;

  /**
   * Sequence number (present only in certain messages from server to client)
   * Used for buffered resume functionality
   */
  seq?: number;
}

/**
 * Structure of an RTP voice packet.
 * Format used to send audio data to the voice server.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-and-sending-voice}
 */
export interface VoicePacket {
  /**
   * Single byte with value 0x80 representing version and flags.
   * First byte of the standard RTP header.
   */
  versionAndFlags: number;

  /**
   * Single byte with value 0x78 representing the payload type.
   * Second byte of the standard RTP header.
   */
  payloadType: number;

  /**
   * Unsigned short integer (big endian) representing the sequence number.
   * Incremented for each packet sent.
   */
  sequence: number;

  /**
   * Unsigned integer (big endian) representing the timestamp.
   * Based on audio sampling (typically incremented by 960 for each packet with a 48kHz sampling rate).
   */
  timestamp: number;

  /**
   * Unsigned integer (big endian) representing the SSRC value.
   * Identifies the audio source, matches the value in VoiceReady.
   */
  ssrc: number;

  /**
   * Encrypted audio data.
   * Contains the Opus audio data encrypted with the appropriate key and nonce.
   */
  encryptedAudio: Uint8Array;
}

/**
 * Payload to resume an interrupted voice connection.
 * Allows resuming a session without having to fully renegotiate the connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#resuming-voice-connection}
 */
export interface VoiceResumeEntity {
  /**
   * Server ID (guild) for which the voice connection is being resumed.
   * Identifies the voice server to reconnect to.
   */
  server_id: Snowflake;

  /**
   * Session ID of the interrupted voice connection.
   * Identifies the specific session to resume.
   */
  session_id: string;

  /**
   * Authentication token for the voice connection.
   * Verifies the legitimacy of the resume request.
   */
  token: string;

  /**
   * Last acknowledged sequence number received from the gateway.
   * Required for versions 8 and later of the voice protocol.
   */
  seq_ack?: number;
}

/**
 * Structure for the UDP IP discovery packet.
 * Used to determine the client's external IP address and port.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 */
export interface VoiceIpDiscovery {
  /**
   * Value 0x1 for requests, 0x2 for responses.
   * Indicates whether it's a request or response.
   */
  type: number;

  /**
   * Message length, excluding Type and Length fields (value 70).
   * Fixed size for compatibility with the format expected by Discord.
   */
  length: number;

  /**
   * SSRC value of the voice connection.
   * Matches the value received in VoiceReady.
   */
  ssrc: number;

  /**
   * Null-terminated string in the response, containing the external IP address.
   * 64-byte field filled with the discovered IP address.
   */
  address: string;

  /**
   * Unsigned short integer representing the external port.
   * External UDP port discovered for the voice connection.
   */
  port: number;
}

/**
 * Opcodes for voice WebSocket communication.
 * Defines the different types of operations that can be performed via the voice WebSocket connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice}
 */
export enum VoiceOpcodes {
  /** Client → Server: Identify your connection to the voice server */
  Identify = 0,

  /** Client → Server: Select the protocol to use for audio communication */
  SelectProtocol = 1,

  /** Server → Client: Complete the WebSocket connection establishment */
  Ready = 2,

  /** Client → Server: Keep the connection alive */
  Heartbeat = 3,

  /** Server → Client: Describe the voice session */
  SessionDescription = 4,

  /** Client → Server: Indicate who is speaking and how */
  Speaking = 5,

  /** Server → Client: Confirm a received heartbeat */
  HeartbeatAck = 6,

  /** Client → Server: Resume an existing connection */
  Resume = 7,

  /** Server → Client: Indicate parameters for heartbeat */
  Hello = 8,

  /** Server → Client: Confirm a successful resume */
  Resumed = 9,

  /** Server → Client: Indicate that a client has disconnected from a voice channel */
  ClientDisconnect = 13,

  /** Server → Client: Prepare a DAVE protocol transition */
  DaveProtocolPrepareTransition = 21,

  /** Server → Client: Execute a DAVE protocol transition */
  DaveProtocolExecuteTransition = 22,

  /** Client → Server: Indicate that the client is ready for a DAVE transition */
  DaveProtocolTransitionReady = 23,

  /** Server → Client: Prepare a DAVE protocol epoch */
  DaveProtocolPrepareEpoch = 24,

  /** Server → Client: Provide the DAVE MLS external sender package */
  DaveMlsExternalSenderPackage = 25,

  /** Client → Server: Send a new MLS key package */
  DaveMlsKeyPackage = 26,

  /** Server → Client: Send MLS proposals */
  DaveMlsProposals = 27,

  /** Client → Server: Send an MLS commit and welcome */
  DaveMlsCommitWelcome = 28,

  /** Server → Client: Announce an MLS commit transition */
  DaveMlsAnnounceCommitTransition = 29,

  /** Server → Client: Send an MLS welcome message */
  DaveMlsWelcome = 30,

  /** Client → Server: Signal an invalid MLS commit or welcome */
  DaveMlsInvalidCommitWelcome = 31,
}

/**
 * Interface for DAVE protocol binary messages.
 * Format used for DAVE opcodes sent in binary instead of JSON.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#binary-websocket-messages}
 */
export interface DaveBinaryMessage {
  /**
   * Optional sequence number (server → client only) in big-endian uint16 format.
   * Used for tracking and resuming messages.
   */
  sequenceNumber?: number;

  /**
   * Unsigned integer opcode value.
   * Identifies the type of DAVE message.
   */
  opcode: number;

  /**
   * Binary payload of the message (format defined by opcode).
   * Contains the specific data for the operation.
   */
  payload: Uint8Array;
}

/**
 * Structure of E2EE audio frames for the DAVE protocol.
 * Format used for end-to-end encryption of audio data.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#audio-frame-e2ee}
 */
export interface DaveAudioFrameE2ee {
  /**
   * Ciphertext for the E2EE OPUS frame.
   * Audio content encrypted with AES128-GCM.
   */
  e2eeOpusFrame: Uint8Array;

  /**
   * Truncated AES-GCM authentication tag.
   * 8 bytes to verify data integrity.
   */
  authTag: Uint8Array;

  /**
   * ULEB128-encoded synchronization nonce.
   * Used for encryption/decryption and synchronization.
   */
  nonce: Uint8Array;

  /**
   * ULEB128-encoded offset/length pairs of unencrypted data.
   * Empty for OPUS frames as all content is encrypted.
   */
  unencryptedRanges: Uint8Array;

  /**
   * Size in bytes of supplemental data.
   * Sum of bytes required for tag, nonce, ranges, size, and marker.
   */
  supplementalDataSize: number;

  /**
   * Magic marker 0xFAFA to help identify protocol frames.
   * Constant 2-byte value used for detection.
   */
  magicMarker: number;
}

/**
 * Unified voice events interface for Discord voice connections.
 * Provides a centralized event system with meaningful, non-redundant events.
 */
export interface VoiceEvents {
  /**
   * Emitted when a voice connection state changes
   * @param newState The new connection state
   * @param oldState The previous connection state
   */
  stateChange: [newState: string, oldState: string];

  /**
   * Emitted when a voice connection is fully established and ready to transmit audio
   */
  ready: [];

  /**
   * Emitted when a voice connection is closed
   */
  disconnect: [];

  /**
   * Emitted when external IP and port are discovered
   * @param info The discovered IP information containing address and port
   */
  ipDiscovered: [info: { address: string; port: number }];

  /**
   * Emitted when an audio source starts playing
   * @param info Metadata about the audio source
   * @param queuePosition Position in the queue (0-indexed)
   */
  audioStart: [
    info: Record<string, unknown> | undefined,
    queuePosition: number,
  ];

  /**
   * Emitted when an audio source finishes playing
   * @param info Metadata about the audio source
   */
  audioEnd: [info: Record<string, unknown> | undefined];

  /**
   * Emitted when the audio queue ends
   */
  queueEnd: [];

  /**
   * Emitted when a user's speaking state changes
   * @param ssrc SSRC of the user
   * @param speaking Whether the user is speaking (true) or not (false)
   * @param flags Speaking flags indicating the type of audio
   */
  speaking: [ssrc: number, speaking: boolean, flags: number];

  /**
   * Emitted when an audio packet is received from another user
   * @param data Decoded audio data
   * @param userId ID of the speaking user
   */
  audioReceived: [data: Uint8Array, userId: number | null];

  /**
   * Emitted when any error occurs
   * @param error The error that occurred
   */
  error: [error: Error];
}

/**
 * Interface for events sent to the voice server.
 * Defines the structure of messages sent from the client to the server.
 */
export interface VoiceSendEvents {
  /**
   * Sent to identify the client to the voice server
   */
  [VoiceOpcodes.Identify]: VoiceIdentifyEntity;

  /**
   * Sent to select the protocol for UDP communication
   */
  [VoiceOpcodes.SelectProtocol]: VoiceSelectProtocolEntity;

  /**
   * Sent to select the protocol for UDP communication
   */
  [VoiceOpcodes.Resume]: VoiceResumeEntity;

  /**
   * Sent to send a heartbeat to the voice server
   */
  [VoiceOpcodes.Speaking]: VoiceSpeakingEntity;

  /**
   * Sent to select the protocol for UDP communication
   */
  [VoiceOpcodes.Heartbeat]: VoiceHeartbeatEntity;

  /**
   * Sent to resume a voice connection
   */
  [VoiceOpcodes.DaveMlsKeyPackage]: DaveBinaryMessage;
}
