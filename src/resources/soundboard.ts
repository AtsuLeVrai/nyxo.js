import type { Snowflake } from "../common/index.js";
import type { UserObject } from "./user.js";

export interface SoundboardSoundObject {
  name: string;
  sound_id: Snowflake;
  volume: number;
  emoji_id: Snowflake | null;
  emoji_name: string | null;
  guild_id?: Snowflake;
  available: boolean;
  user?: UserObject;
}
