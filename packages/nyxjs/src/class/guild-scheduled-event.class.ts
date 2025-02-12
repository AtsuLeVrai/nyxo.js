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
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class GuildScheduledEvent extends BaseClass<GuildScheduledEventEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildScheduledEventEntity>> = {},
  ) {
    super(client, GuildScheduledEventEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  get creatorId(): Snowflake | null {
    return this.entity.creator_id ?? null;
  }

  get name(): string {
    return this.entity.name;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get scheduledStartTime(): string {
    return this.entity.scheduled_start_time;
  }

  get scheduledEndTime(): string | null {
    return this.entity.scheduled_end_time ?? null;
  }

  get privacyLevel(): GuildScheduledEventPrivacyLevel {
    return this.entity.privacy_level;
  }

  get status(): GuildScheduledEventStatus {
    return this.entity.status;
  }

  get entityType(): GuildScheduledEventType {
    return this.entity.entity_type;
  }

  get entityId(): Snowflake | null {
    return this.entity.entity_id ?? null;
  }

  get entityMetadata(): GuildScheduledEventEntityMetadataEntity | null {
    return this.entity.entity_metadata ?? null;
  }

  get creator(): User | null {
    return this.entity.creator
      ? new User(this.client, this.entity.creator)
      : null;
  }

  get userCount(): number | null {
    return this.entity.user_count ?? null;
  }

  get image(): string | null {
    return this.entity.image ?? null;
  }

  get recurrenceRule(): GuildScheduledEventRecurrenceRuleEntity | null {
    return this.entity.recurrence_rule ?? null;
  }

  toJson(): GuildScheduledEventEntity {
    return { ...this.entity };
  }
}

export const GuildScheduledEventSchema = z.instanceof(GuildScheduledEvent);
