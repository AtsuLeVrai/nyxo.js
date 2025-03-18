import { StageInstanceEntity, StageInstancePrivacyLevel } from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for creating a new Stage instance.
 *
 * A Stage instance holds information about a live stage in a Stage channel.
 * Creating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export const CreateStageInstanceSchema = z.object({
  /**
   * The ID of the Stage channel.
   * Reuses the validation from StageInstanceEntity.
   */
  channel_id: StageInstanceEntity.shape.channel_id,

  /**
   * The topic of the Stage instance (1-120 characters).
   * This is the blurb that gets shown below the channel's name, among other places.
   * Reuses the validation from StageInstanceEntity.
   */
  topic: StageInstanceEntity.shape.topic,

  /**
   * The privacy level of the Stage instance.
   * Defaults to GUILD_ONLY (2) if not specified.
   * Reuses the validation from StageInstanceEntity.
   */
  privacy_level: StageInstanceEntity.shape.privacy_level
    .optional()
    .default(StageInstancePrivacyLevel.GuildOnly),

  /**
   * Whether to notify @everyone that a Stage instance has started.
   * The stage moderator must have the MENTION_EVERYONE permission for this notification to be sent.
   */
  send_start_notification: z.boolean().optional(),

  /**
   * The ID of the scheduled event associated with this Stage instance, if any.
   * Reuses the validation from StageInstanceEntity.
   */
  guild_scheduled_event_id:
    StageInstanceEntity.shape.guild_scheduled_event_id.optional(),
});

export type CreateStageInstanceSchema = z.input<
  typeof CreateStageInstanceSchema
>;

/**
 * Schema for modifying an existing Stage instance.
 *
 * Updating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * All fields are optional, allowing partial updates to the Stage instance.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export const ModifyStageInstanceSchema = z.object({
  /**
   * The topic of the Stage instance (1-120 characters).
   * Reuses the validation from StageInstanceEntity.
   */
  topic: StageInstanceEntity.shape.topic.optional(),

  /**
   * The privacy level of the Stage instance.
   * Reuses the validation from StageInstanceEntity.
   */
  privacy_level: StageInstanceEntity.shape.privacy_level.optional(),
});

export type ModifyStageInstanceSchema = z.input<
  typeof ModifyStageInstanceSchema
>;
