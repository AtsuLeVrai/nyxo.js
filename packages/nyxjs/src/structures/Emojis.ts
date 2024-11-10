import type { EmojiStructure, Snowflake, UserStructure } from "@nyxjs/core";
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface EmojiSchema {
    readonly animated: boolean;
    readonly available: boolean;
    readonly id: Snowflake | null;
    readonly managed: boolean;
    readonly name: string | null;
    readonly requireColons: boolean;
    readonly roles: Snowflake[];
    readonly user: User | null;
}

export class Emoji extends Base<EmojiStructure, EmojiSchema> {
    #animated = false;
    #available = true;
    #id: Snowflake | null = null;
    #managed = false;
    #name: string | null = null;
    #requireColons = false;
    #roles: Snowflake[] = [];
    #user: User | null = null;

    constructor(data: Partial<EmojiStructure>) {
        super();
        this.patch(data);
    }

    get animated(): boolean {
        return this.#animated;
    }

    get available(): boolean {
        return this.#available;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get managed(): boolean {
        return this.#managed;
    }

    get name(): string | null {
        return this.#name;
    }

    get requireColons(): boolean {
        return this.#requireColons;
    }

    get roles(): Snowflake[] {
        return [...this.#roles];
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<EmojiStructure>): Emoji {
        return new Emoji(data);
    }

    patch(data: Partial<EmojiStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#animated = Boolean(data.animated ?? this.#animated);
        this.#available = Boolean(data.available ?? this.#available);
        this.#id = data.id ?? this.#id;
        this.#managed = Boolean(data.managed ?? this.#managed);
        this.#name = data.name ?? this.#name;
        this.#requireColons = Boolean(data.require_colons ?? this.#requireColons);

        if (Array.isArray(data.roles)) {
            this.#roles = [...data.roles];
        }

        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<EmojiStructure> {
        return {
            animated: this.#animated,
            available: this.#available,
            id: this.#id ?? undefined,
            managed: this.#managed,
            name: this.#name ?? undefined,
            require_colons: this.#requireColons,
            roles: [...this.#roles],
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): EmojiSchema {
        return {
            animated: this.#animated,
            available: this.#available,
            id: this.#id,
            managed: this.#managed,
            name: this.#name,
            requireColons: this.#requireColons,
            roles: [...this.#roles],
            user: this.#user,
        };
    }

    clone(): Emoji {
        return new Emoji(this.toJson());
    }

    reset(): void {
        this.#animated = false;
        this.#available = true;
        this.#id = null;
        this.#managed = false;
        this.#name = null;
        this.#requireColons = false;
        this.#roles = [];
        this.#user = null;
    }

    equals(other: Partial<Emoji>): boolean {
        return Boolean(
            this.#animated === other.animated &&
                this.#available === other.available &&
                this.#id === other.id &&
                this.#managed === other.managed &&
                this.#name === other.name &&
                this.#requireColons === other.requireColons &&
                JSON.stringify(this.#roles) === JSON.stringify(other.roles) &&
                this.#user?.equals(other.user ?? this.#user),
        );
    }
}
