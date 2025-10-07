import type { FileInput, SetNullable } from "../utils/index.js";
import type { UserObject } from "./user.js";

export interface SoundboardSoundObject {
  readonly name: string;

  readonly sound_id: string;

  readonly volume: number;

  readonly emoji_id: string | null;

  readonly emoji_name: string | null;

  readonly guild_id?: string;

  readonly available: boolean;

  readonly user?: UserObject;
}

export interface SoundboardSoundsObject extends Required<Pick<SoundboardSoundObject, "guild_id">> {
  readonly soundboard_sounds: SoundboardSoundObject[];
}

export type GuildSoundboardSoundDeleteObject = Required<
  Pick<SoundboardSoundObject, "guild_id" | "sound_id">
>;

export interface SendSoundboardSoundJSONParams extends Pick<SoundboardSoundObject, "sound_id"> {
  readonly source_guild_id?: string;
}

export interface CreateGuildSoundboardSoundFormParams
  extends Pick<SoundboardSoundObject, "name">,
    Partial<
      Pick<SoundboardSoundObject, "emoji_id" | "emoji_name"> &
        SetNullable<Pick<SoundboardSoundObject, "volume">>
    > {
  readonly sound: FileInput;
}

export type ModifyGuildSoundboardSoundJSONParams = Partial<
  Omit<CreateGuildSoundboardSoundFormParams, "sound">
>;
