import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { LobbyEntity, LobbyMemberEntity } from "./lobby.entity.js";

/**
 * JSON parameters for creating Discord lobbies with optional member list and timeout settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
 */
export interface RESTCreateLobbyJSONParams
  extends Partial<Pick<LobbyEntity, "metadata" | "members">> {
  /** Seconds to wait before shutting down lobby after becoming idle (5-604800 seconds) */
  idle_timeout_seconds?: number;
}

/**
 * JSON parameters for adding or modifying lobby members with metadata and permission flags.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby}
 */
export type RESTLobbyMemberJSONParams = Pick<LobbyMemberEntity, "metadata" | "flags">;

/**
 * Discord API endpoints for lobby operations with type-safe route building.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby}
 */
export const LobbyRoutes = {
  createLobby: () => "/lobbies" as const,
  getLobby: (lobbyId: string) => `/lobbies/${lobbyId}` as const,
  addMemberLobby: (lobbyId: string, userId: string) =>
    `/lobbies/${lobbyId}/members/${userId}` as const,
  leaveLobby: (lobbyId: string) => `/lobbies/${lobbyId}/members/@me` as const,
  linkChannelLobby: (lobbyId: string) => `/lobbies/${lobbyId}/channel-linking` as const,
} as const satisfies RouteBuilder;

/**
 * Zero-cache Discord lobby API client with direct REST operations for game session coordination.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby}
 */
export class LobbyRouter extends BaseRouter {
  /**
   * Creates new lobby with optional members and idle timeout configuration.
   *
   * @param options - Lobby creation parameters including metadata, members, and timeout
   * @returns Promise resolving to created lobby object
   * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
   */
  createLobby(options: RESTCreateLobbyJSONParams): Promise<LobbyEntity> {
    return this.rest.post(LobbyRoutes.createLobby(), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Retrieves specific lobby by ID with current member list and metadata.
   *
   * @param lobbyId - Snowflake ID of the lobby to fetch
   * @returns Promise resolving to lobby object if it exists
   * @see {@link https://discord.com/developers/docs/resources/lobby#get-lobby}
   */
  getLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.rest.get(LobbyRoutes.getLobby(lobbyId));
  }

  /**
   * Modifies existing lobby with new metadata, member list, or timeout settings.
   *
   * @param lobbyId - Snowflake ID of the lobby to modify
   * @param options - Lobby modification parameters with partial updates
   * @returns Promise resolving to updated lobby object
   * @see {@link https://discord.com/developers/docs/resources/lobby#modify-lobby}
   */
  modifyLobby(lobbyId: string, options: RESTCreateLobbyJSONParams): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.getLobby(lobbyId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Permanently deletes lobby and removes all members.
   *
   * @param lobbyId - Snowflake ID of the lobby to delete
   * @returns Promise resolving when deletion is complete
   * @see {@link https://discord.com/developers/docs/resources/lobby#delete-lobby}
   */
  deleteLobby(lobbyId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.getLobby(lobbyId));
  }

  /**
   * Adds user to lobby or updates existing member with new metadata and flags.
   *
   * @param lobbyId - Snowflake ID of the target lobby
   * @param userId - Snowflake ID of the user to add
   * @param options - Member parameters including metadata and permission flags
   * @returns Promise resolving to lobby member object
   * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby}
   */
  addMemberLobby(
    lobbyId: string,
    userId: string,
    options: RESTLobbyMemberJSONParams,
  ): Promise<LobbyMemberEntity> {
    return this.rest.put(LobbyRoutes.addMemberLobby(lobbyId, userId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Removes specified user from lobby.
   *
   * @param lobbyId - Snowflake ID of the lobby
   * @param userId - Snowflake ID of the user to remove
   * @returns Promise resolving when removal is complete
   * @see {@link https://discord.com/developers/docs/resources/lobby#remove-a-member-from-a-lobby}
   */
  removeMemberLobby(lobbyId: string, userId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.addMemberLobby(lobbyId, userId));
  }

  /**
   * Removes current user from specified lobby using Bearer token authorization.
   *
   * @param lobbyId - Snowflake ID of the lobby to leave
   * @returns Promise resolving when user has left the lobby
   * @see {@link https://discord.com/developers/docs/resources/lobby#leave-lobby}
   */
  leaveLobby(lobbyId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.leaveLobby(lobbyId));
  }

  /**
   * Links existing text channel to lobby for integrated communication.
   *
   * @param lobbyId - Snowflake ID of the lobby
   * @param channelId - Snowflake ID of the channel to link
   * @returns Promise resolving to lobby object with linked channel
   * @throws {Error} When user lacks CanLinkLobby permission flag
   * @see {@link https://discord.com/developers/docs/resources/lobby#link-channel-to-lobby}
   */
  linkChannelLobby(lobbyId: string, channelId: string): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.linkChannelLobby(lobbyId), {
      body: JSON.stringify({ channel_id: channelId }),
    });
  }

  /**
   * Unlinks any currently linked channels from specified lobby.
   *
   * @param lobbyId - Snowflake ID of the lobby to unlink channels from
   * @returns Promise resolving to lobby object without linked channel
   * @throws {Error} When user lacks CanLinkLobby permission flag
   * @see {@link https://discord.com/developers/docs/resources/lobby#unlink-channel-from-lobby}
   */
  unlinkChannelLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.linkChannelLobby(lobbyId), {
      body: JSON.stringify({}),
    });
  }
}
