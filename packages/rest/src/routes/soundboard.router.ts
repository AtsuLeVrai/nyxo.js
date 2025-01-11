import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../rest.js";
import {
  CreateGuildSoundboardSoundEntity,
  type ListGuildSoundboardSoundsResponseEntity,
  ModifyGuildSoundboardSoundEntity,
  SendSoundboardSoundEntity,
} from "../schemas/index.js";
import type { HttpResponse } from "../types/index.js";

export class SoundboardRouter {
  static readonly ROUTES = {
    defaultSounds: "/soundboard-default-sounds" as const,
    guildSounds: (guildId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds` as const,
    guildSound: (guildId: Snowflake, soundId: Snowflake) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,
    sendSound: (channelId: Snowflake) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const;

  #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSoundboardSound(
    channelId: Snowflake,
    options: SendSoundboardSoundEntity,
  ): Promise<HttpResponse<void>> {
    const result = SendSoundboardSoundEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(SoundboardRouter.ROUTES.sendSound(channelId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSoundboardSounds(): Promise<
    HttpResponse<SoundboardSoundEntity[]>
  > {
    return this.#rest.get(SoundboardRouter.ROUTES.defaultSounds);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSoundboardSounds(
    guildId: Snowflake,
  ): Promise<HttpResponse<ListGuildSoundboardSoundsResponseEntity>> {
    return this.#rest.get(SoundboardRouter.ROUTES.guildSounds(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<HttpResponse<SoundboardSoundEntity>> {
    return this.#rest.get(SoundboardRouter.ROUTES.guildSound(guildId, soundId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  createGuildSoundboardSound(
    guildId: Snowflake,
    options: CreateGuildSoundboardSoundEntity,
    reason?: string,
  ): Promise<HttpResponse<SoundboardSoundEntity>> {
    const result = CreateGuildSoundboardSoundEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.post(SoundboardRouter.ROUTES.guildSounds(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  modifyGuildSoundboardSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: ModifyGuildSoundboardSoundEntity,
    reason?: string,
  ): Promise<HttpResponse<SoundboardSoundEntity>> {
    const result = ModifyGuildSoundboardSoundEntity.safeParse(options);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      throw new Error(validationError.message);
    }

    return this.#rest.patch(
      SoundboardRouter.ROUTES.guildSound(guildId, soundId),
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
  ): Promise<HttpResponse<void>> {
    return this.#rest.delete(
      SoundboardRouter.ROUTES.guildSound(guildId, soundId),
      {
        reason,
      },
    );
  }
}
