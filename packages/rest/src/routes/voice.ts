import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state-json-params}
 */
export type ModifyCurrentVoiceStateOptions = Partial<
  Pick<
    VoiceStateEntity,
    "channel_id" | "suppress" | "request_to_speak_timestamp"
  >
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state-json-params}
 */
export type ModifyUserVoiceStateOptions = Pick<
  VoiceStateEntity,
  "channel_id" | "suppress"
>;

export class VoiceRouter extends Router {
  static readonly routes = {
    base: "/voice",
    regions: "/voice/regions",
    guildVoiceState: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/voice-states/@me` => {
      return `/guilds/${guildId}/voice-states/@me` as const;
    },
    userVoiceState: (
      guildId: Snowflake,
      userId: Snowflake,
    ): `/guilds/${Snowflake}/voice-states/${Snowflake}` => {
      return `/guilds/${guildId}/voice-states/${userId}` as const;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  getVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.get(VoiceRouter.routes.regions);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  getCurrentVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.get(VoiceRouter.routes.guildVoiceState(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   */
  getUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceStateEntity> {
    return this.get(VoiceRouter.routes.userVoiceState(guildId, userId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  async modifyCurrentVoiceState(
    guildId: Snowflake,
    options: ModifyCurrentVoiceStateOptions,
  ): Promise<void> {
    if (options.channel_id) {
      const currentState = await this.getCurrentVoiceState(guildId);

      if (currentState.channel_id !== options.channel_id) {
        throw new Error("User must already be in the specified channel");
      }
    }

    if (options.request_to_speak_timestamp) {
      const timestamp = new Date(options.request_to_speak_timestamp).getTime();
      const now = Date.now();
      if (timestamp < now) {
        throw new Error(
          "request_to_speak_timestamp must be a present or future time",
        );
      }
    }

    return this.patch(VoiceRouter.routes.guildVoiceState(guildId), {
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
      throw new Error("User must already be in the specified channel");
    }

    return this.patch(VoiceRouter.routes.userVoiceState(guildId, userId), {
      body: JSON.stringify(options),
    });
  }
}
