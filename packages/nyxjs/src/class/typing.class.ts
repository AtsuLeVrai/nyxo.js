import type { Snowflake } from "@nyxjs/core";
import { TypingEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class Typing extends BaseClass<TypingEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof TypingEntity>> = {},
  ) {
    super(client, TypingEntity, data);
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get timestamp(): number {
    return this.data.timestamp;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  toJson(): TypingEntity {
    return { ...this.data };
  }
}

export const TypingSchema = z.instanceof(Typing);
