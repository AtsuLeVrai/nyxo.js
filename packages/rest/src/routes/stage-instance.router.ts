import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for creating a new Stage instance.
 *
 * A Stage instance represents the "live" state of a Stage channel,
 * containing metadata like topic and visibility settings.
 *
 * @remarks
 * Creating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface StageCreateOptions {
  /**
   * The ID of the Stage channel.
   *
   * Must be a valid Stage channel ID within the guild.
   * The channel must be of type GUILD_STAGE_VOICE (13).
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters).
   *
   * This is displayed prominently in the Stage UI, showing up below
   * the channel's name and in various Stage discovery interfaces.
   */
  topic: string;

  /**
   * The privacy level of the Stage instance.
   *
   * Controls who can see the Stage in discovery surfaces.
   * Defaults to GUILD_ONLY (2) if not specified.
   */
  privacy_level?: StageInstancePrivacyLevel;

  /**
   * Whether to notify @everyone that a Stage instance has started.
   *
   * When true, sends a notification to the guild that the Stage has begun.
   * The stage moderator must have the MENTION_EVERYONE permission for this
   * notification to be sent.
   */
  send_start_notification?: boolean;

  /**
   * The ID of the scheduled event associated with this Stage instance, if any.
   *
   * When specified, connects this Stage instance to a scheduled event, allowing
   * interested users to easily join and see the Stage in the event details.
   */
  guild_scheduled_event_id?: Snowflake | null;
}

/**
 * Interface for modifying an existing Stage instance.
 *
 * This interface allows updating the metadata for a Stage that is already live.
 * All fields are optional, allowing partial updates.
 *
 * @remarks
 * Updating a Stage instance requires the user to be a moderator of the Stage channel,
 * which means having the MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export interface StageUpdateOptions {
  /**
   * The topic of the Stage instance (1-120 characters).
   *
   * Updates the displayed topic for the Stage.
   */
  topic?: string;

  /**
   * The privacy level of the Stage instance.
   *
   * Updates the visibility settings for the Stage.
   */
  privacy_level?: StageInstancePrivacyLevel;
}

/**
 * Router for Discord Stage Instance-related endpoints.
 *
 * This class provides methods to interact with Discord's Stage Instance system,
 * allowing creation, management, and deletion of Stage sessions within Stage channels.
 *
 * @remarks
 * A Stage instance holds information about a live stage in a Stage channel.
 * Stage channels are specialized voice channels that allow better control for
 * audio conversations with many users, like panel discussions, AMAs, or performances.
 *
 * Key concepts:
 * - Liveness: A Stage channel is considered "live" when it has an associated Stage instance
 * - Speakers: Participants whose voice state is not suppressed and have no request_to_speak_timestamp
 * - Audience: Participants whose voice state is suppressed (can only listen)
 * - Moderators: Members with MANAGE_CHANNELS, MUTE_MEMBERS, and MOVE_MEMBERS permissions
 *
 * When no speakers remain in a Stage for a period of time (typically a few minutes),
 * the Stage instance is automatically deleted.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
export class StageInstanceRouter {
  /**
   * API route constants for Stage Instance endpoints.
   */
  static readonly STAGE_ROUTES = {
    /**
     * Base route for Stage Instances.
     *
     * Used for creating new Stage instances.
     */
    stageInstancesEndpoint: "/stage-instances",

    /**
     * Route for a specific Stage Instance.
     *
     * Used for getting, updating, or deleting an existing Stage instance.
     *
     * @param channelId - The ID of the Stage channel
     * @returns The formatted API route string
     */
    stageInstanceByIdEndpoint: (channelId: Snowflake) =>
      `/stage-instances/${channelId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Stage Instance Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new Stage Instance associated with a Stage channel.
   *
   * This method makes a Stage channel "go live," creating a Stage instance
   * with the specified topic and settings. This is equivalent to clicking
   * the "Start Stage" button in Discord's UI.
   *
   * @param options - Options for creating the Stage Instance
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created Stage Instance entity
   * @throws {Error} Error if the Stage channel doesn't exist or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   *
   * @remarks
   * This effectively makes the Stage channel "live".
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Note: When a Stage channel has no speakers for a certain period of time
   * (on the order of minutes), the Stage instance will be automatically deleted.
   *
   * Fires a Stage Instance Create Gateway event.
   */
  createStage(
    options: StageCreateOptions,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.post(
      StageInstanceRouter.STAGE_ROUTES.stageInstancesEndpoint,
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Fetches the Stage Instance associated with a Stage channel, if it exists.
   *
   * This method retrieves information about an ongoing Stage, including
   * its topic, privacy level, and discovery settings.
   *
   * @param channelId - The ID of the Stage channel to get the instance for
   * @returns A promise resolving to the Stage Instance entity
   * @throws {Error} Will throw an error if the Stage channel doesn't exist or isn't live
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  fetchStage(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.#rest.get(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
    );
  }

  /**
   * Updates fields of an existing Stage Instance.
   *
   * This method allows modifying the topic or privacy level of an ongoing Stage.
   *
   * @param channelId - The ID of the Stage channel with the instance to modify
   * @param options - Options for modifying the Stage Instance
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated Stage Instance entity
   * @throws {Error} Error if the Stage isn't live or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   *
   * @remarks
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Fires a Stage Instance Update Gateway event.
   */
  updateStage(
    channelId: Snowflake,
    options: StageUpdateOptions,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.patch(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * Deletes a Stage Instance, effectively ending the "live" status of the Stage channel.
   *
   * This method ends an ongoing Stage, equivalent to clicking the "End Stage" button in Discord's UI.
   *
   * @param channelId - The ID of the Stage channel with the instance to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the deletion is complete
   * @throws {Error} Will throw an error if the Stage isn't live or permissions are missing
   *
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   *
   * @remarks
   * Requires the user to be a moderator of the Stage channel (having MANAGE_CHANNELS,
   * MUTE_MEMBERS, and MOVE_MEMBERS permissions).
   *
   * Fires a Stage Instance Delete Gateway event.
   */
  endStage(channelId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
      {
        reason,
      },
    );
  }
}
