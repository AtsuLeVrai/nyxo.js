import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for modifying the current user's voice state in a guild.
 *
 * This interface defines the settings that can be modified for the bot's
 * own voice state, particularly useful for stage channels where suppression
 * and speaker requests are important.
 *
 * @remarks
 * - Returns 204 No Content on success
 * - Fires a Voice State Update Gateway event
 * - Has specific requirements and limitations
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export interface ModifyCurrentUserVoiceStateSchema {
  /**
   * The ID of the channel the user is currently in.
   *
   * Must point to a stage channel.
   * The bot must already be connected to this channel.
   */
  channel_id?: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   *
   * When true, the bot is suppressed (not actively speaking).
   * When false, the bot is unsuppressed (can speak if allowed).
   *
   * Requires MUTE_MEMBERS permission to unsuppress yourself.
   * You can always suppress yourself without special permissions.
   */
  suppress?: boolean;

  /**
   * Sets the user's request to speak timestamp.
   *
   * When set to the current time or a future time, indicates
   * a request to speak in the stage channel.
   * When set to null, clears the request to speak.
   *
   * Requires REQUEST_TO_SPEAK permission to request to speak.
   * You can always clear your own request to speak.
   *
   * Format: ISO8601 datetime (e.g., "2023-01-01T12:00:00Z")
   */
  request_to_speak_timestamp?: string | null;
}

/**
 * Interface for modifying another user's voice state in a guild.
 *
 * This interface defines the settings that can be modified for another user's
 * voice state, particularly focused on managing their suppress status in stage channels.
 *
 * @remarks
 * - Fires a Voice State Update Gateway event
 * - Has specific requirements and limitations
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export interface ModifyUserVoiceStateSchema {
  /**
   * The ID of the channel the user is currently in.
   *
   * Must point to a stage channel.
   * The user must already be connected to this channel.
   */
  channel_id: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   *
   * When true, the user is suppressed (not actively speaking).
   * When false, the user is unsuppressed (can speak if allowed).
   *
   * Requires MUTE_MEMBERS permission.
   *
   * Note:
   * - When unsuppressed, non-bot users will have their request_to_speak_timestamp
   *   automatically set to the current time
   * - Bot users will not get an automatic request_to_speak_timestamp
   * - When suppressed, any user will have their request_to_speak_timestamp removed
   */
  suppress?: boolean;
}

/**
 * Router for Discord Voice-related endpoints.
 *
 * This class provides methods to interact with Discord's voice systems,
 * including managing voice states and retrieving information about available
 * voice regions for optimal audio quality.
 *
 * @remarks
 * Voice features in Discord allow users to communicate via audio in voice channels
 * and stage channels. This router provides methods to interact with voice states
 * and regions, including retrieving information about voice regions and modifying
 * voice states for users.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice}
 */
export class VoiceRouter {
  /**
   * API route constants for voice-related endpoints.
   */
  static readonly VOICE_ROUTES = {
    /**
     * Base route for voice regions.
     *
     * Used to list all available voice regions and their properties.
     */
    voiceRegionsEndpoint: "/voice/regions",

    /**
     * Route for the current user's voice state in a guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     */
    currentUserVoiceStateEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/voice-states/@me` as const,

    /**
     * Route for a specific user's voice state in a guild.
     *
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     * @returns The formatted API route string
     */
    userVoiceStateEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Voice Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all available voice regions.
   *
   * This method retrieves a list of all voice regions that Discord offers,
   * including details about each region such as name, ID, availability, and
   * whether it's optimal for specific locations.
   *
   * @returns A promise resolving to an array of voice region entities
   *
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  fetchVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(VoiceRouter.VOICE_ROUTES.voiceRegionsEndpoint);
  }

  /**
   * Fetches the current user's voice state in a guild.
   *
   * This method retrieves detailed information about the bot's current voice
   * connection state in a specific guild, including the channel it's connected to
   * and its current status.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @returns A promise resolving to the current user's voice state entity
   *
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  fetchCurrentUserVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.#rest.get(
      VoiceRouter.VOICE_ROUTES.currentUserVoiceStateEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific user's voice state in a guild.
   *
   * This method retrieves detailed information about a user's current voice
   * connection state in a specific guild, including the channel they're connected to
   * and their current status.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @param userId - The ID of the user to get the voice state for
   * @returns A promise resolving to the user's voice state entity
   *
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   */
  fetchUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceStateEntity> {
    return this.#rest.get(
      VoiceRouter.VOICE_ROUTES.userVoiceStateEndpoint(guildId, userId),
    );
  }

  /**
   * Modifies the current user's voice state in a guild.
   *
   * This method allows changing the bot's voice state in a stage channel,
   * such as suppressing/unsuppressing itself or requesting to speak.
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @throws {Error} Error if the options are invalid or prerequisites aren't met
   *
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   *
   * @remarks
   * - channel_id must currently point to a stage channel
   * - Current user must already have joined channel_id
   * - You must have the MUTE_MEMBERS permission to unsuppress yourself. You can always suppress yourself
   * - You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak
   * - You are able to set request_to_speak_timestamp to any present or future time
   */
  updateCurrentUserVoiceState(
    guildId: Snowflake,
    options: ModifyCurrentUserVoiceStateSchema,
  ): Promise<void> {
    return this.#rest.patch(
      VoiceRouter.VOICE_ROUTES.currentUserVoiceStateEndpoint(guildId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Modifies another user's voice state in a guild.
   *
   * This method allows changing another user's voice state in a stage channel,
   * primarily for moderating their ability to speak by toggling their suppress state.
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param userId - The ID of the user whose voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @throws {Error} Error if the options are invalid or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   *
   * @remarks
   * - channel_id must currently point to a stage channel
   * - User must already have joined channel_id
   * - You must have the MUTE_MEMBERS permission
   * - When unsuppressed, non-bot users will have their request_to_speak_timestamp set to the current time. Bot users will not
   * - When suppressed, the user will have their request_to_speak_timestamp removed
   */
  updateUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyUserVoiceStateSchema,
  ): Promise<void> {
    return this.#rest.patch(
      VoiceRouter.VOICE_ROUTES.userVoiceStateEndpoint(guildId, userId),
      {
        body: JSON.stringify(options),
      },
    );
  }
}
