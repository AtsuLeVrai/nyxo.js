import type { AnyChannelEntity } from "./channel/index.js";
import type { GuildEntity, GuildMemberEntity } from "./guild/index.js";
import type { GuildScheduledEventEntity } from "./guild-scheduled-event/index.js";

export enum InviteTargetType {
  Stream = 1,
  EmbeddedApplication = 2,
}

export enum InviteType {
  Guild = 0,
  GroupDm = 1,
  Friend = 2,
}

export enum GuildInviteFlags {
  IsGuestInvite = 1 << 0,
}

export interface InviteStageInstanceEntity {
  members: Partial<GuildMemberEntity>[];
  participant_count: number;
  speaker_count: number;
  topic: string;
}

export interface InviteMetadataEntity {
  uses: number;
  max_uses: number;
  max_age: number;
  temporary: boolean;
  created_at: string;
}

export interface InviteEntity {
  type: InviteType;
  code: string;
  guild?: Partial<GuildEntity>;
  channel: AnyChannelEntity | null;
  inviter?: Partial<UserEntity>;
  target_type?: InviteTargetType;
  target_user?: Partial<UserEntity>;
  target_application?: Partial<ApplicationEntity>;
  approximate_presence_count?: number;
  approximate_member_count?: number;
  expires_at?: string | null;
  stage_instance?: InviteStageInstanceEntity;
  guild_scheduled_event?: GuildScheduledEventEntity;
  flags?: GuildInviteFlags;
}

export type InviteWithMetadataEntity = InviteEntity & InviteMetadataEntity;

export interface GatewayInviteDeleteEntity {
  channel_id: string;
  guild_id?: string;
  code: string;
}

export interface GatewayInviteCreateEntity {
  channel_id: string;
  code: string;
  created_at: string;
  guild_id?: string;
  inviter?: UserEntity;
  max_age: number;
  max_uses: number;
  target_type?: InviteTargetType;
  target_user?: UserEntity;
  target_application?: ApplicationEntity;
  temporary: boolean;
  uses: number;
}

export interface RESTGetInviteQueryStringParams {
  with_counts?: boolean;
  with_expiration?: boolean;
  guild_scheduled_event_id?: string;
}

export interface RESTPostChannelInviteJSONParams {
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
  unique?: boolean;
  target_type?: number;
  target_user_id?: string;
  target_application_id?: string;
}

export const InviteRoutes = {
  invite: (code: string) => `/invites/${code}` as const,
  channelInvites: (channelId: string) => `/channels/${channelId}/invites` as const,
  guildInvites: (guildId: string) => `/guilds/${guildId}/invites` as const,
} as const satisfies RouteBuilder;
