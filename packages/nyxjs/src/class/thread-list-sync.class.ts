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
    data: Partial<z.input<typeof ThreadListSyncEntity>> = {},
  ) {
    super(client, ThreadListSyncEntity, data);
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.data.channel_ids)
      ? [...this.data.channel_ids]
      : [];
  }

  get threads(): AnyThreadChannel[] {
    return Array.isArray(this.data.threads)
      ? this.data.threads.map((thread) =>
          resolveThreadChannel(this.client, thread),
        )
      : [];
  }

  get members(): GuildMember[] {
    return Array.isArray(this.data.members)
      ? this.data.members.map((member) => new GuildMember(this.client, member))
      : [];
  }

  toJson(): ThreadListSyncEntity {
    return { ...this.data };
  }
}

export const ThreadListSyncSchema = z.instanceof(ThreadListSync);
