import type { Snowflake, StageInstanceEntity } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateStageInstanceEntity,
  CreateStageInstanceSchema,
  type ModifyStageInstanceEntity,
  ModifyStageInstanceSchema,
} from "../schemas/index.js";

export class StageInstanceRouter extends BaseRouter {
  static readonly ROUTES = {
    stageInstances: "/stage-instances" as const,
    stageInstance: (channelId: Snowflake) =>
      `/stage-instances/${channelId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: CreateStageInstanceEntity,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    const result = CreateStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(StageInstanceRouter.ROUTES.stageInstances, {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.get(StageInstanceRouter.ROUTES.stageInstance(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  modifyStageInstance(
    channelId: Snowflake,
    options: ModifyStageInstanceEntity,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    const result = ModifyStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(StageInstanceRouter.ROUTES.stageInstance(channelId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance(channelId: Snowflake, reason?: string): Promise<void> {
    return this.delete(StageInstanceRouter.ROUTES.stageInstance(channelId), {
      reason,
    });
  }
}
