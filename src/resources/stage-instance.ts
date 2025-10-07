import type { SetNonNullable } from "../utils/index.js";

export enum PrivacyLevel {
  Public = 1,

  GuildOnly = 2,
}

export interface StageInstanceObject {
  readonly id: string;

  readonly guild_id: string;

  readonly channel_id: string;

  readonly topic: string;

  readonly privacy_level: PrivacyLevel;

  readonly discoverable_disabled: boolean;

  readonly guild_scheduled_event_id: string | null;
}

export interface CreateStageInstanceJSONParams
  extends Pick<StageInstanceObject, "channel_id" | "topic">,
    Partial<
      SetNonNullable<Pick<StageInstanceObject, "privacy_level" | "guild_scheduled_event_id">>
    > {
  readonly send_start_notification?: boolean;
}

export type ModifyStageInstanceJSONParams = Partial<
  Pick<CreateStageInstanceJSONParams, "topic" | "privacy_level">
>;
