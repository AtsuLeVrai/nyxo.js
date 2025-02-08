import type { Snowflake, StageInstanceEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  CreateStageInstanceSchema,
  ModifyStageInstanceSchema,
} from "../schemas/index.js";

export class StageInstanceRouter extends BaseRouter {
  static readonly ROUTES = {
    stageInstancesBase: "/stage-instances" as const,
    stageInstance: (channelId: Snowflake) =>
      `/stage-instances/${channelId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: CreateStageInstanceSchema,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    const result = CreateStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      StageInstanceRouter.ROUTES.stageInstancesBase,
      {
        body: JSON.stringify(result.data),
        reason,
      },
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.rest.get(
      StageInstanceRouter.ROUTES.stageInstance(channelId),
      undefined,
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  modifyStageInstance(
    channelId: Snowflake,
    options: ModifyStageInstanceSchema,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    const result = ModifyStageInstanceSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      StageInstanceRouter.ROUTES.stageInstance(channelId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
      this.sessionId,
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance(channelId: Snowflake, reason?: string): Promise<void> {
    return this.rest.delete(
      StageInstanceRouter.ROUTES.stageInstance(channelId),
      {
        reason,
      },
      this.sessionId,
    );
  }
}
