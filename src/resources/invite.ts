import type { ApplicationObject } from "./application.js";
import type { AnyChannelObject } from "./channel.js";
import type { GuildMemberObject, GuildObject } from "./guild.js";
import type { GuildScheduledEventObject } from "./guild-scheduled-event.js";
import type { UserObject } from "./user.js";

export enum InviteType {
  Guild = 0,
  GroupDm = 1,
  Friend = 2,
}

export enum InviteTargetType {
  Stream = 1,
  EmbeddedApplication = 2,
}

export enum GuildInviteFlags {
  IsGuestInvite = 1 << 0,
}

export interface InviteObject {
  type: InviteType;
  code: string;
  guild?: Partial<GuildObject>;
  channel: Partial<AnyChannelObject> | null;
  inviter?: UserObject;
  target_type?: InviteTargetType;
  target_user?: UserObject;
  target_application?: Partial<ApplicationObject>;
  approximate_presence_count?: number;
  approximate_member_count?: number;
  expires_at: string | null;
  stage_instance?: InviteStageInstanceObject;
  guild_scheduled_event?: GuildScheduledEventObject;
  flags?: GuildInviteFlags;
}

export interface GuildInviteObject extends Omit<InviteObject, "type"> {
  type: InviteType.Guild;
}

export interface GroupDmInviteObject
  extends Omit<
    InviteObject,
    | "type"
    | "guild"
    | "approximate_presence_count"
    | "approximate_member_count"
    | "stage_instance"
    | "guild_scheduled_event"
    | "flags"
  > {
  type: InviteType.GroupDm;
}

export interface FriendInviteObject extends Pick<InviteObject, "code" | "inviter" | "expires_at"> {
  type: InviteType.Friend;
}

export type AnyInviteObject = GuildInviteObject | GroupDmInviteObject | FriendInviteObject;

export interface InviteMetadataObject {
  uses: number;
  max_uses: number;
  max_age: number;
  temporary: boolean;
  created_at: string;
}

export interface InviteStageInstanceObject {
  members: Partial<GuildMemberObject>[];
  participant_count: number;
  speaker_count: number;
  topic: string;
}
