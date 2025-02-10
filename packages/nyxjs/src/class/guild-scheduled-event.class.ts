import {
  GuildScheduledEventEntity,
  type GuildScheduledEventEntityMetadataEntity,
  type GuildScheduledEventPrivacyLevel,
  type GuildScheduledEventRecurrenceRuleEntity,
  type GuildScheduledEventStatus,
  type GuildScheduledEventType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class GuildScheduledEvent {
  readonly #data: GuildScheduledEventEntity;

  constructor(data: Partial<z.input<typeof GuildScheduledEventEntity>> = {}) {
    try {
      this.#data = GuildScheduledEventEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get channelId(): Snowflake | null {
    return this.#data.channel_id ?? null;
  }

  get creatorId(): Snowflake | null {
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

  get privacyLevel(): GuildScheduledEventPrivacyLevel {
    return this.#data.privacy_level;
  }

  get status(): GuildScheduledEventStatus {
    return this.#data.status;
  }

  get entityType(): GuildScheduledEventType {
    return this.#data.entity_type;
  }

  get entityId(): Snowflake | null {
    return this.#data.entity_id ?? null;
  }

  get entityMetadata(): GuildScheduledEventEntityMetadataEntity | null {
    return this.#data.entity_metadata ?? null;
  }

  get creator(): User | null {
    return this.#data.creator ? new User(this.#data.creator) : null;
  }

  get userCount(): number | null {
    return this.#data.user_count ?? null;
  }

  get image(): string | null {
    return this.#data.image ?? null;
  }

  get recurrenceRule(): GuildScheduledEventRecurrenceRuleEntity | null {
    return this.#data.recurrence_rule ?? null;
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
