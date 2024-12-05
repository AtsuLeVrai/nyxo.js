import type { StageInstanceEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#create-stage-instance-json-params}
 */
export interface StageInstanceCreateEntity
  extends Pick<
    StageInstanceEntity,
    "channel_id" | "topic" | "privacy_level" | "guild_scheduled_event_id"
  > {
  send_start_notification?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/stage-instance#modify-stage-instance-json-params}
 */
export type StageInstanceModifyEntity = Pick<
  StageInstanceEntity,
  "topic" | "privacy_level"
>;
