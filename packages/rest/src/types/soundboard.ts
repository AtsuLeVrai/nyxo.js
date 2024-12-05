import type { Snowflake, SoundboardSoundEntity } from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#send-soundboard-sound-json-params}
 */
export interface SoundboardSendEntity
  extends Pick<SoundboardSoundEntity, "sound_id"> {
  source_guild_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#create-guild-soundboard-sound-json-params}
 */
export interface SoundboardCreateEntity
  extends Pick<
    SoundboardSoundEntity,
    "name" | "volume" | "emoji_id" | "emoji_name"
  > {
  sound: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/soundboard#modify-guild-soundboard-sound-json-params}
 */
export type SoundboardModifyEntity = Partial<
  Pick<SoundboardSoundEntity, "name" | "volume" | "emoji_id" | "emoji_name">
>;
