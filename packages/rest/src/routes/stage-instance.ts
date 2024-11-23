import type {
  Snowflake,
  StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

interface StageInstanceCreate {
  channel_id: Snowflake;
  topic: string;
  privacy_level?: StageInstancePrivacyLevel;
  send_start_notification?: boolean;
  guild_scheduled_event_id?: Snowflake;
}

interface StageInstanceModify {
  topic?: string;
  privacy_level?: StageInstancePrivacyLevel;
}

export class StageInstanceRoutes {
  static routes = {
    stageInstances: "/stage-instances" as const,
    stageInstance: (channelId: Snowflake): `/stage-instances/${Snowflake}` => {
      return `/stage-instances/${channelId}` as const;
    },
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: StageInstanceCreate,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.post(StageInstanceRoutes.routes.stageInstances, {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#get-stage-instance}
   */
  getStageInstance(channelId: Snowflake): Promise<StageInstanceEntity> {
    return this.#rest.get(StageInstanceRoutes.routes.stageInstance(channelId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance}
   */
  modifyStageInstance(
    channelId: Snowflake,
    options: StageInstanceModify,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    return this.#rest.patch(
      StageInstanceRoutes.routes.stageInstance(channelId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#delete-stage-instance}
   */
  deleteStageInstance(channelId: Snowflake, reason?: string): Promise<void> {
    return this.#rest.delete(
      StageInstanceRoutes.routes.stageInstance(channelId),
      {
        reason,
      },
    );
  }
}
