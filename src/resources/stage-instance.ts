import type { Snowflake } from "../common/index.js";

export enum PrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

export interface StageInstanceObject {
  id: Snowflake;
  guild_id: Snowflake;
  channel_id: Snowflake;
  topic: string;
  privacy_level: PrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: Snowflake | null;
}
