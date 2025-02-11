import { GuildScheduledEventUserEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";
import { User } from "./user.class.js";

export class GuildScheduledEventUser extends BaseClass<GuildScheduledEventUserEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildScheduledEventUserEntity>> = {},
  ) {
    super(client, GuildScheduledEventUserEntity, data);
  }

  get guildScheduledEventId(): Snowflake {
    return this.data.guild_scheduled_event_id;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  toJson(): GuildScheduledEventUserEntity {
    return { ...this.data };
  }
}

export const GuildScheduledEventUserSchema = z.instanceof(
  GuildScheduledEventUser,
);
