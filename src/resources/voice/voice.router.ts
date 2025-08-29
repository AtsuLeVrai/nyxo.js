import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { VoiceRegionEntity, VoiceStateEntity } from "./voice.entity.js";

/**
 * @description JSON parameters for modifying current user's voice state in a guild.
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
 */
export type RESTModifyCurrentUserVoiceStateJSONParams = Partial<
  Pick<VoiceStateEntity, "channel_id" | "suppress" | "request_to_speak_timestamp">
>;

/**
 * @description JSON parameters for modifying another user's voice state in a guild.
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
 */
export type RESTModifyUserVoiceStateJSONParams = Omit<
  RESTModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;

/**
 * @description REST API routes for Discord voice operations.
 * @see {@link https://discord.com/developers/docs/resources/voice}
 */
export const VoiceRoutes = {
  /** Route to list available voice regions */
  listVoiceRegions: () => "/voice/regions",
  /** Route to get current user's voice state in a guild */
  getCurrentUserVoiceState: (guildId: string) => `/guilds/${guildId}/voice-states/@me` as const,
  /** Route to get specific user's voice state in a guild */
  getUserVoiceState: (guildId: string, userId: string) =>
    `/guilds/${guildId}/voice-states/${userId}` as const,
} as const satisfies RouteBuilder;

/**
 * @description High-performance Discord voice API router with zero-cache, always-fresh approach.
 * @see {@link https://discord.com/developers/docs/resources/voice}
 */
export class VoiceRouter extends BaseRouter {
  /**
   * @description Retrieves available Discord voice regions directly from API.
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   *
   * @returns Promise resolving to array of voice region objects
   * @throws {Error} When hitting Discord rate limits
   */
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.rest.get(VoiceRoutes.listVoiceRegions());
  }

  /**
   * @description Fetches current user's voice state in specified guild directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   *
   * @param guildId - Guild snowflake ID to fetch voice state from
   * @returns Promise resolving to current user's voice state object
   * @throws {Error} When user is not in a voice channel in this guild
   * @throws {Error} When lacking access to guild voice states
   */
  getCurrentUserVoiceState(guildId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getCurrentUserVoiceState(guildId));
  }

  /**
   * @description Fetches specific user's voice state in guild directly from Discord API.
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   *
   * @param guildId - Guild snowflake ID to fetch voice state from
   * @param userId - User snowflake ID whose voice state to retrieve
   * @returns Promise resolving to specified user's voice state object
   * @throws {Error} When user is not in a voice channel in this guild
   * @throws {Error} When lacking access to guild voice states
   */
  getUserVoiceState(guildId: string, userId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getUserVoiceState(guildId, userId));
  }

  /**
   * @description Updates current user's voice state in a guild with zero-cache design.
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   *
   * @param guildId - Guild snowflake ID where voice state should be modified
   * @param options - Voice state modification parameters (channel_id, suppress, request_to_speak_timestamp)
   * @returns Promise resolving when voice state is successfully updated
   * @throws {Error} When lacking MUTE_MEMBERS permission to unsuppress or REQUEST_TO_SPEAK permission
   * @throws {Error} When channel_id doesn't point to a stage channel or user not in channel
   * @throws {Error} When hitting Discord rate limits
   */
  modifyCurrentUserVoiceState(
    guildId: string,
    options: RESTModifyCurrentUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getCurrentUserVoiceState(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @description Updates another user's voice state in a guild with direct API calls.
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   *
   * @param guildId - Guild snowflake ID where voice state should be modified
   * @param userId - User snowflake ID whose voice state to modify
   * @param options - Voice state modification parameters (channel_id, suppress)
   * @returns Promise resolving when voice state is successfully updated
   * @throws {Error} When lacking MUTE_MEMBERS permission
   * @throws {Error} When channel_id doesn't point to a stage channel or user not in channel
   * @throws {Error} When hitting Discord rate limits
   */
  modifyUserVoiceState(
    guildId: string,
    userId: string,
    options: RESTModifyUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getUserVoiceState(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}
