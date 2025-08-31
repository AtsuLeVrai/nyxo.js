import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { LobbyEntity, LobbyMemberEntity } from "./lobby.entity.js";

export interface RESTCreateLobbyJSONParams
  extends Partial<Pick<LobbyEntity, "metadata" | "members">> {
  idle_timeout_seconds?: number;
}

export type RESTLobbyMemberJSONParams = Pick<LobbyMemberEntity, "metadata" | "flags">;

export const LobbyRoutes = {
  createLobby: () => "/lobbies" as const,
  getLobby: (lobbyId: string) => `/lobbies/${lobbyId}` as const,
  addMemberLobby: (lobbyId: string, userId: string) =>
    `/lobbies/${lobbyId}/members/${userId}` as const,
  leaveLobby: (lobbyId: string) => `/lobbies/${lobbyId}/members/@me` as const,
  linkChannelLobby: (lobbyId: string) => `/lobbies/${lobbyId}/channel-linking` as const,
} as const satisfies RouteBuilder;

export class LobbyRouter extends BaseRouter {
  createLobby(options: RESTCreateLobbyJSONParams): Promise<LobbyEntity> {
    return this.rest.post(LobbyRoutes.createLobby(), {
      body: JSON.stringify(options),
    });
  }

  getLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.rest.get(LobbyRoutes.getLobby(lobbyId));
  }

  modifyLobby(lobbyId: string, options: RESTCreateLobbyJSONParams): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.getLobby(lobbyId), {
      body: JSON.stringify(options),
    });
  }

  deleteLobby(lobbyId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.getLobby(lobbyId));
  }

  addMemberLobby(
    lobbyId: string,
    userId: string,
    options: RESTLobbyMemberJSONParams,
  ): Promise<LobbyMemberEntity> {
    return this.rest.put(LobbyRoutes.addMemberLobby(lobbyId, userId), {
      body: JSON.stringify(options),
    });
  }

  removeMemberLobby(lobbyId: string, userId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.addMemberLobby(lobbyId, userId));
  }

  leaveLobby(lobbyId: string): Promise<void> {
    return this.rest.delete(LobbyRoutes.leaveLobby(lobbyId));
  }

  linkChannelLobby(lobbyId: string, channelId: string): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.linkChannelLobby(lobbyId), {
      body: JSON.stringify({ channel_id: channelId }),
    });
  }

  unlinkChannelLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.rest.patch(LobbyRoutes.linkChannelLobby(lobbyId), {
      body: JSON.stringify({}),
    });
  }
}
