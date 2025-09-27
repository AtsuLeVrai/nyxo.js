import type { SetNonNullable } from "../utils/index.js";
import type { AnyChannelEntity } from "./channel.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberObject {
  id: string;
  metadata?: Record<string, string> | null;
  flags?: LobbyMemberFlags;
}

export interface LobbyObject {
  id: string;
  application_id: string;
  metadata?: Record<string, string> | null;
  members: LobbyMemberObject[];
  linked_channel?: AnyChannelEntity | null;
}

export interface CreateLobbyJSONParams
  extends Partial<SetNonNullable<Pick<LobbyObject, "metadata" | "members">>> {
  idle_timeout_seconds?: number;
}

export type ModifyLobbyJSONParams = CreateLobbyJSONParams;

export type LobbyMemberJSONParams = SetNonNullable<Pick<LobbyMemberObject, "metadata" | "flags">>;

export interface LinkChannelLobbyJSONParams {
  channel_id?: string;
}
