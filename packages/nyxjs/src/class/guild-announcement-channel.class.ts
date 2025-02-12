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
    entity: Partial<z.input<typeof GuildAnnouncementChannelEntity>> = {},
  ) {
    super(client, GuildAnnouncementChannelEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType.GuildAnnouncement {
    return this.entity.type;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get position(): number | null {
    return this.entity.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.entity.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get topic(): string | null {
    return this.entity.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.entity.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.entity.last_message_id ?? null;
  }

  get parentId(): Snowflake | null {
    return this.entity.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.entity.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.entity.total_message_sent ?? null;
  }

  toJson(): GuildAnnouncementChannelEntity {
    return { ...this.entity };
  }
}

export const GuildAnnouncementChannelSchema = z.instanceof(
  GuildAnnouncementChannel,
);
