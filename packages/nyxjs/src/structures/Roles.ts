import type { BitfieldResolvable, Integer, RoleFlags, RoleStructure, RoleTagsStructure, Snowflake } from "@nyxjs/core";
import { Base } from "./Base.js";

export interface RoleTagsSchema {
    readonly availableForPurchase: null;
    readonly botId: Snowflake | null;
    readonly guildConnections: null;
    readonly integrationId: Snowflake | null;
    readonly premiumSubscriber: null;
    readonly subscriptionListingId: Snowflake | null;
}

export class RoleTags extends Base<RoleTagsStructure, RoleTagsSchema> implements RoleTagsSchema {
    #availableForPurchase: null = null;
    #botId: Snowflake | null = null;
    #guildConnections: null = null;
    #integrationId: Snowflake | null = null;
    #premiumSubscriber: null = null;
    #subscriptionListingId: Snowflake | null = null;

    constructor(data: Partial<RoleTagsStructure>) {
        super();
        this.patch(data);
    }

    get availableForPurchase(): null {
        return this.#availableForPurchase;
    }

    get botId(): Snowflake | null {
        return this.#botId;
    }

    get guildConnections(): null {
        return this.#guildConnections;
    }

    get integrationId(): Snowflake | null {
        return this.#integrationId;
    }

    get premiumSubscriber(): null {
        return this.#premiumSubscriber;
    }

    get subscriptionListingId(): Snowflake | null {
        return this.#subscriptionListingId;
    }

    static from(data: Partial<RoleTagsStructure>): RoleTags {
        return new RoleTags(data);
    }

    patch(data: Partial<RoleTagsStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#availableForPurchase = data.available_for_purchase ?? this.#availableForPurchase;
        this.#botId = data.bot_id ?? this.#botId;
        this.#guildConnections = data.guild_connections ?? this.#guildConnections;
        this.#integrationId = data.integration_id ?? this.#integrationId;
        this.#premiumSubscriber = data.premium_subscriber ?? this.#premiumSubscriber;
        this.#subscriptionListingId = data.subscription_listing_id ?? this.#subscriptionListingId;
    }

    toJson(): Partial<RoleTagsStructure> {
        return {
            available_for_purchase: this.#availableForPurchase,
            bot_id: this.#botId ?? undefined,
            guild_connections: this.#guildConnections,
            integration_id: this.#integrationId ?? undefined,
            premium_subscriber: this.#premiumSubscriber,
            subscription_listing_id: this.#subscriptionListingId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): RoleTagsSchema {
        return {
            availableForPurchase: this.#availableForPurchase,
            botId: this.#botId,
            guildConnections: this.#guildConnections,
            integrationId: this.#integrationId,
            premiumSubscriber: this.#premiumSubscriber,
            subscriptionListingId: this.#subscriptionListingId,
        };
    }

    clone(): RoleTags {
        return new RoleTags(this.toJson());
    }

    reset(): void {
        this.#availableForPurchase = null;
        this.#botId = null;
        this.#guildConnections = null;
        this.#integrationId = null;
        this.#premiumSubscriber = null;
        this.#subscriptionListingId = null;
    }

    equals(other: Partial<RoleTags>): boolean {
        return Boolean(
            this.#availableForPurchase === other.availableForPurchase &&
                this.#botId === other.botId &&
                this.#guildConnections === other.guildConnections &&
                this.#integrationId === other.integrationId &&
                this.#premiumSubscriber === other.premiumSubscriber &&
                this.#subscriptionListingId === other.subscriptionListingId,
        );
    }
}

export interface RoleSchema {
    readonly color: Integer | null;
    readonly flags: BitfieldResolvable<RoleFlags>;
    readonly hoist: boolean;
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly managed: boolean;
    readonly mentionable: boolean;
    readonly name: string | null;
    readonly permissions: string | null;
    readonly position: Integer | null;
    readonly tags: RoleTags | null;
    readonly unicodeEmoji: string | null;
}

export class Role extends Base<RoleStructure, RoleSchema> implements RoleSchema {
    #color: Integer | null = null;
    #flags: BitfieldResolvable<RoleFlags> = 0n;
    #hoist = false;
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #managed = false;
    #mentionable = false;
    #name: string | null = null;
    #permissions: string | null = null;
    #position: Integer | null = null;
    #tags: RoleTags | null = null;
    #unicodeEmoji: string | null = null;

    constructor(data: Partial<RoleStructure>) {
        super();
        this.patch(data);
    }

    get color(): Integer | null {
        return this.#color;
    }

    get flags(): BitfieldResolvable<RoleFlags> {
        return this.#flags;
    }

    get hoist(): boolean {
        return this.#hoist;
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get managed(): boolean {
        return this.#managed;
    }

    get mentionable(): boolean {
        return this.#mentionable;
    }

    get name(): string | null {
        return this.#name;
    }

    get permissions(): string | null {
        return this.#permissions;
    }

    get position(): Integer | null {
        return this.#position;
    }

    get tags(): RoleTags | null {
        return this.#tags;
    }

    get unicodeEmoji(): string | null {
        return this.#unicodeEmoji;
    }

    static from(data: Partial<RoleStructure>): Role {
        return new Role(data);
    }

    patch(data: Partial<RoleStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#color = data.color ?? this.#color;
        this.#flags = data.flags ?? this.#flags;
        this.#hoist = Boolean(data.hoist ?? this.#hoist);
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#managed = Boolean(data.managed ?? this.#managed);
        this.#mentionable = Boolean(data.mentionable ?? this.#mentionable);
        this.#name = data.name ?? this.#name;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#position = data.position ?? this.#position;
        this.#tags = data.tags ? RoleTags.from(data.tags) : this.#tags;
        this.#unicodeEmoji = data.unicode_emoji ?? this.#unicodeEmoji;
    }

    toJson(): Partial<RoleStructure> {
        return {
            color: this.#color ?? undefined,
            flags: this.#flags,
            hoist: this.#hoist,
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            managed: this.#managed,
            mentionable: this.#mentionable,
            name: this.#name ?? undefined,
            permissions: this.#permissions ?? undefined,
            position: this.#position ?? undefined,
            tags: this.#tags?.toJson(),
            unicode_emoji: this.#unicodeEmoji ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): RoleSchema {
        return {
            color: this.#color,
            flags: this.#flags,
            hoist: this.#hoist,
            icon: this.#icon,
            id: this.#id,
            managed: this.#managed,
            mentionable: this.#mentionable,
            name: this.#name,
            permissions: this.#permissions,
            position: this.#position,
            tags: this.#tags,
            unicodeEmoji: this.#unicodeEmoji,
        };
    }

    clone(): Role {
        return new Role(this.toJson());
    }

    reset(): void {
        this.#color = null;
        this.#flags = 0n;
        this.#hoist = false;
        this.#icon = null;
        this.#id = null;
        this.#managed = false;
        this.#mentionable = false;
        this.#name = null;
        this.#permissions = null;
        this.#position = null;
        this.#tags = null;
        this.#unicodeEmoji = null;
    }

    equals(other: Partial<Role>): boolean {
        return Boolean(
            this.#color === other.color &&
                this.#flags === other.flags &&
                this.#hoist === other.hoist &&
                this.#icon === other.icon &&
                this.#id === other.id &&
                this.#managed === other.managed &&
                this.#mentionable === other.mentionable &&
                this.#name === other.name &&
                this.#permissions === other.permissions &&
                this.#position === other.position &&
                this.#tags?.equals(other.tags ?? {}) &&
                this.#unicodeEmoji === other.unicodeEmoji,
        );
    }
}
