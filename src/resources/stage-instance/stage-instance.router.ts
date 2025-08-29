import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { DeepNonNullable } from "../../utils/index.js";
import type { StageInstanceEntity } from "./stage-instance.entity.js";

/**
 * @description JSON parameters for creating new Discord Stage instances with required and optional fields.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
 */
export interface RESTCreateStageInstanceJSONParams
  extends Pick<StageInstanceEntity, "channel_id" | "topic">,
    DeepNonNullable<
      Partial<Pick<StageInstanceEntity, "privacy_level" | "guild_scheduled_event_id">>
    > {
  /**
   * @description Whether to notify @everyone that a Stage instance has started (requires MENTION_EVERYONE permission).
   */
  send_start_notification?: boolean;
}

/**
 * @description JSON parameters for modifying existing Stage instances with optional field updates.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
 */
export type RESTModifyStageInstanceJSONParams = Partial<
  Pick<StageInstanceEntity, "topic" | "privacy_level">
>;

/**
 * @description Discord API endpoints for Stage instance operations with type-safe route building.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
export const StageInstanceRoutes = {
  createStageInstance: () => "/stage-instances",
  getStageInstance: (channelId: string) => `/stage-instances/${channelId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description Zero-cache Discord Stage instance API client with direct REST operations and moderator permission requirements.
 * @see {@link https://discord.com/developers/docs/resources/stage-instance}
 */
export class StageInstanceRouter extends BaseRouter {
  /**
   * @description Creates new Stage instance associated with a Stage channel requiring moderator permissions.
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   *
   * @param options - Stage instance creation parameters including channel ID and topic
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to newly created Stage instance object
   * @throws {Error} When user lacks Stage channel moderator permissions (MANAGE_CHANNELS, MUTE_MEMBERS, MOVE_MEMBERS)
   * @throws {Error} When topic exceeds 120 characters or channel is not a Stage channel
   */
  createStageInstance(
    options: RESTCreateStageInstanceJSONParams,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.rest.post(StageInstanceRoutes.createStageInstance(), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @description Retrieves Stage instance data associated with a Stage channel if it exists.
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   *
   * @param channelId - Snowflake ID of the Stage channel
   * @returns Promise resolving to Stage instance object or null if no active Stage
   */
  getStageInstance(channelId: string): Promise<StageInstanceEntity> {
    return this.rest.get(StageInstanceRoutes.getStageInstance(channelId));
  }

  /**
   * @description Modifies existing Stage instance topic or privacy level requiring moderator permissions.
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   *
   * @param channelId - Snowflake ID of the Stage channel containing the instance
   * @param options - Partial Stage instance data for fields to update
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving to updated Stage instance object
   * @throws {Error} When user lacks Stage channel moderator permissions
   * @throws {Error} When topic exceeds 120 characters
   */
  modifyStageInstance(
    channelId: string,
    options: RESTModifyStageInstanceJSONParams,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.rest.patch(StageInstanceRoutes.getStageInstance(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @description Permanently deletes Stage instance and ends the live Stage requiring moderator permissions.
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   *
   * @param channelId - Snowflake ID of the Stage channel containing the instance
   * @param reason - Optional audit log reason for this action
   * @returns Promise resolving when deletion is complete (204 No Content)
   * @throws {Error} When user lacks Stage channel moderator permissions
   */
  deleteStageInstance(channelId: string, reason?: string): Promise<void> {
    return this.rest.delete(StageInstanceRoutes.getStageInstance(channelId), {
      reason,
    });
  }
}
