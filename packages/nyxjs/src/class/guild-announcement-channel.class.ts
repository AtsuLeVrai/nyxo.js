import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  GuildAnnouncementChannelEntity,
  type OverwriteEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class GuildAnnouncementChannel extends BaseClass<GuildAnnouncementChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildAnnouncementChannelEntity>> = {},
  ) {
    super(client, GuildAnnouncementChannelEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.GuildAnnouncement {
    return this.data.type;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get position(): number | null {
    return this.data.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get topic(): string | null {
    return this.data.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.data.last_message_id ?? null;
  }

  get parentId(): Snowflake | null {
    return this.data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.data.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.data.total_message_sent ?? null;
  }

  toJson(): GuildAnnouncementChannelEntity {
    return { ...this.data };
  }
}

export const GuildAnnouncementChannelSchema = z.instanceof(
  GuildAnnouncementChannel,
);
