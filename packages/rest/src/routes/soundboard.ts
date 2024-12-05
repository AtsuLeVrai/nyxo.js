import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import type {
  SoundboardCreateEntity,
  SoundboardModifyEntity,
  SoundboardSendEntity,
} from "../types/index.js";
import { BaseRouter } from "./base.js";

export class SoundboardRouter extends BaseRouter {
  static readonly NAME_MIN_LENGTH = 2;
  static readonly NAME_MAX_LENGTH = 32;
  static readonly VOLUME_MIN = 0;
  static readonly VOLUME_MAX = 1;
  static readonly FILE_MAX_SIZE = 512 * 1024;
  static readonly MAX_DURATION = 5.2;

  static readonly routes = {
    defaultSounds: "/soundboard-default-sounds" as const,
    guildSounds: (
      guildId: Snowflake,
    ): `/guilds/${Snowflake}/soundboard-sounds` => {
      return `/guilds/${guildId}/soundboard-sounds` as const;
    },
    guildSound: (
      guildId: Snowflake,
      soundId: Snowflake,
    ): `/guilds/${Snowflake}/soundboard-sounds/${Snowflake}` => {
      return `/guilds/${guildId}/soundboard-sounds/${soundId}` as const;
    },
    sendSound: (
      channelId: Snowflake,
    ): `/channels/${Snowflake}/send-soundboard-sound` => {
      return `/channels/${channelId}/send-soundboard-sound` as const;
    },
  } as const;

  validateName(name: string): void {
    if (
      !name ||
      name.length < SoundboardRouter.NAME_MIN_LENGTH ||
      name.length > SoundboardRouter.NAME_MAX_LENGTH
    ) {
      throw new Error(
        `Name must be between ${SoundboardRouter.NAME_MIN_LENGTH} and ${SoundboardRouter.NAME_MAX_LENGTH} characters`,
      );
    }
  }

  validateVolume(volume?: number): void {
    if (
      volume !== undefined &&
      (volume < SoundboardRouter.VOLUME_MIN ||
        volume > SoundboardRouter.VOLUME_MAX)
    ) {
      throw new Error(
        `Volume must be between ${SoundboardRouter.VOLUME_MIN} and ${SoundboardRouter.VOLUME_MAX}`,
      );
    }
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSound(
    channelId: Snowflake,
    options: SoundboardSendEntity,
  ): Promise<void> {
    return this.post(SoundboardRouter.routes.sendSound(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.get(SoundboardRouter.routes.defaultSounds);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSounds(
    guildId: Snowflake,
  ): Promise<{ items: SoundboardSoundEntity[] }> {
    return this.get(SoundboardRouter.routes.guildSounds(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.get(SoundboardRouter.routes.guildSound(guildId, soundId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  createGuildSound(
    guildId: Snowflake,
    options: SoundboardCreateEntity,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    this.validateName(options.name);
    this.validateVolume(options.volume);

    return this.post(SoundboardRouter.routes.guildSounds(guildId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound}
   */
  modifyGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
    options: SoundboardModifyEntity,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    if (options.name) {
      this.validateName(options.name);
    }
    if (options.volume) {
      this.validateVolume(options.volume);
    }

    return this.patch(SoundboardRouter.routes.guildSound(guildId, soundId), {
      body: JSON.stringify(options),
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
    return this.delete(SoundboardRouter.routes.guildSound(guildId, soundId), {
      reason,
    });
  }
}
