import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";

/**
 * Interface for creating a new Stage instance.
 * Represents the "live" state of a Stage channel with metadata.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface StageCreateOptions {
  /**
   * The ID of the Stage channel.
   * Must be a valid Stage channel of type GUILD_STAGE_VOICE (13).
   */
  channel_id: Snowflake;

  /**
   * The topic of the Stage instance (1-120 characters).
   * Displayed prominently in the Stage UI.
   */
  topic: string;

  /**
   * The privacy level of the Stage instance.
   * Controls who can see the Stage in discovery surfaces.
   */
  privacy_level?: StageInstancePrivacyLevel;

  /**
   * Whether to notify @everyone that a Stage instance has started.
   * Requires the MENTION_EVERYONE permission.
   */
  send_start_notification?: boolean;

  /**
   * The ID of the scheduled event associated with this Stage instance.
   * Connects this Stage to a scheduled event.
   */
  guild_scheduled_event_id?: Snowflake | null;
}

/**
 * Interface for modifying an existing Stage instance.
 * All fields are optional, allowing partial updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export interface StageUpdateOptions {
  /**
   * The topic of the Stage instance (1-120 characters).
   * Updates the displayed topic for the Stage.
   */
  topic?: string;

  /**
   * The privacy level of the Stage instance.
   * Updates the visibility settings for the Stage.
   */
  privacy_level?: StageInstancePrivacyLevel;
}

/**
 * Router for Discord Stage Instance-related endpoints.
 * Manages Stage sessions within Stage channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
export class StageInstanceRouter extends BaseRouter {
  /**
   * API route constants for Stage Instance endpoints.
   */
  static readonly STAGE_ROUTES = {
    /** Base route for Stage Instances */
    stageInstancesEndpoint: "/stage-instances",

    /**
     * Route for a specific Stage Instance.
     * @param channelId - The ID of the Stage channel
     */
    stageInstanceByIdEndpoint: (channelId: Snowflake) =>
      `/stage-instances/${channelId}` as const,
  } as const;

  /**
   * Creates a new Stage Instance associated with a Stage channel.
   * Makes a Stage channel "go live" with the specified topic and settings.
   *
   * @param options - Options for creating the Stage Instance
   * @param reason - Optional audit log reason for the creation
   * @returns A promise resolving to the created Stage Instance entity
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStage(
    options: StageCreateOptions,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.post(
      StageInstanceRouter.STAGE_ROUTES.stageInstancesEndpoint,
      options,
      { reason },
    );
  }

  /**
   * Fetches the Stage Instance associated with a Stage channel.
   * Retrieves information about an ongoing Stage.
   *
   * @param channelId - The ID of the Stage channel to get the instance for
   * @returns A promise resolving to the Stage Instance entity
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  fetchStage(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.get(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
    );
  }

  /**
   * Updates fields of an existing Stage Instance.
   * Modifies the topic or privacy level of an ongoing Stage.
   *
   * @param channelId - The ID of the Stage channel with the instance to modify
   * @param options - Options for modifying the Stage Instance
   * @param reason - Optional audit log reason for the modification
   * @returns A promise resolving to the updated Stage Instance entity
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  updateStage(
    channelId: Snowflake,
    options: StageUpdateOptions,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.patch(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
      options,
      { reason },
    );
  }

  /**
   * Deletes a Stage Instance, ending the "live" status of the Stage channel.
   * Equivalent to clicking the "End Stage" button in Discord's UI.
   *
   * @param channelId - The ID of the Stage channel with the instance to delete
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise that resolves when the deletion is complete
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  endStage(channelId: Snowflake, reason?: string): Promise<void> {
    return this.delete(
      StageInstanceRouter.STAGE_ROUTES.stageInstanceByIdEndpoint(channelId),
      { reason },
    );
  }
}
