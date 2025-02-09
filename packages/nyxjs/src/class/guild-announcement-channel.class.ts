import { GuildAnnouncementChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class GuildAnnouncementChannel {
  readonly #data: GuildAnnouncementChannelEntity;

  constructor(
    data: Partial<z.input<typeof GuildAnnouncementChannelEntity>> = {},
  ) {
    try {
      this.#data = GuildAnnouncementChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get permissionOverwrites(): object[] | null {
    return this.#data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get topic(): string | null {
    return this.#data.topic ?? null;
  }

  get nsfw(): boolean | null {
    return this.#data.nsfw ?? null;
  }

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
  }

  get parentId(): unknown | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): unknown | null {
    return this.#data.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get flags(): unknown {
    return this.#data.flags;
  }

  get totalMessageSent(): number | null {
    return this.#data.total_message_sent ?? null;
  }

  static fromJson(
    json: GuildAnnouncementChannelEntity,
  ): GuildAnnouncementChannel {
    return new GuildAnnouncementChannel(json);
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
