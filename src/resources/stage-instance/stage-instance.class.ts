import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { StageInstanceEntity } from "./stage-instance.entity.js";

export class StageInstance
  extends BaseClass<StageInstanceEntity>
  implements CamelCaseKeys<StageInstanceEntity>
{
  readonly id = this.rawData.id;
  readonly guildId = this.rawData.guild_id;
  readonly channelId = this.rawData.channel_id;
  readonly topic = this.rawData.topic;
  readonly privacyLevel = this.rawData.privacy_level;
  readonly discoverableDisabled = this.rawData.discoverable_disabled;
  readonly guildScheduledEventId = this.rawData.guild_scheduled_event_id;
}
