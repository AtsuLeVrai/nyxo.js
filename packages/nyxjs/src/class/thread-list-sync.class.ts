import type { Snowflake } from "@nyxjs/core";
import { ThreadListSyncEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { type AnyThreadChannel, resolveThreadChannel } from "../utils/index.js";
import { GuildMember } from "./guild-member.class.js";

export class ThreadListSync extends BaseClass<ThreadListSyncEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ThreadListSyncEntity>> = {},
  ) {
    super(client, ThreadListSyncEntity, entity);
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.entity.channel_ids)
      ? [...this.entity.channel_ids]
      : [];
  }

  get threads(): AnyThreadChannel[] {
    return Array.isArray(this.entity.threads)
      ? this.entity.threads.map((thread) =>
          resolveThreadChannel(this.client, thread),
        )
      : [];
  }

  get members(): GuildMember[] {
    return Array.isArray(this.entity.members)
      ? this.entity.members.map(
          (member) => new GuildMember(this.client, member),
        )
      : [];
  }

  toJson(): ThreadListSyncEntity {
    return { ...this.entity };
  }
}

export const ThreadListSyncSchema = z.instanceof(ThreadListSync);
