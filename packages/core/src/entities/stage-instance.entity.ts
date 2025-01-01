import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level}
 */
export const StageInstancePrivacyLevel = {
  public: 1,
  guildOnly: 2,
} as const;

export type StageInstancePrivacyLevel =
  (typeof StageInstancePrivacyLevel)[keyof typeof StageInstancePrivacyLevel];

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-stage-instance-structure}
 */
export const StageInstanceSchema = z
  .object({
    id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    channel_id: SnowflakeSchema,
    topic: z.string().min(1).max(120),
    privacy_level: z.nativeEnum(StageInstancePrivacyLevel),
    /** @deprecated */
    discoverable_disabled: z.boolean(),
    guild_scheduled_event_id: SnowflakeSchema.nullable(),
  })
  .strict();

export type StageInstanceEntity = z.infer<typeof StageInstanceSchema>;
