import type { Float, Snowflake, SoundboardSoundStructure } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";
import { User } from "./Users";

export class SoundboardSound extends BaseStructure<SoundboardSoundStructure> {
    public available: boolean;

    public emojiId: Snowflake | null;

    public emojiName: string | null;

    public guildId?: Snowflake;

    public name: string;

    public soundId: Snowflake;

    public user?: User;

    public volume: Float;

    public constructor(data: Partial<SoundboardSoundStructure> = {}) {
        super();
        this.available = data.available!;
        this.emojiId = data.emoji_id!;
        this.emojiName = data.emoji_name!;
        this.guildId = data.guild_id;
        this.name = data.name!;
        this.soundId = data.sound_id!;
        this.user = User.from(data.user);
        this.volume = data.volume!;
    }

    public toJSON(): SoundboardSoundStructure {
        return {
            available: this.available,
            emoji_id: this.emojiId,
            emoji_name: this.emojiName,
            guild_id: this.guildId,
            name: this.name,
            sound_id: this.soundId,
            user: this.user?.toJSON(),
            volume: this.volume,
        };
    }
}
