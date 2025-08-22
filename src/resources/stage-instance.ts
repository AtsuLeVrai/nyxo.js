import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";

export enum PrivacyLevel {
  Public = 1,
  GuildOnly = 2,
}

export interface StageInstanceObject {
  id: Snowflake;
  guild_id: Snowflake;
  channel_id: Snowflake;
  topic: string;
  privacy_level: PrivacyLevel;
  discoverable_disabled: boolean;
  guild_scheduled_event_id: Snowflake | null;
}

// Stage Instance Request Interfaces
export interface CreateStageInstanceRequest {
  channel_id: Snowflake;
  topic: string;
  privacy_level?: PrivacyLevel;
  send_start_notification?: boolean;
  guild_scheduled_event_id?: Snowflake;
}

export interface ModifyStageInstanceRequest {
  topic?: string;
  privacy_level?: PrivacyLevel;
}

export const StageInstanceRoutes = {
  // POST /stage-instances - Create Stage Instance
  createStageInstance: (() => "/stage-instances") as EndpointFactory<
    "/stage-instances",
    ["POST"],
    StageInstanceObject,
    true,
    false,
    CreateStageInstanceRequest
  >,

  // GET /stage-instances/{channel.id} - Get Stage Instance
  getStageInstance: ((channelId: Snowflake) => `/stage-instances/${channelId}`) as EndpointFactory<
    `/stage-instances/${string}`,
    ["GET", "PATCH", "DELETE"],
    StageInstanceObject,
    true,
    false,
    ModifyStageInstanceRequest
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
