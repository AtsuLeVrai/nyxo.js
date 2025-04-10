import type {
  InviteEntity,
  InviteStageInstanceEntity,
  InviteTargetType,
  InviteType,
  Snowflake,
} from "@nyxjs/core";
import type { GuildCreateEntity, InviteCreateEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { Application } from "../applications/index.js";
import type { AnyChannel } from "../channels/index.js";
import { Guild } from "../guilds/index.js";
import { GuildScheduledEvent } from "../scheduled-events/index.js";
import { User } from "../users/index.js";

export class Invite
  extends BaseClass<InviteEntity & InviteCreateEntity>
  implements EnforceCamelCase<InviteEntity & InviteCreateEntity>
{
  get code(): string {
    return this.data.code;
  }

  get type(): InviteType | undefined {
    return this.data.type;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get channel(): AnyChannel | null {
    if (!this.data.channel) {
      return null;
    }
    return ChannelFactory.create(this.client, this.data.channel);
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get guild(): Guild | undefined {
    if (!this.data.guild) {
      return undefined;
    }
    return Guild.from(this.client, this.data.guild as GuildCreateEntity);
  }

  get inviter(): User | undefined {
    if (!this.data.inviter) {
      return undefined;
    }
    return User.from(this.client, this.data.inviter);
  }

  get targetType(): InviteTargetType | undefined {
    return this.data.target_type;
  }

  get targetUser(): User | undefined {
    if (!this.data.target_user) {
      return undefined;
    }
    return User.from(this.client, this.data.target_user);
  }

  get targetApplication(): Application | undefined {
    if (!this.data.target_application) {
      return undefined;
    }

    return Application.from(this.client, this.data.target_application);
  }

  get temporary(): boolean {
    return Boolean(this.data.temporary);
  }

  get uses(): number {
    return this.data.uses;
  }

  get maxUses(): number {
    return this.data.max_uses;
  }

  get maxAge(): number {
    return this.data.max_age;
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  get approximatePresenceCount(): number | undefined {
    return this.data.approximate_presence_count;
  }

  get approximateMemberCount(): number | undefined {
    return this.data.approximate_member_count;
  }

  get expiresAt(): string | null | undefined {
    return this.data.expires_at;
  }

  get stageInstance(): InviteStageInstanceEntity | undefined {
    return this.data.stage_instance;
  }

  get guildScheduledEvent(): GuildScheduledEvent | undefined {
    if (!this.data.guild_scheduled_event) {
      return undefined;
    }
    return GuildScheduledEvent.from(
      this.client,
      this.data.guild_scheduled_event,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "invites",
      id: this.code,
    };
  }
}
