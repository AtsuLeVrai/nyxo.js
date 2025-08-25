import type { FileInput, Rest } from "../../core/index.js";
import type { SoundboardSoundEntity } from "./soundboard.entity.js";

export interface SoundboardSendOptions {
  sound_id: string;
  source_guild_id?: string;
}

export interface GuildSoundsResponse {
  items: SoundboardSoundEntity[];
}

export interface GuildSoundCreateOptions {
  name: string;
  sound: FileInput;
  volume?: number | null;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

export interface GuildSoundUpdateOptions {
  name?: string;
  volume?: number | null;
  emoji_id?: string | null;
  emoji_name?: string | null;
}

export class SoundboardRouter {
  static readonly Routes = {
    defaultSoundsEndpoint: () => "/soundboard-default-sounds",
    guildSoundsEndpoint: (guildId: string) => `/guilds/${guildId}/soundboard-sounds` as const,
    guildSoundByIdEndpoint: (guildId: string, soundId: string) =>
      `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,
    playSoundInChannelEndpoint: (channelId: string) =>
      `/channels/${channelId}/send-soundboard-sound` as const,
  } as const satisfies Record<string, (...args: any[]) => string>;
  readonly #rest: Rest;
  constructor(rest: Rest) {
    this.#rest = rest;
  }
  sendSound(channelId: string, options: SoundboardSendOptions): Promise<void> {
    return this.#rest.post(SoundboardRouter.Routes.playSoundInChannelEndpoint(channelId), {
      body: JSON.stringify(options),
    });
  }
  fetchDefaultSounds(): Promise<SoundboardSoundEntity[]> {
    return this.#rest.get(SoundboardRouter.Routes.defaultSoundsEndpoint());
  }
  fetchSounds(guildId: string): Promise<GuildSoundsResponse> {
    return this.#rest.get(SoundboardRouter.Routes.guildSoundsEndpoint(guildId));
  }
  fetchGuildSound(guildId: string, soundId: string): Promise<SoundboardSoundEntity> {
    return this.#rest.get(SoundboardRouter.Routes.guildSoundByIdEndpoint(guildId, soundId));
  }
  async createSound(
    guildId: string,
    options: GuildSoundCreateOptions,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const processedOptions = { ...options };
    if (processedOptions.sound) {
      processedOptions.sound = await this.#rest.toDataUri(processedOptions.sound);
    }
    return this.#rest.post(SoundboardRouter.Routes.guildSoundsEndpoint(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }
  updateSound(
    guildId: string,
    soundId: string,
    options: GuildSoundUpdateOptions,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.#rest.patch(SoundboardRouter.Routes.guildSoundByIdEndpoint(guildId, soundId), {
      body: JSON.stringify(options),
      reason,
    });
  }
  deleteSound(guildId: string, soundId: string, reason?: string): Promise<void> {
    return this.#rest.delete(SoundboardRouter.Routes.guildSoundByIdEndpoint(guildId, soundId), {
      reason,
    });
  }
}
