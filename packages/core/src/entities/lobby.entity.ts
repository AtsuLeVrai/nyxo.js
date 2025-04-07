import type { Snowflake } from "../managers/index.js";
import type { AnyChannelEntity } from "./channel.entity.js";

/**
 * Flags for Lobby Members indicating what special permissions they have.
 * Controls specific permissions for members within a lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object-lobby-member-flags}
 */
export enum LobbyMemberFlags {
  /**
   * User can link a text channel to a lobby.
   * Allows the member to connect a Discord text channel to this lobby for communication.
   * @value 1 << 0 (1)
   */
  CanLinkLobby = 1 << 0,
}

/**
 * Represents a member of a lobby, including optional metadata and flags.
 * Contains information about a user within a lobby and their permissions.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object}
 */
export interface LobbyMemberEntity {
  /**
   * The ID of the user.
   * Unique Discord user identifier for this lobby member.
   */
  id: Snowflake;

  /**
   * Dictionary of string key/value pairs.
   * Optional custom data associated with this member, with a max total length of 1000 characters.
   */
  metadata?: Record<string, string> | null;

  /**
   * Lobby member flags combined as a bitfield.
   * Permissions and special attributes for this member, such as the ability to link channels.
   */
  flags?: LobbyMemberFlags;
}

/**
 * Represents a lobby within Discord.
 * A lobby is a gathering place for users to join activities, games, or other interactive experiences.
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-object}
 */
export interface LobbyEntity {
  /**
   * The ID of this lobby.
   * Unique identifier for the lobby instance.
   */
  id: Snowflake;

  /**
   * Application that created the lobby.
   * The Discord application ID that owns this lobby.
   */
  application_id: Snowflake;

  /**
   * Dictionary of string key/value pairs.
   * Custom data associated with this lobby, with a max total length of 1000 characters.
   */
  metadata: Record<string, string> | null;

  /**
   * Members of the lobby.
   * Array of users who are currently in this lobby.
   */
  members: LobbyMemberEntity[];

  /**
   * The guild channel linked to the lobby.
   * An optional Discord text channel that has been connected to this lobby for communication.
   */
  linked_channel?: AnyChannelEntity;
}

/**
 * Parameters for creating a new lobby.
 * Contains configuration options for a lobby being created through the API.
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
 */
export interface CreateLobbyOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Custom data to associate with the lobby, with a max total length of 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Optional array of up to 25 users to be added to the lobby.
   * Initial members to include in the lobby upon creation.
   */
  members?: LobbyMemberCreateOptions[];

  /**
   * Seconds to wait before shutting down a lobby after it becomes idle.
   * Value can be between 5 and 604800 (7 days).
   */
  idle_timeout_seconds?: number;
}

/**
 * Parameters for adding a member to a lobby during creation.
 * Contains configuration for a user being added to a lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby-lobby-member-json-params}
 */
export interface LobbyMemberCreateOptions {
  /**
   * Discord user ID of the user to add to the lobby.
   * Identifies which user to include in the lobby.
   */
  id: Snowflake;

  /**
   * Optional dictionary of string key/value pairs.
   * Custom data to associate with this member, with a max total length of 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Lobby member flags combined as a bitfield.
   * Permissions and special attributes to assign to this member.
   */
  flags?: LobbyMemberFlags;
}

/**
 * Parameters for modifying an existing lobby.
 * Contains updated configuration options for an existing lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#modify-lobby}
 */
export interface ModifyLobbyOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Updated custom data for the lobby, overwrites any existing metadata.
   */
  metadata?: Record<string, string>;

  /**
   * Optional array of up to 25 users to replace the lobby members with.
   * If provided, lobby members not in this list will be removed from the lobby.
   */
  members?: LobbyMemberEntity[];

  /**
   * Seconds to wait before shutting down a lobby after it becomes idle.
   * Value can be between 5 and 604800 (7 days).
   */
  idle_timeout_seconds?: number;
}

/**
 * Parameters for adding or updating a member in a lobby.
 * Contains configuration options for adding a user to an existing lobby.
 * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby}
 */
export interface AddLobbyMemberOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Custom data to associate with this member, with a max total length of 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Lobby member flags combined as a bitfield.
   * Permissions and special attributes to assign to this member.
   */
  flags?: LobbyMemberFlags;
}

/**
 * Parameters for linking a channel to a lobby.
 * Contains the channel ID to connect to a lobby for communication.
 * @see {@link https://discord.com/developers/docs/resources/lobby#link-channel-to-lobby}
 */
export interface LinkChannelOptions {
  /**
   * The ID of the channel to link to the lobby.
   * If not provided, will unlink any currently linked channels from the lobby.
   */
  channel_id?: Snowflake;
}
