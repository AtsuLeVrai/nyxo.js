import type { Snowflake } from "@nyxojs/core";

/**
 * Voice Gateway Opcodes
 *
 * Defines the different types of operations that can be performed
 * through the Discord Voice Gateway WebSocket connection.
 *
 * Voice Gateway communication uses a separate set of opcodes from the main Gateway.
 * These opcodes control voice connection establishment, heartbeating, and media transmission.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice}
 */
export enum VoiceOpcodes {
  /**
   * Client → Server: Begin a voice websocket connection
   * Sent when first establishing a voice connection, containing authentication data
   */
  Identify = 0,

  /**
   * Client → Server: Select the voice protocol to use
   * Sent after successfully connecting to inform Discord of chosen media protocol
   */
  SelectProtocol = 1,

  /**
   * Server → Client: Complete the websocket handshake
   * Contains server information including SSRC, IP, port, and supported encryption modes
   */
  Ready = 2,

  /**
   * Client → Server: Keep the websocket connection alive
   * Sent periodically to verify connection health and prevent timeout
   */
  Heartbeat = 3,

  /**
   * Server → Client: Describe voice session
   * Contains encryption parameters and other media session details
   */
  SessionDescription = 4,

  /**
   * Client → Server: Indicate speaking status
   * Sent when a client begins or stops transmitting audio
   */
  Speaking = 5,

  /**
   * Server → Client: Acknowledge a received heartbeat
   * Response to client's heartbeat, completing the ping cycle
   */
  HeartbeatAck = 6,

  /**
   * Client → Server: Resume a connection after disconnect
   * Attempts to continue a session without full renegotiation
   */
  Resume = 7,

  /**
   * Server → Client: Time synchronization request
   * Used to establish timing parameters for media synchronization
   */
  Hello = 8,

  /**
   * Server → Client: Acknowledge successful session resumption
   * Confirms that a previously disconnected session has been recovered
   */
  Resumed = 9,

  /**
   * Server → Client: One or more clients have connected to the voice channel
   * Voice Gateway Opcodes manquants ou à corriger
   */
  ClientsConnect = 11,

  /**
   * Client → Server: Request client video information
   * Used for initializing and configuring video streams
   */
  ClientDisconnect = 13,

  /**
   * Client → Server: DAVE protocol prepare transition message
   * Prepares the client for a change in the end-to-end encryption protocol
   */
  DaveProtocolPrepareTransition = 21,

  /**
   * Server → Client: DAVE protocol execute transition message
   * Signals the client to switch to a new encryption context
   */
  DaveProtocolExecuteTransition = 22,

  /**
   * Client → Server: DAVE protocol transition ready message
   * Indicates the client is ready to execute a protocol transition
   */
  DaveProtocolTransitionReady = 23,

  /**
   * Server → Client: DAVE protocol prepare epoch message
   * Prepares the client for a new MLS epoch with protocol parameters
   */
  DaveProtocolPrepareEpoch = 24,

  /**
   * Server → Client: DAVE MLS external sender package message
   * Provides the client with the MLS external sender public key and credential
   */
  DaveMlsExternalSenderPackage = 25,

  /**
   * Client → Server: DAVE MLS key package message
   * Delivers a new MLS key package to the voice gateway for group additions
   */
  DaveMlsKeyPackage = 26,

  /**
   * Server → Client: DAVE MLS proposals message
   * Dispatches MLS proposals that must be appended or revoked
   */
  DaveMlsProposals = 27,

  /**
   * Client → Server: DAVE MLS commit welcome message
   * Sends MLS commit and optional welcome messages for group updates
   */
  DaveMlsCommitWelcome = 28,

  /**
   * Server → Client: DAVE MLS announce commit transition message
   * Dispatches the winning MLS commit and initiates a protocol transition
   */
  DaveMlsAnnounceCommitTransition = 29,

  /**
   * Server → Client: DAVE MLS welcome message
   * Delivers an MLS welcome message to add the client to a group
   */
  DaveMlsWelcome = 30,

  /**
   * Client → Server: DAVE MLS invalid commit welcome message
   * Indicates an unprocessable MLS commit or welcome message was received
   */
  DaveMlsInvalidCommitWelcome = 31,
}

/**
 * Voice Connection Status
 *
 * Enumeration of possible states for a voice connection,
 * indicating its current connectivity and operational status.
 *
 * These states track the lifecycle of voice connections from
 * initialization through disconnection.
 */
export enum VoiceConnectionStatus {
  /**
   * Initial state before any connection attempts
   * Resources are being prepared for connection
   */
  Signaling = 0,

  /**
   * Voice connection is being established
   * WebSocket is connecting and handshakes are in progress
   */
  Connecting = 1,

  /**
   * Voice connection is fully established and operational
   * Audio can be sent and received in this state
   */
  Connected = 2,

  /**
   * Connection is temporarily interrupted
   * Attempting to automatically recover without full reconnection
   */
  Reconnecting = 3,

  /**
   * Connection has been intentionally closed
   * Resources have been released and no automatic reconnection will occur
   */
  Disconnected = 4,
}

/**
 * Voice Gateway Version
 *
 * Enumeration of supported Voice Gateway protocol versions.
 * Each version introduces specific features, changes, or improvements.
 *
 * When establishing a connection, clients must specify which protocol
 * version they support.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#voice-gateway-versioning}
 */
export enum VoiceGatewayVersion {
  /**
   * Initial version
   * Basic voice functionality without advanced features
   * @deprecated Will be discontinued after November 18th, 2024
   */
  V1 = 1,

  /**
   * Added heartbeat reply from server to heartbeat ACK opcode
   * @deprecated Will be discontinued after November 18th, 2024
   */
  V2 = 2,

  /**
   * Added video support
   * @deprecated Will be discontinued after November 18th, 2024
   */
  V3 = 3,

  /**
   * Changed speaking status to bitmask from boolean
   * Minimum required version after November 18th, 2024
   */
  V4 = 4,

  /**
   * Added video sink wants opcode
   * Introduced video stream configuration options
   */
  V5 = 5,

  /**
   * Added code version opcode
   * Enabled version compatibility checks
   */
  V6 = 6,

  /**
   * Added channel options opcode
   * Introduced enhanced channel configuration
   */
  V7 = 7,

  /**
   * Added server message buffering
   * Missed messages are re-delivered on resume
   * Current recommended version
   */
  V8 = 8,
}

/**
 * Dave Protocol Version
 *
 * Enumeration of supported End-to-End Encryption (DAVE) protocol versions.
 * This protocol enables secure communication directly between clients,
 * preventing intermediaries from accessing content.
 *
 * @see {@link https://daveprotocol.com}
 */
export enum DaveProtocolVersion {
  /**
   * No DAVE protocol support
   * Transport encryption only, without end-to-end encryption
   */
  None = 0,

  /**
   * Initial version of the DAVE protocol
   * Basic E2EE functionality for audio frames
   */
  V1 = 1,
}

/**
 * Speaking Mode
 *
 * Bitwise flags representing different types of audio transmission.
 * These modes indicate the nature and priority of voice data being sent,
 * which affects how it's displayed and processed by receivers.
 *
 * Multiple flags can be combined using bitwise OR operations.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export enum SpeakingMode {
  /**
   * Normal transmission of voice audio
   * Standard microphone input with speaking indicator
   */
  Microphone = 1 << 0,

  /**
   * Transmission of context audio for video
   * Background audio without speaking indicator
   */
  Soundshare = 1 << 1,

  /**
   * Priority speaker mode
   * Reduces audio volume of other speakers when active
   */
  Priority = 1 << 2,
}

/**
 * Voice Encryption Mode
 *
 * Enumeration of supported encryption methods for voice data transport.
 * These modes define how audio data is secured during transmission between
 * client and Discord's voice servers.
 *
 * Not all modes may be available for all connections; clients should
 * select from the modes reported in the Ready payload.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-modes}
 */
export enum VoiceEncryptionMode {
  /**
   * AES-256-GCM encryption with RTP size header protection
   * Preferred mode when available
   */
  AeadAes256GcmRtpSize = "aead_aes256_gcm_rtpsize",

  /**
   * XChaCha20-Poly1305 encryption with RTP size header protection
   * Required fallback mode when AES-256-GCM is unavailable
   */
  AeadXChaCha20Poly1305RtpSize = "aead_xchacha20_poly1305_rtpsize",

  /**
   * XSalsa20-Poly1305 encryption with fixed RTP header size
   * @deprecated Will be discontinued after November 18th, 2024
   */
  XSalsa20Poly1305Lite = "xsalsa20_poly1305_lite",

  /**
   * AES-256-GCM encryption with fixed RTP header size
   * @deprecated Will be discontinued after November 18th, 2024
   */
  AeadAes256Gcm = "aead_aes256_gcm",

  /**
   * XSalsa20-Poly1305 encryption with RTP header as nonce
   * @deprecated Will be discontinued after November 18th, 2024
   */
  XSalsa20Poly1305 = "xsalsa20_poly1305",

  /**
   * XSalsa20-Poly1305 encryption with 24 random bytes suffix
   * @deprecated Will be discontinued after November 18th, 2024
   */
  XSalsa20Poly1305Suffix = "xsalsa20_poly1305_suffix",

  /**
   * XSalsa20-Poly1305 encryption with 32-bit counter
   * @deprecated Will be discontinued after November 18th, 2024
   */
  XSalsa20Poly1305LiteRtpSize = "xsalsa20_poly1305_lite_rtpsize",
}

/**
 * Voice Close Event Codes
 *
 * Specific WebSocket close codes used by Discord's Voice Gateway.
 * These codes indicate various error conditions and reasons for connection closure.
 *
 * Understanding these codes is essential for implementing proper reconnection
 * logic and troubleshooting voice connection issues.
 *
 * @see {@link https://discord.com/developers/docs/topics/opcodes-and-status-codes#voice-voice-close-event-codes}
 */
export enum VoiceCloseEventCode {
  /**
   * You sent an invalid opcode
   * Client sent an opcode that doesn't exist or isn't recognized
   */
  UnknownOpcode = 4001,

  /**
   * You sent an invalid payload in your identifying to the Gateway
   * Malformed data in the Identify payload
   */
  FailedToDecodePayload = 4002,

  /**
   * You sent a payload before identifying with the Gateway
   * Operations sent before authentication was completed
   */
  NotAuthenticated = 4003,

  /**
   * The token you sent in your identify payload is invalid
   * Authentication credentials aren't valid for this connection
   */
  AuthenticationFailed = 4004,

  /**
   * You sent more than one identify payload
   * Multiple authentication attempts detected
   */
  AlreadyAuthenticated = 4005,

  /**
   * Your session is no longer valid
   * Previously established session has expired or been invalidated
   */
  SessionNoLongerValid = 4006,

  /**
   * Your session has timed out
   * Connection inactive for too long
   */
  SessionTimeout = 4009,

  /**
   * We can't find the server you're trying to connect to
   * Target voice server doesn't exist or is unavailable
   */
  ServerNotFound = 4011,

  /**
   * We didn't recognize the protocol you sent
   * Unsupported or unrecognized voice protocol selected
   */
  UnknownProtocol = 4012,

  /**
   * Channel was deleted, you were kicked, voice server changed, or the main gateway session was dropped
   * External event disrupted the voice connection
   */
  Disconnected = 4014,

  /**
   * The server crashed. Our bad! Try resuming.
   * Temporary server-side failure occurred
   */
  VoiceServerCrashed = 4015,

  /**
   * We didn't recognize your encryption
   * Selected encryption method isn't supported or implemented properly
   */
  UnknownEncryptionMode = 4016,

  /**
   * The request was invalid
   * Malformed or incorrect request sent to the server
   */
  BadRequest = 4020,
}

/**
 * Base Voice Gateway Payload
 *
 * Common structure for all payloads sent and received through
 * the Discord Voice Gateway WebSocket connection.
 *
 * Every voice gateway message follows this format, with specific
 * data structures in the 'd' field according to the opcode.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections}
 */
export interface VoicePayloadEntity<T = any> {
  /**
   * Opcode for the payload
   * Defines the type of operation represented by the payload
   */
  op: VoiceOpcodes;

  /**
   * Event data specific to the opcode
   * Structure varies based on the opcode and is defined in separate interfaces
   */
  d: T;

  /**
   * Sequence number of this payload
   * Only present in some server-sent binary messages since gateway version 8
   */
  seq?: number;
}

/**
 * Voice Gateway Identify Payload
 *
 * Sent by clients to begin a voice websocket connection.
 * This is the first operation sent after connecting, containing
 * the authentication and session information needed to establish
 * a voice connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection}
 */
export interface VoiceIdentifyEntity {
  /**
   * Server ID (guild ID) this voice connection is for
   * Identifies which guild's voice server to connect to
   */
  server_id: Snowflake;

  /**
   * User ID of the client establishing the connection
   * Identifies which user is authenticating
   */
  user_id: Snowflake;

  /**
   * Session ID obtained from the main gateway
   * Links this voice connection to the main gateway session
   */
  session_id: string;

  /**
   * Voice server token received from voice server update event
   * Used for authentication with the voice server
   */
  token: string;

  /**
   * Highest DAVE protocol version supported by the client
   * Omitting or sending 0 indicates no DAVE protocol support
   */
  max_dave_protocol_version?: DaveProtocolVersion;
}

/**
 * Voice Ready Payload
 *
 * Sent by the server in response to a successful Identify operation.
 * Contains the information needed to establish the UDP connection
 * for voice data transmission.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-websocket-connection}
 */
export interface VoiceReadyEntity {
  /**
   * Synchronization Source identifier for this user
   * Used in RTP headers to identify the stream source
   */
  ssrc: number;

  /**
   * Voice server IP address for UDP connections
   * Target address for voice data packets
   */
  ip: string;

  /**
   * Voice server port for UDP connections
   * Target port for voice data packets
   */
  port: number;

  /**
   * Available encryption modes supported by the server
   * Client must select one of these modes for media encryption
   */
  modes: VoiceEncryptionMode[];

  /**
   * Heartbeat interval in milliseconds
   * @deprecated This field is erroneous and should be ignored
   * The correct interval comes from the Hello payload
   */
  heartbeat_interval: number;
}

/**
 * Voice Hello Payload
 *
 * Sent by the server immediately after connecting to the voice gateway.
 * Defines the heartbeat interval that the client must use to maintain
 * the connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHelloEntity {
  /**
   * Interval in milliseconds at which clients should send heartbeats
   * Clients must adhere to this interval to prevent disconnection
   */
  heartbeat_interval: number;
}

/**
 * Voice Select Protocol Payload
 *
 * Sent by clients to select the voice protocol to use after
 * receiving the Ready payload and completing IP discovery if needed.
 * This informs Discord which protocol and encryption method to use
 * for this voice connection.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection}
 */
export interface VoiceSelectProtocolEntity {
  /**
   * Voice protocol to use
   * Currently only "udp" is supported
   */
  protocol: "udp";

  /**
   * Connection data for the selected protocol
   * Contains network information and encryption parameters
   */
  data: {
    /**
     * Client's discovered external IP address
     * Obtained through IP discovery or local network configuration
     */
    address: string;

    /**
     * Client's discovered external UDP port
     * Obtained through IP discovery or local network configuration
     */
    port: number;

    /**
     * Selected encryption mode from the supported modes list
     * Must be one of the modes provided in the Ready payload
     */
    mode: VoiceEncryptionMode;
  };
}

/**
 * Voice Session Description Payload
 *
 * Sent by the server in response to a successful Select Protocol operation.
 * Contains the encryption key and parameters needed to secure voice data
 * transmission.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#establishing-a-voice-udp-connection}
 */
export interface VoiceSessionDescriptionEntity {
  /**
   * Selected encryption mode for this session
   * Confirms the mode requested in Select Protocol
   */
  mode: VoiceEncryptionMode;

  /**
   * Array of bytes representing the encryption key
   * Used for encrypting and decrypting voice data
   */
  secret_key: number[];

  /**
   * DAVE protocol version to use for this call
   * Present only if the call is using the DAVE protocol
   */
  dave_protocol_version?: DaveProtocolVersion;
}

/**
 * Voice Speaking Payload
 *
 * Sent by clients to indicate their speaking status.
 * This must be sent at least once before sending audio data,
 * and should be updated whenever speaking status changes.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export interface VoiceSpeakingEntity {
  /**
   * Bitwise mask of speaking modes
   * Indicates the type of audio being transmitted
   */
  speaking: number;

  /**
   * Delay in milliseconds between sending the speaking payload and audio data
   * Should be 0 for bots using the voice gateway
   */
  delay: number;

  /**
   * SSRC of the user speaking
   * Must match the SSRC provided in the Ready payload
   */
  ssrc: number;
}

/**
 * Voice Heartbeat Payload
 *
 * Sent by clients periodically to keep the connection alive.
 * Must be sent at the interval specified in the Hello payload.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#heartbeating}
 */
export interface VoiceHeartbeatEntity {
  /**
   * Unix timestamp in milliseconds
   * Current client time when heartbeat was sent
   */
  t: number;

  /**
   * Sequence number of last numbered message received from the gateway
   * Only required in gateway version 8 and above
   */
  seq_ack?: number;
}

/**
 * Voice Resume Payload
 *
 * Sent by clients to resume a disconnected session.
 * This allows reconnecting without going through the full
 * identification and negotiation process again.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#resuming-voice-connection}
 */
export interface VoiceResumeEntity {
  /**
   * Server ID (guild ID) this voice connection is for
   * Must match the server_id used in the original Identify payload
   */
  server_id: Snowflake;

  /**
   * Session ID from the original connection
   * Must match the session_id used in the original Identify payload
   */
  session_id: string;

  /**
   * Voice server token from the original connection
   * Must match the token used in the original Identify payload
   */
  token: string;

  /**
   * Sequence number of last numbered message received from the gateway
   * Only required in gateway version 8 and above
   */
  seq_ack?: number;
}

/**
 * Dave Protocol Prepare Transition Entity
 *
 * Sent by the server to prepare clients for a protocol transition.
 * This announces protocol upgrades, downgrades, or MLS group changes.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveProtocolPrepareTransitionEntity {
  /**
   * Unique identifier for this transition
   * Used to correlate transition-ready and execute-transition messages
   */
  transition_id: string;

  /**
   * Target DAVE protocol version for this transition
   * Version 0 indicates a downgrade to non-E2EE
   */
  protocol_version: DaveProtocolVersion;
}

/**
 * Dave Protocol Transition Ready Entity
 *
 * Sent by clients to indicate readiness for a protocol transition.
 * After preparing local state for the transition, clients send this
 * to signal they are ready to execute the change.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveProtocolTransitionReadyEntity {
  /**
   * Transition identifier matching the prepare transition message
   * Used to identify which transition the client is ready for
   */
  transition_id: string;
}

/**
 * Dave Protocol Execute Transition Entity
 *
 * Sent by the server to execute a protocol transition.
 * When clients receive this message, they should begin using
 * the new protocol context for media transmission.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveProtocolExecuteTransitionEntity {
  /**
   * Transition identifier matching the prepare transition message
   * Confirms which transition is being executed
   */
  transition_id: string;
}

/**
 * Dave Protocol Prepare Epoch Entity
 *
 * Sent by the server to prepare for an MLS epoch transition.
 * This announces protocol version changes or initial group creation.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveProtocolPrepareEpochEntity {
  /**
   * Transition identifier for this epoch change
   * Used to correlate with transition-ready and execute-transition messages
   */
  transition_id: string;

  /**
   * Epoch identifier for the upcoming MLS epoch
   * Epoch 1 indicates initial group creation
   */
  epoch_id: number;

  /**
   * DAVE protocol version for the new epoch
   * Specifies which protocol version will be used after transition
   */
  protocol_version: DaveProtocolVersion;
}

/**
 * Dave MLS External Sender Package Entity
 *
 * Sent by the server to provide the external sender information.
 * The external sender is used by the voice gateway to propose
 * member additions and removals for the MLS group.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsExternalSenderPackageEntity {
  /**
   * Public key for the external sender
   * Used to verify proposals from the voice gateway
   */
  public_key: Uint8Array;

  /**
   * Credential for the external sender
   * Used to authenticate the external sender identity
   */
  credential: Uint8Array;
}

/**
 * Dave MLS Key Package Entity
 *
 * Sent by clients to deliver a new MLS key package.
 * This package is used when proposing to add the client to an MLS group.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsKeyPackageEntity {
  /**
   * Binary MLS key package data
   * Contains client's public keys and supported cryptographic capabilities
   */
  key_package: Uint8Array;
}

/**
 * Dave MLS Proposals Entity
 *
 * Sent by the server to deliver MLS proposals.
 * Clients must append or revoke these proposals in their local MLS state.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsProposalsEntity {
  /**
   * Proposals to append to the local MLS group
   * Each proposal is a binary MLS proposal message
   */
  proposals_to_append: Uint8Array[];

  /**
   * Proposals to revoke from the local MLS group
   * Each entry is a binary MLS proposal message
   */
  proposals_to_revoke: Uint8Array[];
}

/**
 * Dave MLS Commit Welcome Entity
 *
 * Sent by clients to deliver MLS commit and welcome messages.
 * After processing proposals, clients generate a commit and optional
 * welcome messages to update the MLS group state.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsCommitWelcomeEntity {
  /**
   * Binary MLS commit message
   * Updates the MLS group state based on previously received proposals
   */
  commit: Uint8Array;

  /**
   * Array of binary MLS welcome messages
   * One welcome message for each new member being added to the group
   */
  welcomes: Uint8Array[];
}

/**
 * Dave MLS Announce Commit Transition Entity
 *
 * Sent by the server to announce the winning commit for an MLS epoch.
 * This commit will be used to update the MLS group state during transition.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsAnnounceCommitTransitionEntity {
  /**
   * Transition identifier for this commit
   * Used to correlate with transition-ready and execute-transition messages
   */
  transition_id: string;

  /**
   * Binary MLS commit message
   * The "winning" commit chosen by the voice gateway
   */
  commit: Uint8Array;
}

/**
 * Dave MLS Welcome Entity
 *
 * Sent by the server to deliver an MLS welcome message.
 * This welcome message adds the client to an existing MLS group.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsWelcomeEntity {
  /**
   * Transition identifier for this welcome
   * Used to correlate with transition-ready and execute-transition messages
   */
  transition_id: string;

  /**
   * Binary MLS welcome message
   * Contains encrypted group information and keys for the new member
   */
  welcome: Uint8Array;
}

/**
 * Dave MLS Invalid Commit Welcome Entity
 *
 * Sent by clients to report an unprocessable MLS message.
 * This indicates that the client could not process a commit or welcome
 * message and needs to be re-added to the group.
 *
 * @see {@link https://daveprotocol.com/#voice-gateway-opcodes}
 */
export interface DaveMlsInvalidCommitWelcomeEntity {
  /**
   * Error message describing why the commit or welcome was invalid
   * Provides diagnostic information for troubleshooting
   */
  error: string;
}

/**
 * Voice RTP Packet
 *
 * Structure of voice RTP (Real-time Transport Protocol) packets
 * used for transmitting audio data over UDP.
 *
 * Each packet contains header information and encrypted audio data.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-and-sending-voice}
 */
export interface VoiceRtpPacketEntity {
  /**
   * Version and flags byte (0x80)
   * First byte of the RTP header
   */
  version: number;

  /**
   * Payload type byte (0x78)
   * Second byte of the RTP header
   */
  payloadType: number;

  /**
   * Sequence number (big endian)
   * Used to order packets and detect losses
   */
  sequence: number;

  /**
   * Timestamp (big endian)
   * Used for media synchronization
   */
  timestamp: number;

  /**
   * Synchronization source identifier
   * Matches the SSRC provided in the Ready payload
   */
  ssrc: number;

  /**
   * Encrypted Opus audio data
   * Contains the actual voice content protected by encryption
   */
  encryptedAudio: Uint8Array;
}

/**
 * Dave E2EE Opus Frame
 *
 * Structure of end-to-end encrypted Opus audio frames.
 * This format is used when the DAVE protocol is enabled,
 * providing additional encryption on top of transport security.
 *
 * @see {@link https://daveprotocol.com/#audio-frame-e2ee}
 */
export interface DaveE2eeOpusFrameEntity {
  /**
   * Encrypted Opus frame data
   * Ciphertext produced by AES-128-GCM encryption
   */
  encryptedFrame: Uint8Array;

  /**
   * Truncated AES-128-GCM authentication tag (8 bytes)
   * Verifies the integrity of the encrypted data
   */
  authTag: Uint8Array;

  /**
   * ULEB128-encoded synchronization nonce
   * Used for encryption/decryption and avoiding nonce reuse
   */
  nonce: Uint8Array;

  /**
   * ULEB128-encoded pairs of offset/length for unencrypted data
   * Empty for Opus frames as they are fully encrypted
   */
  unencryptedRanges: Uint8Array;

  /**
   * Size in bytes of supplemental data
   * Sum of auth tag, nonce, unencrypted ranges, and markers
   */
  supplementalDataSize: number;

  /**
   * Magic marker (0xFAFA)
   * Used to identify protocol frames
   */
  magicMarker: number;
}

/**
 * IP Discovery Packet
 *
 * Structure for IP discovery packets used to determine a client's
 * external IP address and port for UDP voice communication.
 *
 * These packets are exchanged during the voice connection setup
 * to enable proper NAT traversal.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#ip-discovery}
 */
export interface IpDiscoveryPacketEntity {
  /**
   * Type of packet (1 for request, 2 for response)
   * Indicates whether this is a client request or server response
   */
  type: number;

  /**
   * Message length excluding Type and Length fields (70)
   * Fixed size for IP discovery packets
   */
  length: number;

  /**
   * SSRC identifier from the Ready payload
   * Links this discovery packet to a specific voice connection
   */
  ssrc: number;

  /**
   * External IP address (null-terminated string in response)
   * Server provides the client's external IP in responses
   */
  address: string;

  /**
   * External UDP port
   * Server provides the client's external port in responses
   */
  port: number;
}
