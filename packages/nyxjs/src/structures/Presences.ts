import type { GuildMemberStructure, Integer, Snowflake } from "@nyxjs/core";
import type { TypingStartEventFields } from "@nyxjs/gateway";
import { Base } from "./Base.js";

export interface TypingStartSchema {
    readonly channelId: Snowflake | null;
    readonly guildId: Snowflake | null;
    readonly member: GuildMemberStructure | null;
    readonly timestamp: Integer | null;
    readonly userId: Snowflake | null;
}

export class TypingStart extends Base<TypingStartEventFields, TypingStartSchema> implements TypingStartSchema {
    #channelId: Snowflake | null = null;
    #guildId: Snowflake | null = null;
    #member: GuildMemberStructure | null = null;
    #timestamp: Integer | null = null;
    #userId: Snowflake | null = null;

    constructor(data: Partial<TypingStartEventFields>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get member(): GuildMemberStructure | null {
        return this.#member;
    }

    get timestamp(): Integer | null {
        return this.#timestamp;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    static from(data: Partial<TypingStartEventFields>): TypingStart {
        return new TypingStart(data);
    }

    patch(data: Partial<TypingStartEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#member = data.member ?? this.#member;
        this.#timestamp = data.timestamp ?? this.#timestamp;
        this.#userId = data.user_id ?? this.#userId;
    }

    toJson(): Partial<TypingStartEventFields> {
        return {
            channel_id: this.#channelId ?? undefined,
            guild_id: this.#guildId ?? undefined,
            member: this.#member ?? undefined,
            timestamp: this.#timestamp ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): TypingStartSchema {
        return {
            channelId: this.#channelId,
            guildId: this.#guildId,
            member: this.#member,
            timestamp: this.#timestamp,
            userId: this.#userId,
        };
    }

    clone(): TypingStart {
        return new TypingStart(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#guildId = null;
        this.#member = null;
        this.#timestamp = null;
        this.#userId = null;
    }

    equals(other: Partial<TypingStart>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#guildId === other.guildId &&
                JSON.stringify(this.#member) === JSON.stringify(other.member) &&
                this.#timestamp === other.timestamp &&
                this.#userId === other.userId,
        );
    }
}
