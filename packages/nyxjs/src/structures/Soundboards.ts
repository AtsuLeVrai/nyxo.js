import type { Float, Snowflake, SoundboardSoundStructure, UserStructure } from "@nyxjs/core";
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface SoundboardSoundSchema {
    readonly available: boolean;
    readonly emojiId: Snowflake | null;
    readonly emojiName: string | null;
    readonly guildId: Snowflake | null;
    readonly name: string | null;
    readonly soundId: Snowflake | null;
    readonly user?: User;
    readonly volume: Float | null;
}

export class SoundboardSound extends Base<SoundboardSoundStructure, SoundboardSoundSchema> {
    #available = true;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;
    #guildId: Snowflake | null = null;
    #name: string | null = null;
    #soundId: Snowflake | null = null;
    #user?: User;
    #volume: Float | null = null;

    constructor(data: Partial<SoundboardSoundStructure>) {
        super();
        this.patch(data);
    }

    get available(): boolean {
        return this.#available;
    }

    get emojiId(): Snowflake | null {
        return this.#emojiId;
    }

    get emojiName(): string | null {
        return this.#emojiName;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get name(): string | null {
        return this.#name;
    }

    get soundId(): Snowflake | null {
        return this.#soundId;
    }

    get user(): User | undefined {
        return this.#user;
    }

    get volume(): Float | null {
        return this.#volume;
    }

    static from(data: Partial<SoundboardSoundStructure>): SoundboardSound {
        return new SoundboardSound(data);
    }

    patch(data: Partial<SoundboardSoundStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#available = Boolean(data.available ?? this.#available);
        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#name = data.name ?? this.#name;
        this.#soundId = data.sound_id ?? this.#soundId;
        this.#user = data.user ? User.from(data.user) : this.#user;
        this.#volume = data.volume ?? this.#volume;
    }

    toJson(): Partial<SoundboardSoundStructure> {
        return {
            available: this.#available,
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
            guild_id: this.#guildId ?? undefined,
            name: this.#name ?? undefined,
            sound_id: this.#soundId ?? undefined,
            user: this.#user?.toJson() as UserStructure,
            volume: this.#volume ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): SoundboardSoundSchema {
        return {
            available: this.#available,
            emojiId: this.#emojiId,
            emojiName: this.#emojiName,
            guildId: this.#guildId,
            name: this.#name,
            soundId: this.#soundId,
            user: this.#user,
            volume: this.#volume,
        };
    }

    clone(): SoundboardSound {
        return new SoundboardSound(this.toJson());
    }

    reset(): void {
        this.#available = true;
        this.#emojiId = null;
        this.#emojiName = null;
        this.#guildId = null;
        this.#name = null;
        this.#soundId = null;
        this.#user = undefined;
        this.#volume = null;
    }

    equals(other: Partial<SoundboardSound>): boolean {
        return Boolean(
            this.#available === other.available &&
                this.#emojiId === other.emojiId &&
                this.#emojiName === other.emojiName &&
                this.#guildId === other.guildId &&
                this.#name === other.name &&
                this.#soundId === other.soundId &&
                this.#user?.equals(other.user ?? this.#user) &&
                this.#volume === other.volume,
        );
    }
}
