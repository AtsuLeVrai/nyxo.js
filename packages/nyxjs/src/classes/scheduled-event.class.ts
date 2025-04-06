import type {
  GuildMemberEntity,
  GuildScheduledEventEntity,
  GuildScheduledEventEntityMetadataEntity,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventRecurrenceRuleEntity,
  GuildScheduledEventStatus,
  GuildScheduledEventType,
  GuildScheduledEventUserEntity,
  Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import type { GuildBased } from "../types/index.js";
import { GuildMember } from "./guild.class.js";
import { User } from "./user.class.js";

export class GuildScheduledEventUser extends BaseClass<GuildScheduledEventUserEntity> {
  get guildScheduledEventId(): Snowflake {
    return this.data.guild_scheduled_event_id;
  }

  get user(): User {
    return User.from(this.client, this.data.user);
  }

  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class GuildScheduledEvent extends BaseClass<GuildScheduledEventEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get channelId(): Snowflake | null | undefined {
    return this.data.channel_id;
  }

  get creatorId(): Snowflake | null | undefined {
    return this.data.creator_id;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null | undefined {
    return this.data.description;
  }

  get scheduledStartTime(): string {
    return this.data.scheduled_start_time;
  }

  get scheduledEndTime(): string | null | undefined {
    return this.data.scheduled_end_time;
  }

  get privacyLevel(): GuildScheduledEventPrivacyLevel {
    return this.data.privacy_level;
  }

  get status(): GuildScheduledEventStatus {
    return this.data.status;
  }

  get entityType(): GuildScheduledEventType {
    return this.data.entity_type;
  }

  get entityId(): Snowflake | null {
    return this.data.entity_id;
  }

  get entityMetadata(): GuildScheduledEventEntityMetadataEntity | null {
    return this.data.entity_metadata;
  }

  get creator(): User | undefined {
    if (!this.data.creator) {
      return undefined;
    }

    return User.from(this.client, this.data.creator);
  }

  get userCount(): number | undefined {
    return this.data.user_count;
  }

  get image(): string | null | undefined {
    return this.data.image;
  }

  get recurrenceRule(): GuildScheduledEventRecurrenceRuleEntity | null {
    return this.data.recurrence_rule;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "scheduledEvents",
      id: this.id,
    };
  }
}
