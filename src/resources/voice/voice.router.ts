import { BaseRouter } from "../../bases/index.js";
import type { RouteBuilder } from "../../core/index.js";
import type { VoiceRegionEntity, VoiceStateEntity } from "./voice.entity.js";

export type RESTModifyCurrentUserVoiceStateJSONParams = Partial<
  Pick<VoiceStateEntity, "channel_id" | "suppress" | "request_to_speak_timestamp">
>;

export type RESTModifyUserVoiceStateJSONParams = Omit<
  RESTModifyCurrentUserVoiceStateJSONParams,
  "request_to_speak_timestamp"
>;

export const VoiceRoutes = {
  listVoiceRegions: () => "/voice/regions",
  getCurrentUserVoiceState: (guildId: string) => `/guilds/${guildId}/voice-states/@me` as const,
  getUserVoiceState: (guildId: string, userId: string) =>
    `/guilds/${guildId}/voice-states/${userId}` as const,
} as const satisfies RouteBuilder;

export class VoiceRouter extends BaseRouter {
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.rest.get(VoiceRoutes.listVoiceRegions());
  }

  getCurrentUserVoiceState(guildId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getCurrentUserVoiceState(guildId));
  }

  getUserVoiceState(guildId: string, userId: string): Promise<VoiceStateEntity> {
    return this.rest.get(VoiceRoutes.getUserVoiceState(guildId, userId));
  }

  modifyCurrentUserVoiceState(
    guildId: string,
    options: RESTModifyCurrentUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getCurrentUserVoiceState(guildId), {
      body: JSON.stringify(options),
    });
  }

  modifyUserVoiceState(
    guildId: string,
    userId: string,
    options: RESTModifyUserVoiceStateJSONParams,
  ): Promise<void> {
    return this.rest.patch(VoiceRoutes.getUserVoiceState(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}
