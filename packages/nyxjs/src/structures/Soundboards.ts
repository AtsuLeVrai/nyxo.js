import type { Float, Snowflake, SoundboardSoundStructure, UserStructure } from "@nyxjs/core";
import { User } from "./Users.js";

export class SoundboardSound {
    #available = true;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;
    #guildId: Snowflake | null = null;
    #name: string | null = null;
    #soundId: Snowflake | null = null;
    #user?: User;
    #volume: Float | null = null;

    constructor(data: Partial<SoundboardSoundStructure>) {
        this.patch(data);
    }

    get available() {
        return this.#available;
    }

    get emojiId() {
        return this.#emojiId;
    }

    get emojiName() {
        return this.#emojiName;
    }

    get guildId() {
        return this.#guildId;
    }

    get name() {
        return this.#name;
    }

    get soundId() {
        return this.#soundId;
    }

    get user() {
        return this.#user;
    }

    get volume() {
        return this.#volume;
    }

    patch(data: Partial<SoundboardSoundStructure>): void {
        if (!data) {
            return;
        }

        this.#available = data.available ?? this.#available;
        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#name = data.name ?? this.#name;
        this.#soundId = data.sound_id ?? this.#soundId;

        if (data.user) {
            this.#user = new User(data.user);
        }

        this.#volume = data.volume ?? this.#volume;
    }

    toJSON(): Partial<SoundboardSoundStructure> {
        return {
            available: this.#available,
            emoji_id: this.#emojiId,
            emoji_name: this.#emojiName,
            guild_id: this.#guildId ?? undefined,
            name: this.#name ?? undefined,
            sound_id: this.#soundId ?? undefined,
            user: this.#user?.toJSON() as UserStructure,
            volume: this.#volume ?? undefined,
        };
    }
}
