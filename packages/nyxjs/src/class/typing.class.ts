import type { Snowflake } from "@nyxjs/core";
import { TypingEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class Typing extends BaseClass<TypingEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof TypingEntity>> = {},
  ) {
    super(client, TypingEntity, entity);
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get userId(): Snowflake {
    return this.entity.user_id;
  }

  get timestamp(): number {
    return this.entity.timestamp;
  }

  get member(): GuildMember | null {
    return this.entity.member
      ? new GuildMember(this.client, this.entity.member)
      : null;
  }

  toJson(): TypingEntity {
    return { ...this.entity };
  }
}

export const TypingSchema = z.instanceof(Typing);
