import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class StageInstance
  extends BaseClass<StageInstanceEntity>
  implements EnforceCamelCase<StageInstanceEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get topic(): string {
    return this.data.topic;
  }

  get privacyLevel(): StageInstancePrivacyLevel {
    return this.data.privacy_level;
  }

  get discoverableDisabled(): boolean {
    return Boolean(this.data.discoverable_disabled);
  }

  get guildScheduledEventId(): Snowflake | null {
    return this.data.guild_scheduled_event_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "stageInstances",
      id: this.id,
    };
  }
}
