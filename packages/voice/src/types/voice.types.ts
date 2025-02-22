import type { VoiceEncryptionMode } from "../services/index.js";

export enum VoiceConnectionState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Ready = "ready",
  Resuming = "resuming",
}

export enum VoiceSpeakingFlags {
  None = 0,
  Microphone = 1 << 0,
  Soundshare = 1 << 1,
  Priority = 1 << 2,
}

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
  DaveProtocolPrepareTransition = 21,
  DaveProtocolExecute = 22,
  DaveProtocolTransitionReady = 23,
  DaveProtocolPrepareEpoch = 24,
  DaveMlsExternalSenderPackage = 25,
  DaveMlsKeyPackage = 26,
  DaveMlsProposals = 27,
  DaveMlsCommitWelcome = 28,
  DaveMlsAnnounceCommitTransition = 29,
  DaveMlsWelcome = 30,
  DaveMlsInvalidCommitWelcome = 31,
}

export interface GatewayVoiceStateUpdate {
  guild_id: string;
  channel_id: string | null;
  self_mute: boolean;
  self_deaf: boolean;
}

export interface GatewayVoiceServerUpdate {
  token: string;
  guild_id: string;
  endpoint: string;
}

export interface VoiceUdpConfig {
  ip: string;
  port: number;
  ssrc: number;
  modes: VoiceEncryptionMode[];
}

export interface VoiceIdentifyData {
  server_id: string;
  user_id: string;
  session_id: string;
  token: string;
}

export interface VoiceServerInfo extends VoiceIdentifyData {
  token: string;
  endpoint: string;
}

export interface VoiceReadyData {
  ssrc: number;
  ip: string;
  port: number;
  modes: VoiceEncryptionMode[];
  experiments: string[];
  streams?: Array<{
    type: number;
    ssrc: number;
    rid: string;
    quality: number;
  }>;
  heartbeat_interval: number;
}

export interface DaveProtocolTransitionData {
  transition_id: string;
}

export interface DaveProtocolEpochData extends DaveProtocolTransitionData {
  epoch_id: number;
}

export interface DaveMlsExternalSenderData {
  public_key: string;
  credential: string;
}

export interface DaveMlsKeyPackageData {
  key_package: string;
}

export interface DaveMlsProposalsData {
  proposals: string[];
}

export interface DaveMlsCommitWelcomeData {
  commit: string;
  welcome?: string[];
}

export interface VoiceSessionDescriptionData {
  mode: VoiceEncryptionMode;
  secret_key: number[];
  audio_codec: string;
  video_codec: string;
  media_session_id: string;
  dave_protocol_version?: DaveProtocolVersion;
}

export interface VoiceSpeakingData {
  speaking: number;
  delay: number;
  ssrc: number;
  user_id?: string;
}

export interface VoiceSelectProtocolData {
  protocol: "udp";
  data: {
    address: string;
    port: number;
    mode: VoiceEncryptionMode;
  };
}

export interface VoiceHelloData {
  v: number;
  heartbeat_interval: number;
}

export interface VoiceResumeDataV8 {
  server_id: string;
  session_id: string;
  token: string;
  seq_ack: number;
}

export interface VoiceResumeDataLegacy {
  server_id: string;
  session_id: string;
  token: string;
}

export interface VoiceHeartbeatDataV8 {
  t: number;
  seq_ack: number;
}

export interface VoiceHeartbeatAckData {
  t: number;
}

export interface BinaryMessage {
  sequenceNumber?: number;
  opcode: number;
  payload: Buffer;
}

export interface IpDiscoveryPacket {
  type: number;
  length: number;
  ssrc: number;
  address: string;
  port: number;
}

export interface VoicePayloadEntity {
  op: VoiceOpcodes;
  d: object | number | null;
  seq?: number;
  t?: string;
  s?: number;
}

export interface MlsGroup {
  epoch: number;
  keyPackage: Buffer;
  externalSender: {
    publicKey: string;
    credential: string;
  };
}

export interface MlsProposalData {
  proposals: string[];
}

export interface MlsCommitData {
  commit: string;
  welcome?: string[];
}

export interface DaveProtocolTransitionInfo {
  transitionId: string;
  epochId?: number;
}

export interface MlsExternalSenderData {
  publicKey: string;
  credential: string;
}

export interface E2eeFrame {
  opusFrame: Buffer;
  nonce: number;
  authTag: Buffer;
  unencryptedRanges: Array<{ offset: number; length: number }>;
  magicMarker: number;
}

export interface MlsFrameEncryptionContext {
  generation: number;
  senderKey: Buffer;
  receiverKeys: Map<number, Buffer>;
}

export interface MlsKeyInfo {
  secretKey: Buffer;
  publicKey: Buffer;
  keyId: string;
}

export type DaveProtocolVersion = 0 | 1;

export interface DaveProtocolState {
  version: DaveProtocolVersion;
  enabled: boolean;
  group: MlsGroup | null;
  pendingTransition: DaveProtocolTransitionInfo | null;
  encryptionContext: MlsFrameEncryptionContext | null;
}

export interface BinaryDavePayload extends BinaryMessage {
  sequenceNumber: number;
  payload: Buffer;
}

export type VoiceSendEvents = {
  [VoiceOpcodes.Identify]: VoiceIdentifyData;
  [VoiceOpcodes.SelectProtocol]: VoiceSelectProtocolData;
  [VoiceOpcodes.Heartbeat]: VoiceHeartbeatDataV8;
  [VoiceOpcodes.Speaking]: VoiceSpeakingData;
  [VoiceOpcodes.Resume]: VoiceResumeDataV8;
  [VoiceOpcodes.DaveProtocolTransitionReady]: DaveProtocolTransitionData;
  [VoiceOpcodes.DaveMlsKeyPackage]: DaveMlsKeyPackageData;
  [VoiceOpcodes.DaveMlsCommitWelcome]: DaveMlsCommitWelcomeData;
  [VoiceOpcodes.DaveMlsInvalidCommitWelcome]: Record<string, never>;
};

export interface VoiceConnectionEvents {
  debug: [message: string];
  warn: [message: string];
  error: [error: Error];
  stateChange: [state: VoiceConnectionState];
  ready: [data: VoiceReadyData];
  resumed: [];
  sessionDescription: [data: VoiceSessionDescriptionData];
  speaking: [data: VoiceSpeakingData];
  clientDisconnect: [data: { user_id: string }];
  daveProtocolExecute: [data: DaveProtocolTransitionData];
  daveProtocolPrepareEpoch: [data: DaveProtocolEpochData];
  daveMlsExternalSender: [data: DaveMlsExternalSenderData];
  daveMlsProposals: [data: DaveMlsProposalsData];
  daveMlsCommitWelcome: [data: DaveMlsCommitWelcomeData];
  timeout: [];
  discovered: [ip: string, port: number];
  retrying: [attempt: number];
  daveStateChange: [state: DaveProtocolState];
  transitionReady: [transitionId: string];
}
