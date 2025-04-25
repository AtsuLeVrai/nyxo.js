import type { LobbyEntity, LobbyMemberEntity } from "@nyxojs/core";
import type { Snowflake } from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for creating a new lobby.
 * Defines parameters for lobby creation including metadata and members.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
 */
export interface LobbyCreateOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Maximum total length is 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Optional array of users to be added to the lobby.
   * Up to 25 users can be added during creation.
   */
  members?: LobbyMemberCreateOptions[];

  /**
   * Seconds to wait before shutting down an idle lobby.
   * Value can be between 5 and 604800 (7 days).
   */
  idle_timeout_seconds?: number;
}

/**
 * Interface for creating a lobby member.
 * Defines parameters for adding a user to a lobby.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
 */
export interface LobbyMemberCreateOptions {
  /**
   * Discord user id of the user to add to the lobby.
   * Identifies the user who will be added as a member.
   */
  id: Snowflake;

  /**
   * Optional dictionary of string key/value pairs.
   * Maximum total length is 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Lobby member flags.
   * Bitfield of flags to assign to the member.
   */
  flags?: number;
}

/**
 * Interface for modifying an existing lobby.
 * Defines parameters that can be updated after lobby creation.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#modify-lobby}
 */
export interface LobbyUpdateOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Completely replaces any existing metadata.
   */
  metadata?: Record<string, string>;

  /**
   * Optional array of users to replace the lobby members with.
   * Members not in this list will be removed.
   */
  members?: LobbyMemberCreateOptions[];

  /**
   * Seconds to wait before shutting down an idle lobby.
   * Value can be between 5 and 604800 (7 days).
   */
  idle_timeout_seconds?: number;
}

/**
 * Interface for adding or updating a member in a lobby.
 * Defines parameters for modifying an existing member.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby}
 */
export interface LobbyMemberUpdateOptions {
  /**
   * Optional dictionary of string key/value pairs.
   * Maximum total length is 1000 characters.
   */
  metadata?: Record<string, string>;

  /**
   * Lobby member flags.
   * Bitfield of flags to assign to the member.
   */
  flags?: number;
}

/**
 * Router for Discord Lobby-related endpoints.
 * Provides methods to manage lobbies for activities and collaboration.
 *
 * @see {@link https://discord.com/developers/docs/resources/lobby}
 */
export class LobbyRouter {
  /**
   * API route constants for lobby-related endpoints.
   */
  static readonly LOBBY_ROUTES = {
    /** Route for managing lobbies */
    lobbiesEndpoint: "/lobbies",

    /**
     * Route for a specific lobby.
     * @param lobbyId - The ID of the lobby
     */
    lobbyByIdEndpoint: (lobbyId: Snowflake) => `/lobbies/${lobbyId}` as const,

    /**
     * Route for managing a specific member in a lobby.
     * @param lobbyId - The ID of the lobby
     * @param userId - The ID of the user
     */
    lobbyMemberEndpoint: (lobbyId: Snowflake, userId: Snowflake) =>
      `/lobbies/${lobbyId}/members/${userId}` as const,

    /**
     * Route for the current user to leave a lobby.
     * @param lobbyId - The ID of the lobby
     */
    leaveLobbyEndpoint: (lobbyId: Snowflake) =>
      `/lobbies/${lobbyId}/members/@me` as const,

    /**
     * Route for channel linking to a lobby.
     * @param lobbyId - The ID of the lobby
     */
    lobbyChannelLinkingEndpoint: (lobbyId: Snowflake) =>
      `/lobbies/${lobbyId}/channel-linking` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Lobby Router instance.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Creates a new lobby.
   * Creates a lobby and adds specified members to it.
   *
   * @param options - Options for creating the lobby
   * @returns A promise resolving to the created lobby object
   * @see {@link https://discord.com/developers/docs/resources/lobby#create-lobby}
   */
  createLobby(options: LobbyCreateOptions): Promise<LobbyEntity> {
    return this.#rest.post(LobbyRouter.LOBBY_ROUTES.lobbiesEndpoint, {
      body: JSON.stringify(options),
    });
  }

  /**
   * Fetches a lobby by its ID.
   * Retrieves detailed information about a specific lobby.
   *
   * @param lobbyId - The ID of the lobby to retrieve
   * @returns A promise resolving to the lobby object
   * @see {@link https://discord.com/developers/docs/resources/lobby#get-lobby}
   */
  fetchLobby(lobbyId: Snowflake): Promise<LobbyEntity> {
    return this.#rest.get(LobbyRouter.LOBBY_ROUTES.lobbyByIdEndpoint(lobbyId));
  }

  /**
   * Modifies an existing lobby.
   * Updates properties like metadata, members, or idle timeout.
   *
   * @param lobbyId - The ID of the lobby to modify
   * @param options - New properties for the lobby
   * @returns A promise resolving to the updated lobby object
   * @see {@link https://discord.com/developers/docs/resources/lobby#modify-lobby}
   */
  updateLobby(
    lobbyId: Snowflake,
    options: LobbyUpdateOptions,
  ): Promise<LobbyEntity> {
    return this.#rest.patch(
      LobbyRouter.LOBBY_ROUTES.lobbyByIdEndpoint(lobbyId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Deletes a lobby.
   * Permanently removes a specified lobby.
   *
   * @param lobbyId - The ID of the lobby to delete
   * @returns A promise that resolves when the lobby is deleted
   * @see {@link https://discord.com/developers/docs/resources/lobby#delete-lobby}
   */
  deleteLobby(lobbyId: Snowflake): Promise<void> {
    return this.#rest.delete(
      LobbyRouter.LOBBY_ROUTES.lobbyByIdEndpoint(lobbyId),
    );
  }

  /**
   * Adds a member to a lobby.
   * Adds a user or updates existing member metadata.
   *
   * @param lobbyId - The ID of the lobby
   * @param userId - The ID of the user to add
   * @param options - Options for adding/updating the member
   * @returns A promise resolving to the lobby member object
   * @see {@link https://discord.com/developers/docs/resources/lobby#add-a-member-to-a-lobby}
   */
  addLobbyMember(
    lobbyId: Snowflake,
    userId: Snowflake,
    options: LobbyMemberUpdateOptions,
  ): Promise<LobbyMemberEntity> {
    return this.#rest.put(
      LobbyRouter.LOBBY_ROUTES.lobbyMemberEndpoint(lobbyId, userId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Removes a member from a lobby.
   * Removes the specified user from the lobby.
   *
   * @param lobbyId - The ID of the lobby
   * @param userId - The ID of the user to remove
   * @returns A promise that resolves when the member is removed
   * @see {@link https://discord.com/developers/docs/resources/lobby#remove-a-member-from-a-lobby}
   */
  removeLobbyMember(lobbyId: Snowflake, userId: Snowflake): Promise<void> {
    return this.#rest.delete(
      LobbyRouter.LOBBY_ROUTES.lobbyMemberEndpoint(lobbyId, userId),
    );
  }

  /**
   * Leaves a lobby.
   * Removes the current user from the specified lobby.
   *
   * @param lobbyId - The ID of the lobby to leave
   * @returns A promise that resolves when the lobby is left
   * @see {@link https://discord.com/developers/docs/resources/lobby#leave-lobby}
   */
  leaveLobby(lobbyId: Snowflake): Promise<void> {
    return this.#rest.delete(
      LobbyRouter.LOBBY_ROUTES.leaveLobbyEndpoint(lobbyId),
    );
  }

  /**
   * Links a channel to a lobby.
   * Connects a text channel to a lobby for communication.
   *
   * @param lobbyId - The ID of the lobby
   * @param channelId - The ID of the channel to link
   * @returns A promise resolving to the lobby object with a linked channel
   * @see {@link https://discord.com/developers/docs/resources/lobby#link-channel-to-lobby}
   */
  linkChannelToLobby(
    lobbyId: Snowflake,
    channelId: Snowflake,
  ): Promise<LobbyEntity> {
    return this.#rest.patch(
      LobbyRouter.LOBBY_ROUTES.lobbyChannelLinkingEndpoint(lobbyId),
      {
        body: JSON.stringify({ channel_id: channelId }),
      },
    );
  }

  /**
   * Unlinks a channel from a lobby.
   * Disconnects any currently linked channels from the lobby.
   *
   * @param lobbyId - The ID of the lobby
   * @returns A promise resolving to the lobby object without a linked channel
   * @see {@link https://discord.com/developers/docs/resources/lobby#unlink-channel-from-lobby}
   */
  unlinkChannelFromLobby(lobbyId: Snowflake): Promise<LobbyEntity> {
    return this.#rest.patch(
      LobbyRouter.LOBBY_ROUTES.lobbyChannelLinkingEndpoint(lobbyId),
      {
        body: JSON.stringify({}),
      },
    );
  }
}
