export enum StageInstancePrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

export interface StageInstanceEntity {
  id: string;
  guild_id: string;
  channel_id: string;
  topic: string;
  privacy_level: StageInstancePrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: string | null;
}
