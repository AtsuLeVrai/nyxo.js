import type { UserEntity } from "../user/index.js";

export interface SoundboardSoundEntity {
  name: string;
  sound_id: string;
  volume: number;
  emoji_id: string | null;
  emoji_name: string | null;
  guild_id?: string;
  available: boolean;
  user?: UserEntity;
}

export interface GatewaySoundboardSoundsEntity
  extends Required<Pick<SoundboardSoundEntity, "guild_id">> {
  soundboard_sounds: SoundboardSoundEntity[];
}

export type GatewayGuildSoundboardSoundDeleteEntity = Required<
  Pick<SoundboardSoundEntity, "guild_id" | "sound_id">
>;
