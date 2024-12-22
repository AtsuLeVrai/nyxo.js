import type { Snowflake } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
 */
export enum StageInstancePrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-stage-instance-structure}
 */
export interface StageInstanceEntity {
  id: Snowflake;
  guild_id: Snowflake;
  channel_id: Snowflake;
  topic: string;
  privacy_level: StageInstancePrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: Snowflake | null;
}
