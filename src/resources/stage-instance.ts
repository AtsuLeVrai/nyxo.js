import { BaseClass } from "../bases/index.js";
import type { CamelCaseKeys } from "../utils/index.js";

export enum StageInstancePrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

export interface StageInstanceEntity {
  id: string;
  guild_id: string;
  channel_id: string;
  topic: string;
  privacy_level: StageInstancePrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: string | null;
}

export interface RESTCreateStageInstanceJSONParams
  extends Pick<StageInstanceEntity, "channel_id" | "topic">,
    DeepNonNullable<
      Partial<Pick<StageInstanceEntity, "privacy_level" | "guild_scheduled_event_id">>
    > {
  send_start_notification?: boolean;
}

export type RESTModifyStageInstanceJSONParams = Partial<
  Pick<StageInstanceEntity, "topic" | "privacy_level">
>;

export const StageInstanceRoutes = {
  createStageInstance: () => "/stage-instances",
  getStageInstance: (channelId: string) => `/stage-instances/${channelId}` as const,
} as const satisfies RouteBuilder;

export class StageInstanceRouter extends BaseRouter {
  createStageInstance(
    options: RESTCreateStageInstanceJSONParams,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.rest.post(StageInstanceRoutes.createStageInstance(), {
      body: JSON.stringify(options),
      reason,
    });
  }

  getStageInstance(channelId: string): Promise<StageInstanceEntity> {
    return this.rest.get(StageInstanceRoutes.getStageInstance(channelId));
  }

  modifyStageInstance(
    channelId: string,
    options: RESTModifyStageInstanceJSONParams,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.rest.patch(StageInstanceRoutes.getStageInstance(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  deleteStageInstance(channelId: string, reason?: string): Promise<void> {
    return this.rest.delete(StageInstanceRoutes.getStageInstance(channelId), {
      reason,
    });
  }
}

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
