import { GuildScheduledEventUserEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";
import { User } from "./user.class.js";

export class GuildScheduledEventUser extends BaseClass<GuildScheduledEventUserEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildScheduledEventUserEntity>> = {},
  ) {
    super(client, GuildScheduledEventUserEntity, entity);
  }

  get guildScheduledEventId(): Snowflake {
    return this.entity.guild_scheduled_event_id;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get member(): GuildMember | null {
    return this.entity.member
      ? new GuildMember(this.client, this.entity.member)
      : null;
  }

  toJson(): GuildScheduledEventUserEntity {
    return { ...this.entity };
  }
}

export const GuildScheduledEventUserSchema = z.instanceof(
  GuildScheduledEventUser,
);
