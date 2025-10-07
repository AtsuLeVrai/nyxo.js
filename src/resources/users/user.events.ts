import type { GuildMemberEntity } from "../guild.js";
import type { ActivityFlags, ActivityTypes } from "./user.enums.js";
import type { UserObject } from "./user.types.js";

export type UpdatePresenceStatusType = "online" | "dnd" | "idle" | "invisible" | "offline";

export interface TypingStartObject {
  readonly channel_id: string;

  readonly guild_id?: string;

  readonly user_id: string;

  readonly timestamp: number;

  readonly member?: GuildMemberEntity;
}

export interface ClientStatusObject {
  readonly desktop?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;

  readonly mobile?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;

  readonly web?: Omit<UpdatePresenceStatusType, "invisible" | "offline">;
}

export interface PresenceUpdateObject {
  readonly user: UserObject;

  readonly guild_id: string;

  readonly status: Omit<UpdatePresenceStatusType, "invisible">;

  readonly activities: ActivityObject[];

  readonly client_status: ClientStatusObject;
}

export interface ActivityButtonsObject {
  readonly label: string;

  readonly url: string;
}

export interface ActivitySecretsObject {
  readonly join?: string;

  readonly spectate?: string;

  readonly match?: string;
}

export interface ActivityAssetsObject {
  readonly large_text?: string;

  readonly large_image?: string;

  readonly large_url?: string;

  readonly small_text?: string;

  readonly small_image?: string;

  readonly small_url?: string;
}

export interface ActivityPartyObject {
  readonly id?: string;

  readonly size?: [currentSize: number, maxSize: number];
}

export interface ActivityEmojiObject {
  readonly name: string;

  readonly id?: string;

  readonly animated?: boolean;
}

export interface ActivityTimestampsObject {
  readonly start?: number;

  readonly end?: number;
}

export interface ActivityObject {
  readonly name: string;

  readonly type: ActivityTypes;

  readonly url?: string | null;

  readonly created_at: number;

  readonly timestamps?: ActivityTimestampsObject;

  readonly application_id?: string;

  readonly details?: string | null;

  readonly details_url?: string | null;

  readonly state?: string | null;

  readonly state_url?: string | null;

  readonly emoji?: ActivityEmojiObject | null;

  readonly party?: ActivityPartyObject;

  readonly assets?: ActivityAssetsObject;

  readonly secrets?: ActivitySecretsObject;

  readonly instance?: boolean;

  readonly flags?: ActivityFlags;

  readonly buttons?: ActivityButtonsObject[];
}
