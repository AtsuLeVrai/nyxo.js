import type { Integer, Iso8601 } from "../formatting/index.js";
import type { ApplicationEntity } from "./application.js";
import type { ChannelEntity } from "./channel.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.js";
import type { UserEntity } from "./user.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export interface InviteStageInstanceEntity {
  members: Partial<GuildMemberEntity>[];
  participant_count: Integer;
  speaker_count: Integer;
  topic: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export interface InviteMetadataEntity {
  uses: Integer;
  max_uses: Integer;
  max_age: Integer;
  temporary: boolean;
  created_at: Iso8601;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetType {
  Stream = 1,
  EmbeddedApplication = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export enum InviteType {
  Guild = 0,
  GroupDm = 1,
  Friend = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export interface InviteEntity {
  type: InviteType;
  code: string;
  guild?: Partial<GuildEntity>;
  channel: Partial<ChannelEntity> | null;
  inviter?: UserEntity;
  target_type?: InviteTargetType;
  target_user?: UserEntity;
  target_application?: Partial<ApplicationEntity>;
  approximate_presence_count?: Integer;
  approximate_member_count?: Integer;
  expires_at?: Iso8601 | null;
  stage_instance?: InviteStageInstanceEntity;
  guild_scheduled_event?: GuildScheduledEventEntity;
}
