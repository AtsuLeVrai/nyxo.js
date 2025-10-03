import type { SetNonNullable } from "../utils/index.js";
import type { AnyChannelEntity } from "./channel.js";

/**
 * Bitfield flags representing permissions and capabilities for lobby members.
 * Controls what actions lobby members can perform within the lobby system.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object-lobby-member-flags} for lobby member flags specification
 */
export enum LobbyMemberFlags {
  /** Member can link text channels to the lobby for communication */
  CanLinkLobby = 1 << 0,
}

/**
 * Individual member within a Discord lobby with optional metadata and permissions.
 * Represents a user's participation in a lobby session including their capabilities.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-member-object} for lobby member specification
 */
export interface LobbyMemberObject {
  /** Unique Discord user identifier */
  readonly id: string;
  /** Custom key-value metadata for this member (max total length: 1000 chars) */
  readonly metadata?: Record<string, string> | null;
  /** Bitfield of member permissions and capabilities */
  readonly flags?: LobbyMemberFlags;
}

/**
 * Discord lobby representing a temporary gathering space for users within an application.
 * Lobbies support custom metadata, member management, and optional channel linking.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#lobby-object} for lobby object specification
 * @see {@link https://discord.com/developers/docs/discord-social-sdk/development-guides/managing-lobbies} for lobby management guide
 */
export interface LobbyObject {
  /** Unique identifier for this lobby */
  readonly id: string;
  /** Application that created and owns this lobby */
  readonly application_id: string;
  /** Custom key-value metadata for this lobby (max total length: 1000 chars) */
  readonly metadata?: Record<string, string> | null;
  /** Array of current lobby members */
  readonly members: LobbyMemberObject[];
  /** Optional guild channel linked to this lobby for communication */
  readonly linked_channel?: AnyChannelEntity | null;
}

/**
 * Request parameters for creating a new lobby with initial configuration.
 * Supports setting metadata, initial member list, and idle timeout behavior.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby} for create lobby endpoint
 */
export interface CreateLobbyJSONParams
  extends Partial<SetNonNullable<Pick<LobbyObject, "metadata" | "members">>> {
  /** Seconds to wait before shutting down lobby when idle (5-604800 seconds) */
  readonly idle_timeout_seconds?: number;
}

/**
 * Request parameters for modifying an existing lobby configuration.
 * All parameters are optional, allowing partial updates to lobby properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#modify-lobby} for modify lobby endpoint
 */
export type ModifyLobbyJSONParams = CreateLobbyJSONParams;

/**
 * Request parameters for adding or updating a lobby member.
 * Used when adding users to lobbies or updating existing member properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby} for add member endpoint
 */
export type LobbyMemberJSONParams = SetNonNullable<Pick<LobbyMemberObject, "metadata" | "flags">>;

/**
 * Request parameters for linking or unlinking channels from a lobby.
 * Omitting channel_id will unlink any currently linked channels.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#link-channel-to-lobby} for channel linking endpoint
 * @see {@link https://discord.com/developers/docs/discord-social-sdk/development-guides/linked-channels} for linked channels guide
 */
export interface LinkChannelLobbyJSONParams {
  /** Channel ID to link to lobby (omit to unlink current channel) */
  readonly channel_id?: string;
}
