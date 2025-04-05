import type {
  AnyChannelEntity,
  ApplicationEntity,
  GuildEntity,
  GuildScheduledEventEntity,
  InviteEntity,
  InviteStageInstanceEntity,
  InviteTargetType,
  InviteType,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { BaseClass } from "../bases/index.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord invite.
 * An invite can be used to add a user to a guild or group DM channel.
 */
export class Invite extends BaseClass<InviteEntity & { guild_id?: Snowflake }> {
  /**
   * The type of invite
   */
  get type(): InviteType {
    return this.data.type;
  }

  /**
   * The unique invite code
   */
  get code(): string {
    return this.data.code;
  }

  /**
   * The guild this invite is for
   */
  get guild(): Partial<GuildEntity> | undefined {
    return this.data.guild;
  }

  /**
   * The ID of the guild this invite is for
   */
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  /**
   * The channel this invite is for
   */
  get channel(): AnyChannelEntity | null {
    return this.data.channel;
  }

  /**
   * The user who created the invite
   */
  get inviter(): User | undefined {
    if (!this.data.inviter) {
      return undefined;
    }
    return new User(this.client, this.data.inviter as UserEntity);
  }

  /**
   * The type of target for this voice channel invite
   */
  get targetType(): InviteTargetType | undefined {
    return this.data.target_type;
  }

  /**
   * The user whose stream to display for this voice channel stream invite
   */
  get targetUser(): User | undefined {
    if (!this.data.target_user) {
      return undefined;
    }
    return new User(this.client, this.data.target_user as UserEntity);
  }

  /**
   * The embedded application to open for this voice channel embedded application invite
   */
  get targetApplication(): Partial<ApplicationEntity> | undefined {
    return this.data.target_application;
  }

  /**
   * Approximate count of online members (returned when with_counts is true)
   */
  get approximatePresenceCount(): number | undefined {
    return this.data.approximate_presence_count;
  }

  /**
   * Approximate count of total members (returned when with_counts is true)
   */
  get approximateMemberCount(): number | undefined {
    return this.data.approximate_member_count;
  }

  /**
   * The expiration date of this invite (returned when with_expiration is true)
   */
  get expiresAt(): string | null | undefined {
    return this.data.expires_at;
  }

  /**
   * Stage instance data if there is a public Stage instance in the Stage channel
   * @deprecated This field is deprecated according to Discord documentation
   */
  get stageInstance(): InviteStageInstanceEntity | undefined {
    return this.data.stage_instance;
  }

  /**
   * Guild scheduled event data
   */
  get guildScheduledEvent(): GuildScheduledEventEntity | undefined {
    return this.data.guild_scheduled_event;
  }

  /**
   * Whether the invite has expiration data
   */
  get hasExpiration(): boolean {
    return Boolean(this.data.expires_at);
  }

  /**
   * Whether the invite is for a guild
   */
  get isGuildInvite(): boolean {
    return Boolean(this.data.guild || this.data.guild_id);
  }

  /**
   * Whether the invite is for a voice channel
   */
  get isVoiceChannelInvite(): boolean {
    return Boolean(this.data.target_type);
  }

  /**
   * Whether the invite is for a scheduled event
   */
  get hasScheduledEvent(): boolean {
    return Boolean(this.data.guild_scheduled_event);
  }
}
