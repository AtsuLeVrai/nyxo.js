import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { SoundboardSoundEntity } from "./soundboard.entity.js";

export class SoundboardSound
  extends BaseClass<SoundboardSoundEntity>
  implements CamelCaseKeys<SoundboardSoundEntity>
{
  readonly name = this.rawData.name;
  readonly soundId = this.rawData.sound_id;
  readonly volume = this.rawData.volume;
  readonly emojiId = this.rawData.emoji_id;
  readonly emojiName = this.rawData.emoji_name;
  readonly guildId = this.rawData.guild_id;
  readonly available = this.rawData.available;
  readonly user = this.rawData.user;
}
