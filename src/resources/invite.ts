import type { ApplicationEntity } from "./application.js";
import type { AnyChannelEntity } from "./channel.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.js";
import type { GuildScheduledEventObject } from "./guild-scheduled-event.js";
import type { UserObject } from "./user.js";

export enum InviteTypes {
  Guild = 0,

  GroupDm = 1,

  Friend = 2,
}

export enum InviteTargetTypes {
  Stream = 1,

  EmbeddedApplication = 2,
}

export enum GuildInviteFlags {
  IsGuestInvite = 1 << 0,
}

export interface InviteStageInstanceObject {
  readonly members: Partial<GuildMemberEntity>[];

  readonly participant_count: number;

  readonly speaker_count: number;

  readonly topic: string;
}

export interface InviteMetadataObject {
  readonly uses: number;

  readonly max_uses: number;

  readonly max_age: number;

  readonly temporary: boolean;

  readonly created_at: string;
}

export interface InviteObject {
  readonly type: InviteTypes;

  readonly code: string;

  readonly guild?: Partial<GuildEntity>;

  readonly channel: AnyChannelEntity | null;

  readonly inviter?: UserObject;

  readonly target_type?: InviteTargetTypes;

  readonly target_user?: UserObject;

  readonly target_application?: Partial<ApplicationEntity>;

  readonly approximate_presence_count?: number;

  readonly approximate_member_count?: number;

  readonly expires_at?: string | null;

  readonly stage_instance?: InviteStageInstanceObject;

  readonly guild_scheduled_event?: GuildScheduledEventObject;

  readonly flags?: GuildInviteFlags;
}

export type InviteWithMetadataObject = InviteObject & InviteMetadataObject;

export interface InviteDeleteObject {
  readonly channel_id: string;

  readonly guild_id?: string;

  readonly code: string;
}

export interface InviteCreateObject {
  readonly channel_id: string;

  readonly code: string;

  readonly created_at: string;

  readonly guild_id?: string;

  readonly inviter?: UserObject;

  readonly max_age: number;

  readonly max_uses: number;

  readonly target_type?: InviteTargetTypes;

  readonly target_user?: UserObject;

  readonly target_application?: ApplicationEntity;

  readonly temporary: boolean;

  readonly uses: number;
}

export interface GetInviteQueryStringParams {
  readonly with_counts?: boolean;

  readonly guild_scheduled_event_id?: string;
}
