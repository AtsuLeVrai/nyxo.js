import { z } from "zod";
import { Snowflake } from "../managers/index.js";

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
export const StageInstanceEntity = z.object({
  id: Snowflake,
  guild_id: Snowflake,
  channel_id: Snowflake,
  topic: z.string().min(1).max(120),
  privacy_level: z.nativeEnum(StageInstancePrivacyLevel),
  /** @deprecated */
  discoverable_disabled: z.boolean(),
  guild_scheduled_event_id: Snowflake.nullable(),
});

export type StageInstanceEntity = z.infer<typeof StageInstanceEntity>;
