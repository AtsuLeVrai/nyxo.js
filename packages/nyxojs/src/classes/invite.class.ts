import type {
  InviteStageInstanceEntity,
  InviteTargetType,
  InviteType,
  InviteWithMetadataEntity,
  Snowflake,
} from "@nyxojs/core";
import type { GuildCreateEntity, InviteCreateEntity } from "@nyxojs/gateway";
import type { ObjectToCamel } from "ts-case-convert";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import { channelFactory } from "../utils/index.js";
import { Application } from "./application.class.js";
import type { AnyChannel } from "./channel.class.js";
import { Guild } from "./guild.class.js";
import { GuildScheduledEvent } from "./scheduled-event.class.js";
import { User } from "./user.class.js";

@Cacheable<InviteWithMetadataEntity & InviteCreateEntity>(
  "invites",
  (invite) => invite.code,
)
export class Invite
  extends BaseClass<InviteWithMetadataEntity & InviteCreateEntity>
  implements
    Enforce<ObjectToCamel<InviteWithMetadataEntity & InviteCreateEntity>>
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
    return channelFactory(this.client, this.data.channel);
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get guild(): Guild | undefined {
    if (!this.data.guild) {
      return undefined;
    }
    return new Guild(this.client, this.data.guild as GuildCreateEntity);
  }

  get inviter(): User | undefined {
    if (!this.data.inviter) {
      return undefined;
    }
    return new User(this.client, this.data.inviter);
  }

  get targetType(): InviteTargetType | undefined {
    return this.data.target_type;
  }

  get targetUser(): User | undefined {
    if (!this.data.target_user) {
      return undefined;
    }
    return new User(this.client, this.data.target_user);
  }

  get targetApplication(): Application | undefined {
    if (!this.data.target_application) {
      return undefined;
    }

    return new Application(this.client, this.data.target_application);
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
    return new GuildScheduledEvent(
      this.client,
      this.data.guild_scheduled_event,
    );
  }
}
