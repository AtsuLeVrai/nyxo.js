import type { Snowflake } from "../common/index.js";
import type { AnyChannelObject } from "./channel.js";

export enum LobbyMemberFlags {
  CanLinkLobby = 1 << 0,
}

export interface LobbyMemberObject {
  id: Snowflake;
  metadata?: Record<string, string> | null;
  flags?: number;
}

export interface LobbyObject {
  id: Snowflake;
  application_id: Snowflake;
  metadata?: Record<string, string> | null;
  members: LobbyMemberObject[];
  linked_channel?: AnyChannelObject;
}
