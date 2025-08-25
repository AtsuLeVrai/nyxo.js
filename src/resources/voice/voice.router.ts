import type { Rest } from "../../core/index.js";
import type { VoiceRegionEntity, VoiceStateEntity } from "./voice.entity.js";

export interface VoiceStateUpdateOptions {
  channel_id?: string | null;
  suppress?: boolean;
  request_to_speak_timestamp?: string | null;
}

export interface OtherVoiceStateUpdateOptions {
  channel_id: string | null;
  suppress?: boolean;
}

export class VoiceRouter {
  static readonly Routes = {
    voiceRegionsEndpoint: () => "/voice/regions",
    currentUserVoiceStateEndpoint: (guildId: string) =>
      `/guilds/${guildId}/voice-states/@me` as const,
    userVoiceStateEndpoint: (guildId: string, userId: string) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  fetchVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.#rest.get(VoiceRouter.Routes.voiceRegionsEndpoint());
  }
  fetchCurrentVoiceState(guildId: string): Promise<VoiceStateEntity> {
    return this.#rest.get(VoiceRouter.Routes.currentUserVoiceStateEndpoint(guildId));
  }
  fetchUserVoiceState(guildId: string, userId: string): Promise<VoiceStateEntity> {
    return this.#rest.get(VoiceRouter.Routes.userVoiceStateEndpoint(guildId, userId));
  }
  updateCurrentVoiceState(guildId: string, options: VoiceStateUpdateOptions): Promise<void> {
    return this.#rest.patch(VoiceRouter.Routes.currentUserVoiceStateEndpoint(guildId), {
      body: JSON.stringify(options),
    });
  }
  updateUserVoiceState(
    guildId: string,
    userId: string,
    options: OtherVoiceStateUpdateOptions,
  ): Promise<void> {
    return this.#rest.patch(VoiceRouter.Routes.userVoiceStateEndpoint(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}
