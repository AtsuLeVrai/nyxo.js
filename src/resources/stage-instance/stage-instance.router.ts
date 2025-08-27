import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { StripNull } from "../../utils/index.js";
import type { StageInstanceEntity } from "./stage-instance.entity.js";

export interface RESTCreateStageInstanceJSONParams
  extends Pick<StageInstanceEntity, "channel_id" | "topic">,
    StripNull<Partial<Pick<StageInstanceEntity, "privacy_level" | "guild_scheduled_event_id">>> {
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
