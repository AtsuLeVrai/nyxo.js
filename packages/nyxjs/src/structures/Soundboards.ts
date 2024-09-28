import type { Float, Snowflake, SoundboardSoundStructure } from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class SoundboardSound extends Base<SoundboardSoundStructure> {
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
}
