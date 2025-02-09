import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import { BaseRouter } from "../base/index.js";
import {
  CreateGuildSoundboardSoundSchema,
  type ListGuildSoundboardSoundsResponseEntity,
  ModifyGuildSoundboardSoundSchema,
  SendSoundboardSoundSchema,
} from "../schemas/index.js";

export class SoundboardRouter extends BaseRouter {
  static readonly ROUTES = {
    soundboardDefaultSounds: "/soundboard-default-sounds" as const,
    guildSoundboardSounds: (guildId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds` as const,
    guildSoundboardSound: (guildId: Snowflake, soundId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,
    channelSendSoundboardSound: (channelId: Snowflake) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSoundboardSound(
    channelId: Snowflake,
    options: SendSoundboardSoundSchema,
  ): Promise<void> {
    const result = SendSoundboardSoundSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      SoundboardRouter.ROUTES.channelSendSoundboardSound(channelId),
      {
        body: JSON.stringify(result.data),
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSoundboardSounds(): Promise<SoundboardSoundEntity[]> {
    return this.rest.get(SoundboardRouter.ROUTES.soundboardDefaultSounds);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSoundboardSounds(
    guildId: Snowflake,
  ): Promise<ListGuildSoundboardSoundsResponseEntity> {
    return this.rest.get(
      SoundboardRouter.ROUTES.guildSoundboardSounds(guildId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.rest.get(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  async createGuildSoundboardSound(
    guildId: Snowflake,
    options: CreateGuildSoundboardSoundSchema,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const result =
      await CreateGuildSoundboardSoundSchema.safeParseAsync(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.post(
      SoundboardRouter.ROUTES.guildSoundboardSounds(guildId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  modifyGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: ModifyGuildSoundboardSoundSchema,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const result = ModifyGuildSoundboardSoundSchema.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.rest.patch(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
      {
        body: JSON.stringify(result.data),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   */
  deleteGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.rest.delete(
      SoundboardRouter.ROUTES.guildSoundboardSound(guildId, soundId),
      {
        reason,
      },
    );
  }
}
