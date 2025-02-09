import type {
  Snowflake,
  VoiceRegionEntity,
  VoiceStateEntity,
} from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  ModifyCurrentUserVoiceStateSchema,
  ModifyUserVoiceStateSchema,
} from "../schemas/index.js";

export class VoiceRouter extends BaseRouter {
  static readonly ROUTES = {
    voiceRegionsBase: "/voice/regions" as const,
    guildCurrentUserVoiceState: (guildId: Snowflake) =>
      `/guilds/${guildId}/voice-states/@me` as const,
    guildUserVoiceState: (guildId: Snowflake, userId: Snowflake) =>
      `/guilds/${guildId}/voice-states/${userId}` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#list-voice-regions}
   */
  listVoiceRegions(): Promise<VoiceRegionEntity[]> {
    return this.rest.get(VoiceRouter.ROUTES.voiceRegionsBase);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-current-user-voice-state}
   */
  getCurrentUserVoiceState(guildId: Snowflake): Promise<VoiceStateEntity> {
    return this.rest.get(
      VoiceRouter.ROUTES.guildCurrentUserVoiceState(guildId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#get-user-voice-state}
   */
  getUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
  ): Promise<VoiceStateEntity> {
    return this.rest.get(
      VoiceRouter.ROUTES.guildUserVoiceState(guildId, userId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-current-user-voice-state}
   */
  modifyCurrentUserVoiceState(
    guildId: Snowflake,
    options: ModifyCurrentUserVoiceStateSchema,
  ): Promise<void> {
    const result = ModifyCurrentUserVoiceStateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      VoiceRouter.ROUTES.guildCurrentUserVoiceState(guildId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/voice#modify-user-voice-state}
   */
  modifyUserVoiceState(
    guildId: Snowflake,
    userId: Snowflake,
    options: ModifyUserVoiceStateSchema,
  ): Promise<void> {
    const result = ModifyUserVoiceStateSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      VoiceRouter.ROUTES.guildUserVoiceState(guildId, userId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }
}
