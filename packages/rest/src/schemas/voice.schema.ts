import type { Snowflake } from "@nyxjs/core";

/**
 * Interface for modifying the current user's voice state in a guild.
 *
 * Updates the current user's voice state. Returns 204 No Content on success.
 * Fires a Voice State Update Gateway event.
 *
 * Caveats:
 * - channel_id must currently point to a stage channel
 * - Current user must already have joined channel_id
 * - You must have the MUTE_MEMBERS permission to unsuppress yourself. You can always suppress yourself
 * - You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak
 * - You are able to set request_to_speak_timestamp to any present or future time
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export interface ModifyCurrentUserVoiceStateSchema {
  /**
   * The ID of the channel the user is currently in.
   * Must point to a stage channel.
   *
   * @optional
   */
  channel_id?: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   * Requires MUTE_MEMBERS permission to unsuppress yourself.
   *
   * @optional
   */
  suppress?: boolean;

  /**
   * Sets the user's request to speak timestamp.
   * Requires REQUEST_TO_SPEAK permission to request to speak.
   * Can be set to any present or future time.
   *
   * @format datetime
   * @nullable
   * @optional
   */
  request_to_speak_timestamp?: string | null;
}

/**
 * Interface for modifying another user's voice state in a guild.
 *
 * Updates another user's voice state. Fires a Voice State Update Gateway event.
 *
 * Caveats:
 * - channel_id must currently point to a stage channel
 * - User must already have joined channel_id
 * - You must have the MUTE_MEMBERS permission
 * - When unsuppressed, non-bot users will have their request_to_speak_timestamp set to the current time. Bot users will not
 * - When suppressed, the user will have their request_to_speak_timestamp removed
 *
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export interface ModifyUserVoiceStateSchema {
  /**
   * The ID of the channel the user is currently in.
   * Must point to a stage channel.
   */
  channel_id: Snowflake | null;

  /**
   * Toggles the user's suppress state.
   * Requires MUTE_MEMBERS permission.
   *
   * @optional
   */
  suppress?: boolean;
}
