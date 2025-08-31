import type { AnyChannelEntity } from "../channel/index.js";

/**
 * Bitfield flags for Discord lobby members indicating their permissions within the lobby.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object-lobby-member-flags}
 */
export enum LobbyMemberFlags {
  /** User can link a text channel to a lobby */
  CanLinkLobby = 1 << 0,
}

/**
 * Represents a member of a Discord lobby with optional metadata and permission flags.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object}
 */
export interface LobbyMemberEntity {
  /** Snowflake ID of the user */
  id: string;
  /** Dictionary of string key/value pairs with max total length of 1000 characters */
  metadata?: Record<string, string> | null;
  /** Lobby member flags combined as a bitfield indicating user permissions */
  flags?: LobbyMemberFlags;
}

/**
 * Represents a Discord lobby used for game session coordination and voice channel linking.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-object}
 */
export interface LobbyEntity {
  /** Unique snowflake identifier for this lobby */
  id: string;
  /** Snowflake ID of the application that created this lobby */
  application_id: string;
  /** Dictionary of string key/value pairs with max total length of 1000 characters */
  metadata?: Record<string, string> | null;
  /** Array of lobby members currently in this lobby */
  members: LobbyMemberEntity[];
  /** The guild channel linked to this lobby for text communication */
  linked_channel?: AnyChannelEntity | null;
}
