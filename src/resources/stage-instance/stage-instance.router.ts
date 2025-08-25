import type { Rest } from "../../core/index.js";
import type { StageInstanceEntity, StageInstancePrivacyLevel } from "./stage-instance.entity.js";

export interface StageCreateOptions {
  channel_id: string;
  topic: string;
  privacy_level?: StageInstancePrivacyLevel;
  send_start_notification?: boolean;
  guild_scheduled_event_id?: string | null;
}

export interface StageUpdateOptions {
  topic?: string;
  privacy_level?: StageInstancePrivacyLevel;
}

export class StageInstanceRouter {
  static readonly Routes = {
    stageInstancesEndpoint: () => "/stage-instances",
    stageInstanceByIdEndpoint: (channelId: string) => `/stage-instances/${channelId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  createStage(options: StageCreateOptions, reason?: string): Promise<StageInstanceEntity> {
    return this.#rest.post(StageInstanceRouter.Routes.stageInstancesEndpoint(), {
      body: JSON.stringify(options),
      reason,
    });
  }
  fetchStage(channelId: string): Promise<StageInstanceEntity> {
    return this.#rest.get(StageInstanceRouter.Routes.stageInstanceByIdEndpoint(channelId));
  }
  updateStage(
    channelId: string,
    options: StageUpdateOptions,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.patch(StageInstanceRouter.Routes.stageInstanceByIdEndpoint(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  endStage(channelId: string, reason?: string): Promise<void> {
    return this.#rest.delete(StageInstanceRouter.Routes.stageInstanceByIdEndpoint(channelId), {
      reason,
    });
  }
}
