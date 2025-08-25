import type { Rest } from "../../core/index.js";
import type { LobbyEntity, LobbyMemberEntity } from "./lobby.entity.js";

export interface LobbyCreateOptions {
  metadata?: Record<string, string>;
  members?: LobbyMemberCreateOptions[];
  idle_timeout_seconds?: number;
}

export interface LobbyMemberCreateOptions {
  id: string;
  metadata?: Record<string, string>;
  flags?: number;
}

export interface LobbyUpdateOptions {
  metadata?: Record<string, string>;
  members?: LobbyMemberCreateOptions[];
  idle_timeout_seconds?: number;
}

export interface LobbyMemberUpdateOptions {
  metadata?: Record<string, string>;
  flags?: number;
}

export class LobbyRouter {
  static readonly Routes = {
    lobbiesEndpoint: () => "/lobbies",
    lobbyByIdEndpoint: (lobbyId: string) => `/lobbies/${lobbyId}` as const,
    lobbyMemberEndpoint: (lobbyId: string, userId: string) =>
      `/lobbies/${lobbyId}/members/${userId}` as const,
    leaveLobbyEndpoint: (lobbyId: string) => `/lobbies/${lobbyId}/members/@me` as const,
    lobbyChannelLinkingEndpoint: (lobbyId: string) =>
      `/lobbies/${lobbyId}/channel-linking` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  createLobby(options: LobbyCreateOptions): Promise<LobbyEntity> {
    return this.#rest.post(LobbyRouter.Routes.lobbiesEndpoint(), {
      body: JSON.stringify(options),
    });
  }
  fetchLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.#rest.get(LobbyRouter.Routes.lobbyByIdEndpoint(lobbyId));
  }
  updateLobby(lobbyId: string, options: LobbyUpdateOptions): Promise<LobbyEntity> {
    return this.#rest.patch(LobbyRouter.Routes.lobbyByIdEndpoint(lobbyId), {
      body: JSON.stringify(options),
    });
  }
  deleteLobby(lobbyId: string): Promise<void> {
    return this.#rest.delete(LobbyRouter.Routes.lobbyByIdEndpoint(lobbyId));
  }
  addLobbyMember(
    lobbyId: string,
    userId: string,
    options: LobbyMemberUpdateOptions,
  ): Promise<LobbyMemberEntity> {
    return this.#rest.put(LobbyRouter.Routes.lobbyMemberEndpoint(lobbyId, userId), {
      body: JSON.stringify(options),
    });
  }
  removeLobbyMember(lobbyId: string, userId: string): Promise<void> {
    return this.#rest.delete(LobbyRouter.Routes.lobbyMemberEndpoint(lobbyId, userId));
  }
  leaveLobby(lobbyId: string): Promise<void> {
    return this.#rest.delete(LobbyRouter.Routes.leaveLobbyEndpoint(lobbyId));
  }
  linkChannelToLobby(lobbyId: string, channelId: string): Promise<LobbyEntity> {
    return this.#rest.patch(LobbyRouter.Routes.lobbyChannelLinkingEndpoint(lobbyId), {
      body: JSON.stringify({ channel_id: channelId }),
    });
  }
  unlinkChannelFromLobby(lobbyId: string): Promise<LobbyEntity> {
    return this.#rest.patch(LobbyRouter.Routes.lobbyChannelLinkingEndpoint(lobbyId));
  }
}
