import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { BaseRouter } from "./base.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export interface ModifyCurrentUserVoiceStateOptions {
  channel_id?: Snowflake;
  suppress?: boolean;
  request_to_speak_timestamp?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export interface ModifyUserVoiceStateOptions {
  channel_id: Snowflake;
  suppress?: boolean;
}

export interface VoiceRoutes {
  readonly voiceRegions: "/voice/regions";
  readonly currentUserVoiceState: (
    guildId: Snowflake,
  ) => `/guilds/${Snowflake}/voice-states/@me`;
  readonly userVoiceState: (
    guildId: Snowflake,
    userId: Snowflake,
  ) => `/guilds/${Snowflake}/voice-states/${Snowflake}`;
}

export class VoiceRouter extends BaseRouter {
  static readonly ROUTES: VoiceRoutes = {
    voiceRegions: "/voice/regions",
    currentUserVoiceState: (guildId) =>
      `/guilds/${guildId}/voice-states/@me` as const,
    userVoiceState: (guildId, userId) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.get(VoiceRouter.ROUTES.voiceRegions);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  getCurrentUserVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.get(VoiceRouter.ROUTES.currentUserVoiceState(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   */
  getUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceStateEntity> {
    return this.get(VoiceRouter.ROUTES.userVoiceState(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  async modifyCurrentUserVoiceState(
    guildId: Snowflake,
    options: ModifyCurrentUserVoiceStateOptions,
  ): Promise<void> {
    if (options.channel_id) {
      const currentState = await this.getCurrentUserVoiceState(guildId);
      if (currentState.channel_id !== options.channel_id) {
        throw new Error("User must already be in the specified stage channel");
      }
    }

    if (options.request_to_speak_timestamp) {
      const timestamp = new Date(options.request_to_speak_timestamp).getTime();
      if (timestamp < Date.now()) {
        throw new Error(
          "request_to_speak_timestamp must be a present or future time",
        );
      }
    }

    return this.patch(VoiceRouter.ROUTES.currentUserVoiceState(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   */
  async modifyUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyUserVoiceStateOptions,
  ): Promise<void> {
    const currentState = await this.getUserVoiceState(guildId, userId);
    if (currentState.channel_id !== options.channel_id) {
      throw new Error("User must already be in the specified stage channel");
    }

    return this.patch(VoiceRouter.ROUTES.userVoiceState(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}
