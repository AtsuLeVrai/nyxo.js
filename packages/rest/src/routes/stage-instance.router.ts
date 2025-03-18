import type { Snowflake, StageInstanceEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  CreateStageInstanceSchema,
  ModifyStageInstanceSchema,
} from "../schemas/index.js";

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
export class StageInstanceRouter {
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

  /**
   * The REST client used to make API requests.
   */
  readonly #rest: Rest;

  /**
   * Creates a new instance of the StageInstanceRouter.
   * @param rest - The REST client to use for API requests
   */
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
    const result = CreateStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.post(StageInstanceRouter.ROUTES.stageInstancesBase, {
      body: JSON.stringify(result.data),
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
    return this.#rest.get(StageInstanceRouter.ROUTES.stageInstance(channelId));
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
    const result = ModifyStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      StageInstanceRouter.ROUTES.stageInstance(channelId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
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
    return this.#rest.delete(
      StageInstanceRouter.ROUTES.stageInstance(channelId),
      {
        reason,
      },
    );
  }
}
