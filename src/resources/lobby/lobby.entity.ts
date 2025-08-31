import type { AnyChannelEntity } from "../channel/index.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberEntity {
  id: string;
  metadata?: Record<string, string> | null;
  flags?: LobbyMemberFlags;
}

export interface LobbyEntity {
  id: string;
  application_id: string;
  metadata?: Record<string, string> | null;
  members: LobbyMemberEntity[];
  linked_channel?: AnyChannelEntity | null;
}
