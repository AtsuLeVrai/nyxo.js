import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import { BaseRouter } from "../base/index.js";
import {
  type CreateGuildSoundboardSoundEntity,
  CreateGuildSoundboardSoundSchema,
  type ListGuildSoundboardSoundsResponse,
  type ModifyGuildSoundboardSoundEntity,
  type SendSoundboardSoundEntity,
  SendSoundboardSoundSchema,
} from "../schemas/index.js";

export class SoundboardRouter extends BaseRouter {
  static readonly ROUTES = {
    defaultSounds: "/soundboard-default-sounds",
    guildSounds: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/soundboard-sounds` => {
      return `/guilds/${guildId}/soundboard-sounds`;
    },
    guildSound: (
      guildId: Snowflake,
      soundId: Snowflake,
    ): `/guilds/${Snowflake}/soundboard-sounds/${Snowflake}` => {
      return `/guilds/${guildId}/soundboard-sounds/${soundId}`;
    },
    sendSound: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/send-soundboard-sound` => {
      return `/channels/${channelId}/send-soundboard-sound`;
    },
  } as const;

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSound(
    channelId: Snowflake,
    options: SendSoundboardSoundEntity,
  ): Promise<void> {
    const result = SendSoundboardSoundSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(SoundboardRouter.ROUTES.sendSound(channelId), {
      body: JSON.stringify(result.data),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.get(SoundboardRouter.ROUTES.defaultSounds);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSounds(
    guildId: Snowflake,
  ): Promise<ListGuildSoundboardSoundsResponse> {
    return this.get(SoundboardRouter.ROUTES.guildSounds(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.get(SoundboardRouter.ROUTES.guildSound(guildId, soundId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  createGuildSound(
    guildId: Snowflake,
    options: CreateGuildSoundboardSoundEntity,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const result = CreateGuildSoundboardSoundSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.post(SoundboardRouter.ROUTES.guildSounds(guildId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  modifyGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: ModifyGuildSoundboardSoundEntity,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const result = CreateGuildSoundboardSoundSchema.safeParse(options);
    if (!result.success) {
      throw new Error(
        result.error.errors
          .map((e) => `[${e.path.join(".")}] ${e.message}`)
          .join(", "),
      );
    }

    return this.patch(SoundboardRouter.ROUTES.guildSound(guildId, soundId), {
      body: JSON.stringify(result.data),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   */
  deleteGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.delete(SoundboardRouter.ROUTES.guildSound(guildId, soundId), {
      reason,
    });
  }
}
