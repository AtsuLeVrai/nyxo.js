import type { SetNonNullable } from "../utils/index.js";
import type { AnyChannelEntity } from "./channel.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberObject {
  readonly id: string;

  readonly metadata?: Record<string, string> | null;

  readonly flags?: LobbyMemberFlags;
}

export interface LobbyObject {
  readonly id: string;

  readonly application_id: string;

  readonly metadata?: Record<string, string> | null;

  readonly members: LobbyMemberObject[];

  readonly linked_channel?: AnyChannelEntity | null;
}

export interface CreateLobbyJSONParams
  extends Partial<SetNonNullable<Pick<LobbyObject, "metadata" | "members">>> {
  readonly idle_timeout_seconds?: number;
}

export type ModifyLobbyJSONParams = CreateLobbyJSONParams;

export type LobbyMemberJSONParams = SetNonNullable<Pick<LobbyMemberObject, "metadata" | "flags">>;

export interface LinkChannelLobbyJSONParams {
  readonly channel_id?: string;
}
