import { BaseRouter } from "../../bases/index.js";
import type { FileInput, RouteBuilder } from "../../core/index.js";
import type { Nullable } from "../../utils/index.js";
import type { SoundboardSoundEntity } from "./soundboard.entity.js";

export interface RESTSendSoundboardSoundJSONParams extends Pick<SoundboardSoundEntity, "sound_id"> {
  source_guild_id?: string;
}

export interface RESTCreateGuildSoundboardSoundJSONParams
  extends Pick<SoundboardSoundEntity, "name">,
    Partial<Nullable<Pick<SoundboardSoundEntity, "volume" | "emoji_id" | "emoji_name">>> {
  sound: FileInput;
}

export type RESTModifyGuildSoundboardSoundJSONParams = Omit<
  RESTCreateGuildSoundboardSoundJSONParams,
  "sound"
>;

export const SoundboardRoutes = {
  sendSoundboardSound: (channelId: string) =>
    `/channels/${channelId}/send-soundboard-sound` as const,
  listDefaultSoundboardSounds: () => "/soundboard-default-sounds",
  listGuildSoundboardSounds: (guildId: string) => `/guilds/${guildId}/soundboard-sounds` as const,
  getGuildSoundboardSound: (guildId: string, soundId: string) =>
    `/guilds/${guildId}/soundboard-sounds/${soundId}` as const,
} as const satisfies RouteBuilder;

export class SoundboardRouter extends BaseRouter {
  sendSoundboardSound(
    channelId: string,
    options: RESTSendSoundboardSoundJSONParams,
  ): Promise<void> {
    return this.rest.post(SoundboardRoutes.sendSoundboardSound(channelId), {
      body: JSON.stringify(options),
    });
  }

  listDefaultSoundboardSounds(): Promise<SoundboardSoundEntity[]> {
    return this.rest.get(SoundboardRoutes.listDefaultSoundboardSounds());
  }

  listGuildSoundboardSounds(guildId: string): Promise<{
    items: SoundboardSoundEntity[];
  }> {
    return this.rest.get(SoundboardRoutes.listGuildSoundboardSounds(guildId));
  }

  getGuildSoundboardSound(guildId: string, soundId: string): Promise<SoundboardSoundEntity> {
    return this.rest.get(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId));
  }

  async createGuildSoundboardSound(
    guildId: string,
    options: RESTCreateGuildSoundboardSoundJSONParams,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    const processedOptions = await this.processFileOptions(options, ["sound"]);
    return this.rest.post(SoundboardRoutes.listGuildSoundboardSounds(guildId), {
      body: JSON.stringify(processedOptions),
      reason,
    });
  }

  modifyGuildSoundboardSound(
    guildId: string,
    soundId: string,
    options: RESTModifyGuildSoundboardSoundJSONParams,
    reason?: string,
  ): Promise<SoundboardSoundEntity> {
    return this.rest.patch(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId), {
      body: JSON.stringify(options),
      reason,
    });
  }

  deleteGuildSoundboardSound(guildId: string, soundId: string, reason?: string): Promise<void> {
    return this.rest.delete(SoundboardRoutes.getGuildSoundboardSound(guildId, soundId), {
      reason,
    });
  }
}
