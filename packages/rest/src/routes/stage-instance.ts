import type { Snowflake, StageInstanceEntity } from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface StageInstanceCreate
  extends Pick<
    StageInstanceEntity,
    "channel_id" | "topic" | "privacy_level" | "guild_scheduled_event_id"
  > {
  send_start_notification?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type StageInstanceModify = Pick<
  StageInstanceEntity,
  "topic" | "privacy_level"
>;

export class StageInstanceRouter extends Router {
  static routes = {
    stageInstances: "/stage-instances" as const,
    stageInstance: (channelId: Snowflake): `/stage-instances/${Snowflake}` => {
      return `/stage-instances/${channelId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: StageInstanceCreate,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.post(StageInstanceRouter.routes.stageInstances, {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.get(StageInstanceRouter.routes.stageInstance(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  modifyStageInstance(
    channelId: Snowflake,
    options: StageInstanceModify,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.patch(StageInstanceRouter.routes.stageInstance(channelId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance(channelId: Snowflake, reason?: string): Promise<void> {
    return this.delete(StageInstanceRouter.routes.stageInstance(channelId), {
      reason,
    });
  }
}
