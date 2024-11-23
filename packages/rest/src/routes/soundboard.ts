import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import type { ImageData } from "../types/index.js";

interface SoundboardSend {
  sound_id: Snowflake;
  source_guild_id?: Snowflake;
}

interface SoundboardCreate {
  name: string;
  sound: ImageData;
  volume?: number;
  emoji_id?: Snowflake;
  emoji_name?: string;
}

interface SoundboardModify {
  name?: string;
  volume?: number;
  emoji_id?: Snowflake;
  emoji_name?: string;
}

export class SoundboardRoutes {
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

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound}
   */
  sendSound(channelId: Snowflake, options: SoundboardSend): Promise<void> {
    return this.#rest.post(SoundboardRoutes.routes.sendSound(channelId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-default-soundboard-sounds}
   */
  listDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.#rest.get(SoundboardRoutes.routes.defaultSounds);
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#list-guild-soundboard-sounds}
   */
  listGuildSounds(
    guildId: Snowflake,
  ): Promise<{ items: SoundboardSoundEntity[] }> {
    return this.#rest.get(SoundboardRoutes.routes.guildSounds(guildId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#get-guild-soundboard-sound}
   */
  getGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
  ): Promise<SoundboardSoundEntity> {
    return this.#rest.get(SoundboardRoutes.routes.guildSound(guildId, soundId));
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound}
   */
  createGuildSound(
    guildId: Snowflake,
    options: SoundboardCreate,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.#rest.post(SoundboardRoutes.routes.guildSounds(guildId), {
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
    return this.#rest.patch(
      SoundboardRoutes.routes.guildSound(guildId, soundId),
      {
        body: JSON.stringify(options),
        reason,
      },
    );
  }

  /**
   * @see {@link https://discord.com/developers/docs/resources/soundboard#delete-guild-soundboard-sound}
   */
  deleteGuildSound(
    guildId: Snowflake,
    soundId: Snowflake,
    reason?: string,
  ): Promise<void> {
    return this.#rest.delete(
      SoundboardRoutes.routes.guildSound(guildId, soundId),
      {
        reason,
      },
    );
  }
}
