import type {
  GuildMemberEntity,
  Snowflake,
  VoiceStateEntity,
} from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a VOICE_STATE_UPDATE event dispatched when someone joins, leaves, or moves a voice channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-state-update}
 */
export class VoiceState extends BaseClass<VoiceStateEntity> {
  /**
   * The guild ID this voice state is for, if applicable
   */
  get guildId(): Snowflake | null {
    return this.data.guild_id || null;
  }

  /**
   * The channel ID this user is connected to (null if disconnected)
   */
  get channelId(): Snowflake | null {
    return this.data.channel_id;
  }

  /**
   * The user ID this voice state is for
   */
  get userId(): Snowflake {
    return this.data.user_id;
  }

  /**
   * The guild member this voice state is for, if applicable
   */
  get member(): GuildMemberEntity | null {
    return this.data.member || null;
  }

  /**
   * The session ID for this voice state
   */
  get sessionId(): string {
    return this.data.session_id;
  }

  /**
   * Whether this user is deafened by the server
   */
  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  /**
   * Whether this user is muted by the server
   */
  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  /**
   * Whether this user is locally deafened
   */
  get selfDeaf(): boolean {
    return Boolean(this.data.self_deaf);
  }

  /**
   * Whether this user is locally muted
   */
  get selfMute(): boolean {
    return Boolean(this.data.self_mute);
  }

  /**
   * Whether this user is streaming using "Go Live"
   */
  get selfStream(): boolean {
    return Boolean(this.data.self_stream);
  }

  /**
   * Whether this user's camera is enabled
   */
  get selfVideo(): boolean {
    return Boolean(this.data.self_video);
  }

  /**
   * Whether this user's permission to speak is denied
   */
  get suppress(): boolean {
    return Boolean(this.data.suppress);
  }

  /**
   * The time at which the user requested to speak
   */
  get requestToSpeakTimestamp(): string | null {
    return this.data.request_to_speak_timestamp;
  }
}
