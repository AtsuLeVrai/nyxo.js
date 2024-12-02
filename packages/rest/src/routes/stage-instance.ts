import {
  BitwisePermissionFlags,
  type Snowflake,
  type StageInstanceEntity,
  StageInstancePrivacyLevel,
} from "@nyxjs/core";
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
  static readonly MODERATOR_PERMISSIONS = [
    BitwisePermissionFlags.ManageChannels,
    BitwisePermissionFlags.MuteMembers,
    BitwisePermissionFlags.MoveMembers,
  ];
  static readonly routes = {
    stageInstances: "/stage-instances" as const,
    stageInstance: (channelId: Snowflake): `/stage-instances/${Snowflake}` => {
      return `/stage-instances/${channelId}` as const;
    },
  } as const;
  private static readonly TOPIC_MIN_LENGTH = 1;
  private static readonly TOPIC_MAX_LENGTH = 120;
  private static readonly DEFAULT_PRIVACY_LEVEL =
    StageInstancePrivacyLevel.GuildOnly;

  validateTopic(topic: string): void {
    if (
      !topic ||
      topic.length < StageInstanceRouter.TOPIC_MIN_LENGTH ||
      topic.length > StageInstanceRouter.TOPIC_MAX_LENGTH
    ) {
      throw new Error(
        `Topic must be between ${StageInstanceRouter.TOPIC_MIN_LENGTH} and ${StageInstanceRouter.TOPIC_MAX_LENGTH} characters`,
      );
    }
  }

  validatePrivacyLevel(privacyLevel?: number): void {
    if (
      privacyLevel !== undefined &&
      !Object.values(StageInstancePrivacyLevel).includes(privacyLevel)
    ) {
      throw new Error("Invalid privacy level");
    }
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance}
   */
  createStageInstance(
    options: StageInstanceCreate,
    reason?: string,
  ): Promise<StageInstanceEntity> {
    this.validateTopic(options.topic);
    this.validatePrivacyLevel(options.privacy_level);

    return this.post(StageInstanceRouter.routes.stageInstances, {
      body: JSON.stringify({
        ...options,
        privacy_level:
          options.privacy_level ?? StageInstanceRouter.DEFAULT_PRIVACY_LEVEL,
      }),
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
    if (options.topic) {
      this.validateTopic(options.topic);
    }
    if (options.privacy_level) {
      this.validatePrivacyLevel(options.privacy_level);
    }

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
