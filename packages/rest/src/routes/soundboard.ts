import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import type { ImageData } from "../types/index.js";
import { Router } from "./router.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export interface SoundboardSend
  extends Pick<SoundboardSoundEntity, "sound_id"> {
  source_guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export interface SoundboardCreate
  extends Pick<
    SoundboardSoundEntity,
    "name" | "volume" | "emoji_id" | "emoji_name"
  > {
  sound: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export type SoundboardModify = Partial<
  Pick<SoundboardSoundEntity, "name" | "volume" | "emoji_id" | "emoji_name">
>;

export class SoundboardRouter extends Router {
  static routes = {
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

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSound(channelId: Snowflake, options: SoundboardSend): Promise<void> {
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
    options: SoundboardCreate,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
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
    options: SoundboardModify,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
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
