import type { Snowflake } from "../markdown/index.js";
import type { ChannelEntity } from "./channel.entity.js";

/**
 * Represents the flags that can be applied to a lobby member.
 * These flags determine the permissions and capabilities of a member within a lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object-lobby-member-flags}
 */
export enum LobbyMemberFlags {
  /**
   * User can link a text channel to a lobby (1 << 0 = 1)
   * Allows the member to connect a text channel with this lobby
   */
  CanLinkLobby = 1 << 0,
}

/**
 * Represents a member of a Discord lobby.
 * Members are users who have been added to or have joined a lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object}
 */
export interface LobbyMemberEntity {
  /**
   * The user's ID
   * Unique identifier for the user who is a member of the lobby
   */
  id: Snowflake;

  /**
   * Dictionary of string key/value pairs associated with this member
   * Can store custom data related to this member's participation in the lobby
   * The max total length is 1000 characters
   */
  metadata?: Record<string, string> | null;

  /**
   * Bitfield of lobby member flags
   * Represents special permissions or capabilities of this member within the lobby
   */
  flags?: LobbyMemberFlags;
}

/**
 * Represents a lobby within Discord.
 * Lobbies are spaces that applications can use for matchmaking or organizing temporary groups.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-object}
 */
export interface LobbyEntity {
  /**
   * The lobby's ID
   * Unique identifier for the lobby
   */
  id: Snowflake;

  /**
   * Application that created the lobby
   * ID of the application that owns this lobby
   */
  application_id: Snowflake;

  /**
   * Dictionary of string key/value pairs
   * Can store custom data related to this lobby
   * The max total length is 1000 characters
   */
  metadata?: Record<string, string> | null;

  /**
   * Members of the lobby
   * An array of users who are participating in this lobby
   */
  members: LobbyMemberEntity[];

  /**
   * The guild channel linked to the lobby
   * Optional reference to a Discord text channel that is linked with this lobby
   */
  linked_channel?: ChannelEntity | null;
}
