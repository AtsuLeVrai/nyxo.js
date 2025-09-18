import type { SetNonNullable } from "type-fest";

export enum PrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

export interface StageInstanceObject {
  id: string;
  guild_id: string;
  channel_id: string;
  topic: string;
  privacy_level: PrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: string | null;
}

export interface CreateStageInstanceJSONParams
  extends Pick<StageInstanceObject, "channel_id" | "topic">,
    Partial<
      SetNonNullable<Pick<StageInstanceObject, "privacy_level" | "guild_scheduled_event_id">>
    > {
  send_start_notification?: boolean;
}

export type ModifyStageInstanceJSONParams = Partial<
  Pick<CreateStageInstanceJSONParams, "topic" | "privacy_level">
>;

/**
 * Checks if a stage instance is discoverable
 * @param stageInstance The stage instance to check
 * @returns true if discovery is not disabled
 */
export function isStageDiscoverable(stageInstance: StageInstanceObject): boolean {
  return !stageInstance.discoverable_disabled;
}

/**
 * Checks if a stage instance is public
 * @param stageInstance The stage instance to check
 * @returns true if the stage is public (deprecated)
 */
export function isStagePublic(stageInstance: StageInstanceObject): boolean {
  return stageInstance.privacy_level === PrivacyLevel.Public;
}

/**
 * Checks if a stage instance has an associated scheduled event
 * @param stageInstance The stage instance to check
 * @returns true if there's an associated scheduled event
 */
export function hasScheduledEvent(stageInstance: StageInstanceObject): boolean {
  return stageInstance.guild_scheduled_event_id !== null;
}
