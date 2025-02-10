import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  GuildAnnouncementChannelEntity,
  type OverwriteEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class GuildAnnouncementChannel {
  readonly #data: GuildAnnouncementChannelEntity;
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    data: Partial<z.input<typeof GuildAnnouncementChannelEntity>> = {},
  ) {
    try {
      this.#data = GuildAnnouncementChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType.GuildAnnouncement {
    return this.#data.type;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.#data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get topic(): string | null {
    return this.#data.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.#data.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.#data.last_message_id ?? null;
  }

  get parentId(): Snowflake | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.#data.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.#data.total_message_sent ?? null;
  }

  toJson(): GuildAnnouncementChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildAnnouncementChannel {
    return new GuildAnnouncementChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildAnnouncementChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(
    other: Partial<GuildAnnouncementChannelEntity>,
  ): GuildAnnouncementChannel {
    return new GuildAnnouncementChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildAnnouncementChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildAnnouncementChannelSchema = z.instanceof(
  GuildAnnouncementChannel,
);
