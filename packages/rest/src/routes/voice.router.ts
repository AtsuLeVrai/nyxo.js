import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for modifying the current user's voice state in a guild.
 * Particularly useful for stage channels where suppression and speaker requests are important.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export interface VoiceStateUpdateOptions {
  /**
   * The ID of the channel the user is currently in.
   * Must point to a stage channel the bot is already connected to.
   */
  channel_id?: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   * When true, the bot is suppressed (not speaking).
   * Requires MUTE_MEMBERS permission to unsuppress yourself.
   */
  suppress?: boolean;

  /**
   * Sets the user's request to speak timestamp.
   * When set to a future time, indicates a request to speak.
   * Format: ISO8601 datetime (e.g., "2023-01-01T12:00:00Z").
   */
  request_to_speak_timestamp?: string | null;
}

/**
 * Interface for modifying another user's voice state in a guild.
 * Focused on managing suppress status in stage channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export interface OtherVoiceStateUpdateOptions {
  /**
   * The ID of the channel the user is currently in.
   * Must point to a stage channel the user is connected to.
   */
  channel_id: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   * When true, the user is suppressed (not speaking).
   * Requires MUTE_MEMBERS permission.
   */
  suppress?: boolean;
}

/**
 * Router for Discord Voice-related endpoints.
 * Provides methods to interact with voice states and regions.
 *
 * @see {@link https://discord.com/developers/docs/resources/voice}
 */
export class VoiceRouter {
  /**
   * API route constants for voice-related endpoints.
   */
  static readonly VOICE_ROUTES = {
    /** Base route for voice regions */
    voiceRegionsEndpoint: "/voice/regions",

    /**
     * Route for the current user's voice state in a guild
     * @param guildId - The ID of the guild
     */
    currentUserVoiceStateEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/voice-states/@me` as const,

    /**
     * Route for a specific user's voice state in a guild
     * @param guildId - The ID of the guild
     * @param userId - The ID of the user
     */
    userVoiceStateEndpoint: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Voice Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches all available voice regions.
   * Retrieves a list of voice servers and their properties.
   *
   * @returns A promise resolving to an array of voice region entities
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  fetchVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(VoiceRouter.VOICE_ROUTES.voiceRegionsEndpoint);
  }

  /**
   * Fetches the current user's voice state in a guild.
   * Retrieves information about the bot's current voice connection status.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @returns A promise resolving to the current user's voice state entity
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  fetchCurrentVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.#rest.get(
      VoiceRouter.VOICE_ROUTES.currentUserVoiceStateEndpoint(guildId),
    );
  }

  /**
   * Fetches a specific user's voice state in a guild.
   * Retrieves information about a user's current voice connection status.
   *
   * @param guildId - The ID of the guild to get the voice state from
   * @param userId - The ID of the user to get the voice state for
   * @returns A promise resolving to the user's voice state entity
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
   * Controls the bot's speaking status in stage channels.
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  updateCurrentVoiceState(
    guildId: Snowflake,
    options: VoiceStateUpdateOptions,
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
   * Controls a user's ability to speak in stage channels.
   *
   * @param guildId - The ID of the guild containing the voice state to modify
   * @param userId - The ID of the user whose voice state to modify
   * @param options - Options for modifying the voice state
   * @returns A promise that resolves when the voice state is modified
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   */
  updateUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
    options: OtherVoiceStateUpdateOptions,
  ): Promise<void> {
    return this.#rest.patch(
      VoiceRouter.VOICE_ROUTES.userVoiceStateEndpoint(guildId, userId),
      {
        body: JSON.stringify(options),
      },
    );
  }
}
