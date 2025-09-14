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
