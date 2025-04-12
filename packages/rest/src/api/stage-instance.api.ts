import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for creating a new Stage instance.
 *
 * A Stage instance holds information about a live stage in a Stage channel.
 * Creating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface CreateStageInstanceSchema {
  /**
   * The ID of the Stage channel.
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters).
   * This is the blurb that gets shown below the channel's name, among other places.
   */
  topic: string;

  /**
   * The privacy level of the Stage instance.
   * Defaults to GUILD_ONLY (2) if not specified.
   */
  privacy_level?: StageInstancePrivacyLevel;

  /**
   * Whether to notify @everyone that a Stage instance has started.
   * The stage moderator must have the MENTION_EVERYONE permission for this notification to be sent.
   */
  send_start_notification?: boolean;

  /**
   * The ID of the scheduled event associated with this Stage instance, if any.
   */
  guild_scheduled_event_id?: Snowflake | null;
}

/**
 * Interface for modifying an existing Stage instance.
 *
 * Updating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * All fields are optional, allowing partial updates to the Stage instance.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export interface ModifyStageInstanceSchema {
  /**
   * The topic of the Stage instance (1-120 characters).
   */
  topic?: string;

  /**
   * The privacy level of the Stage instance.
   */
  privacy_level?: StageInstancePrivacyLevel;
}

/**
 * Router class for handling Discord Stage Instance endpoints.
 *
 * A Stage instance holds information about a live stage in a Stage channel.
 * Stage channels are specialized voice channels that allow better control for
 * audio conversations with many users, like panel discussions or AMAs.
 *
 * Key concepts:
 * - Liveness: A Stage channel is considered "live" when it has an associated Stage instance
 * - Speakers: Participants whose voice state is not suppressed and have no request_to_speak_timestamp
 * - Moderators: Members with MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
export class StageInstanceApi {
  /**
   * Collection of route patterns for Stage Instance endpoints.
   */
  static readonly ROUTES = {
    /**
     * Base route for Stage Instances.
     */
    stageInstancesBase: "/stage-instances" as const,

    /**
     * Route for a specific Stage Instance.
     * @param channelId - The ID of the Stage channel
     * @returns The endpoint path
     */
    stageInstance: (channelId: Snowflake) =>
      `/stage-instances/${channelId}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new Stage Instance associated with a Stage channel.
   *
   * This effectively makes the Stage channel "live".
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Note: When a Stage channel has no speakers for a certain period of time
   * (on the order of minutes), the Stage instance will be automatically deleted.
   *
   * Fires a Stage Instance Create Gateway event.
   *
   * @param options - Options for creating the Stage Instance
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created Stage Instance entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: CreateStageInstanceSchema,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.post(StageInstanceApi.ROUTES.stageInstancesBase, {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Gets the Stage Instance associated with a Stage channel, if it exists.
   *
   * @param channelId - The ID of the Stage channel to get the instance for
   * @returns A promise resolving to the Stage Instance entity
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.#rest.get(StageInstanceApi.ROUTES.stageInstance(channelId));
  }

  /**
   * Updates fields of an existing Stage Instance.
   *
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Fires a Stage Instance Update Gateway event.
   *
   * @param channelId - The ID of the Stage channel with the instance to modify
   * @param options - Options for modifying the Stage Instance
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated Stage Instance entity
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  modifyStageInstance(
    channelId: Snowflake,
    options: ModifyStageInstanceSchema,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.patch(StageInstanceApi.ROUTES.stageInstance(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * Deletes a Stage Instance, effectively ending the "live" status of the Stage channel.
   *
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Fires a Stage Instance Delete Gateway event.
   *
   * @param channelId - The ID of the Stage channel with the instance to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance(channelId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(StageInstanceApi.ROUTES.stageInstance(channelId), {
      reason,
    });
  }
}
