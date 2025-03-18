import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import {
  ModifyCurrentUserVoiceStateSchema,
  ModifyUserVoiceStateSchema,
} from "../schemas/index.js";

/**
 * Router class for handling Discord Voice-related endpoints.
 *
 * Voice features in Discord allow users to communicate via audio in voice channels
 * and stage channels. This router provides methods to interact with voice states
 * and regions, including retrieving information about voice regions and modifying
 * voice states for users.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice}
 */
export class VoiceRouter {
  /**
   * Collection of route patterns for voice-related endpoints.
   */
  static readonly ROUTES = {
    /**
     * Base route for voice regions.
     */
    voiceRegionsBase: "/voice/regions" as const,

    /**
     * Route for the current user's voice state in a guild.
     * @param guildId - The ID of the guild
     * @returns The endpoint path
     */
    guildCurrentUserVoiceState: (guildId: Snowflake) =>
      `/guilds/${guildId}/voice-states/@me` as const,

    /**
     * Route for a specific user's voice state in a guild.
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @returns The endpoint path
     */
    guildUserVoiceState: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const;

  /**
   * The REST client used to make API requests.
   */
  readonly #rest: Rest;

  /**
   * Creates a new instance of the VoiceRouter.
   * @param rest - The REST client to use for API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Lists all available voice regions.
   *
   * Returns an array of voice region objects that can be used when setting
   * a voice or stage channel's rtc_region.
   *
   * @returns A promise resolving to an array of voice region entities
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(VoiceRouter.ROUTES.voiceRegionsBase);
  }

  /**
   * Gets the current user's voice state in a guild.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @returns A promise resolving to the current user's voice state entity
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  getCurrentUserVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.#rest.get(
      VoiceRouter.ROUTES.guildCurrentUserVoiceState(guildId),
    );
  }

  /**
   * Gets a specific user's voice state in a guild.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @param userId - The ID of the user to get the voice state for
   * @returns A promise resolving to the user's voice state entity
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   */
  getUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceStateEntity> {
    return this.#rest.get(
      VoiceRouter.ROUTES.guildUserVoiceState(guildId, userId),
    );
  }

  /**
   * Modifies the current user's voice state in a guild.
   *
   * This can be used to join a stage channel, request to speak, or toggle the suppress state.
   * Returns 204 No Content on success.
   * Fires a Voice State Update Gateway event.
   *
   * Caveats:
   * - channel_id must currently point to a stage channel
   * - Current user must already have joined channel_id
   * - You must have the MUTE_MEMBERS permission to unsuppress yourself. You can always suppress yourself
   * - You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak
   * - You are able to set request_to_speak_timestamp to any present or future time
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  modifyCurrentUserVoiceState(
    guildId: Snowflake,
    options: ModifyCurrentUserVoiceStateSchema,
  ): Promise<void> {
    const result = ModifyCurrentUserVoiceStateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      VoiceRouter.ROUTES.guildCurrentUserVoiceState(guildId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * Modifies another user's voice state in a guild.
   *
   * This can be used to toggle a user's suppress state in a stage channel.
   * Fires a Voice State Update Gateway event.
   *
   * Caveats:
   * - channel_id must currently point to a stage channel
   * - User must already have joined channel_id
   * - You must have the MUTE_MEMBERS permission
   * - When unsuppressed, non-bot users will have their request_to_speak_timestamp set to the current time. Bot users will not
   * - When suppressed, the user will have their request_to_speak_timestamp removed
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param userId - The ID of the user whose voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @throws Error if the options are invalid
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   */
  modifyUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyUserVoiceStateSchema,
  ): Promise<void> {
    const result = ModifyUserVoiceStateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.patch(
      VoiceRouter.ROUTES.guildUserVoiceState(guildId, userId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }
}
