import {
  InviteEntity,
  type InviteTargetType,
  type InviteType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Application } from "./application.class.js";
import { Channel } from "./channel.class.js";
import { GuildScheduledEvent } from "./guild-scheduled-event.class.js";
import { Guild } from "./guild.class.js";
import { InviteStageInstance } from "./invite-stage-instance.class.js";
import { User } from "./user.class.js";

export class Invite extends BaseClass<InviteEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof InviteEntity>> = {},
  ) {
    super(client, InviteEntity, entity);
  }

  get type(): InviteType {
    return this.entity.type;
  }

  get code(): string {
    return this.entity.code;
  }

  get guild(): Guild | null {
    return this.entity.guild ? new Guild(this.client, this.entity.guild) : null;
  }

  get channel(): Channel | null {
    return this.entity.channel
      ? new Channel(this.client, this.entity.channel)
      : null;
  }

  get inviter(): User | null {
    return this.entity.inviter
      ? new User(this.client, this.entity.inviter)
      : null;
  }

  get targetType(): InviteTargetType | null {
    return this.entity.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.entity.target_user
      ? new User(this.client, this.entity.target_user)
      : null;
  }

  get targetApplication(): Application | null {
    return this.entity.target_application
      ? new Application(this.client, this.entity.target_application)
      : null;
  }

  get approximatePresenceCount(): number | null {
    return this.entity.approximate_presence_count ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.entity.approximate_member_count ?? null;
  }

  get expiresAt(): string | null {
    return this.entity.expires_at ?? null;
  }

  get stageInstance(): InviteStageInstance | null {
    return this.entity.stage_instance
      ? new InviteStageInstance(this.client, this.entity.stage_instance)
      : null;
  }

  get guildScheduledEvent(): GuildScheduledEvent | null {
    return this.entity.guild_scheduled_event
      ? new GuildScheduledEvent(this.client, this.entity.guild_scheduled_event)
      : null;
  }

  toJson(): InviteEntity {
    return { ...this.entity };
  }
}

export const InviteSchema = z.instanceof(Invite);
