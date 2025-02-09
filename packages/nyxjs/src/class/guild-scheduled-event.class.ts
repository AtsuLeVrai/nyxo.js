import { GuildScheduledEventEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildScheduledEvent {
  readonly #data: GuildScheduledEventEntity;

  constructor(data: GuildScheduledEventEntity) {
    this.#data = GuildScheduledEventEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get channelId(): unknown | null {
    return this.#data.channel_id ?? null;
  }

  get creatorId(): unknown | null {
    return this.#data.creator_id ?? null;
  }

  get name(): string {
    return this.#data.name;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get scheduledStartTime(): string {
    return this.#data.scheduled_start_time;
  }

  get scheduledEndTime(): string | null {
    return this.#data.scheduled_end_time ?? null;
  }

  get privacyLevel(): unknown {
    return this.#data.privacy_level;
  }

  get status(): unknown {
    return this.#data.status;
  }

  get entityType(): unknown {
    return this.#data.entity_type;
  }

  get entityId(): unknown | null {
    return this.#data.entity_id ?? null;
  }

  get entityMetadata(): object | null {
    return this.#data.entity_metadata ?? null;
  }

  get creator(): object | null {
    return this.#data.creator ?? null;
  }

  get userCount(): number | null {
    return this.#data.user_count ?? null;
  }

  get image(): string | null {
    return this.#data.image ?? null;
  }

  get recurrenceRule(): object | null {
    return this.#data.recurrence_rule ?? null;
  }

  static fromJson(json: GuildScheduledEventEntity): GuildScheduledEvent {
    return new GuildScheduledEvent(json);
  }

  toJson(): GuildScheduledEventEntity {
    return { ...this.#data };
  }

  clone(): GuildScheduledEvent {
    return new GuildScheduledEvent(this.toJson());
  }

  validate(): boolean {
    try {
      GuildScheduledEventSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildScheduledEventEntity>): GuildScheduledEvent {
    return new GuildScheduledEvent({ ...this.toJson(), ...other });
  }

  equals(other: GuildScheduledEvent): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildScheduledEventSchema = z.instanceof(GuildScheduledEvent);
