export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

export enum ActivityType {
  Game = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

export interface ActivityButtonData {
  label: string;
  url: string;
}

export interface ActivitySecretsData {
  join?: string;
  spectate?: string;
  match?: string;
}

export interface ActivityAssetImageData {
  large_text?: string;
  large_image?: string;
  small_text?: string;
  small_image?: string;
}

export interface ActivityPartyData {
  id?: string;
  size?: [number, number];
}

export interface ActivityEmojiData {
  name: string;
  id?: string;
  animated?: boolean;
}

export interface ActivityTimestampsData {
  start?: number;
  end?: number;
}

export interface ActivityData {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: number;
  timestamps?: ActivityTimestampsData;
  application_id?: string;
  details?: string | null;
  state?: string | null;
  emoji?: ActivityEmojiData | null;
  party?: ActivityPartyData;
  assets?: ActivityAssetImageData;
  secrets?: ActivitySecretsData;
  instance?: boolean;
  flags?: ActivityFlags;
  buttons?: ActivityButtonData[];
}
