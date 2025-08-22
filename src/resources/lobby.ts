import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { AnyChannelObject } from "./channel.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberObject {
  id: Snowflake;
  metadata?: Record<string, string> | null;
  flags?: LobbyMemberFlags;
}

export interface LobbyObject {
  id: Snowflake;
  application_id: Snowflake;
  metadata?: Record<string, string> | null;
  members: LobbyMemberObject[];
  linked_channel?: AnyChannelObject;
}

// Lobby Request Interfaces
export interface CreateLobbyRequest {
  metadata?: Record<string, string> | null;
  members?: LobbyMemberObject[];
  idle_timeout_seconds?: number;
}

export interface ModifyLobbyRequest {
  metadata?: Record<string, string> | null;
  members?: LobbyMemberObject[];
  idle_timeout_seconds?: number;
}

export interface AddLobbyMemberRequest {
  metadata?: Record<string, string> | null;
  flags?: LobbyMemberFlags;
}

export interface LinkChannelToLobbyRequest {
  channel_id?: Snowflake;
}

export const LobbyRoutes = {
  // POST /lobbies - Create Lobby
  createLobby: (() => "/lobbies") as EndpointFactory<
    "/lobbies",
    ["POST"],
    LobbyObject,
    false,
    false,
    CreateLobbyRequest
  >,

  // GET /lobbies/{lobby.id} - Get Lobby
  getLobby: ((lobbyId: Snowflake) => `/lobbies/${lobbyId}`) as EndpointFactory<
    `/lobbies/${string}`,
    ["GET", "PATCH", "DELETE"],
    LobbyObject,
    false,
    false,
    ModifyLobbyRequest
  >,

  // PUT /lobbies/{lobby.id}/members/{user.id} - Add Member to Lobby
  addLobbyMember: ((lobbyId: Snowflake, userId: Snowflake) =>
    `/lobbies/${lobbyId}/members/${userId}`) as EndpointFactory<
    `/lobbies/${string}/members/${string}`,
    ["PUT", "DELETE"],
    LobbyMemberObject,
    false,
    false,
    AddLobbyMemberRequest
  >,

  // DELETE /lobbies/{lobby.id}/members/@me - Leave Lobby
  leaveLobby: ((lobbyId: Snowflake) => `/lobbies/${lobbyId}/members/@me`) as EndpointFactory<
    `/lobbies/${string}/members/@me`,
    ["DELETE"],
    void
  >,

  // PATCH /lobbies/{lobby.id}/channel-linking - Link/Unlink Channel
  linkChannelToLobby: ((lobbyId: Snowflake) =>
    `/lobbies/${lobbyId}/channel-linking`) as EndpointFactory<
    `/lobbies/${string}/channel-linking`,
    ["PATCH"],
    LobbyObject,
    false,
    false,
    LinkChannelToLobbyRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
