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
    data: Partial<z.input<typeof InviteEntity>> = {},
  ) {
    super(client, InviteEntity, data);
  }

  get type(): InviteType {
    return this.data.type;
  }

  get code(): string {
    return this.data.code;
  }

  get guild(): Guild | null {
    return this.data.guild ? new Guild(this.client, this.data.guild) : null;
  }

  get channel(): Channel | null {
    return this.data.channel
      ? new Channel(this.client, this.data.channel)
      : null;
  }

  get inviter(): User | null {
    return this.data.inviter ? new User(this.client, this.data.inviter) : null;
  }

  get targetType(): InviteTargetType | null {
    return this.data.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.data.target_user
      ? new User(this.client, this.data.target_user)
      : null;
  }

  get targetApplication(): Application | null {
    return this.data.target_application
      ? new Application(this.client, this.data.target_application)
      : null;
  }

  get approximatePresenceCount(): number | null {
    return this.data.approximate_presence_count ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.data.approximate_member_count ?? null;
  }

  get expiresAt(): string | null {
    return this.data.expires_at ?? null;
  }

  get stageInstance(): InviteStageInstance | null {
    return this.data.stage_instance
      ? new InviteStageInstance(this.client, this.data.stage_instance)
      : null;
  }

  get guildScheduledEvent(): GuildScheduledEvent | null {
    return this.data.guild_scheduled_event
      ? new GuildScheduledEvent(this.client, this.data.guild_scheduled_event)
      : null;
  }

  toJson(): InviteEntity {
    return { ...this.data };
  }
}

export const InviteSchema = z.instanceof(Invite);
