import type { BitfieldResolvable, Integer, RoleFlags, RoleStructure, RoleTagsStructure, Snowflake } from "@nyxjs/core";

export class RoleTags {
    #availableForPurchase: null = null;
    #botId: Snowflake | null = null;
    #guildConnections: null = null;
    #integrationId: Snowflake | null = null;
    #premiumSubscriber: null = null;
    #subscriptionListingId: Snowflake | null = null;

    constructor(data: Partial<RoleTagsStructure>) {
        this.patch(data);
    }

    get availableForPurchase() {
        return this.#availableForPurchase;
    }

    get botId() {
        return this.#botId;
    }

    get guildConnections() {
        return this.#guildConnections;
    }

    get integrationId() {
        return this.#integrationId;
    }

    get premiumSubscriber() {
        return this.#premiumSubscriber;
    }

    get subscriptionListingId() {
        return this.#subscriptionListingId;
    }

    patch(data: Partial<RoleTagsStructure>): void {
        if (!data) {
            return;
        }

        this.#availableForPurchase = data.available_for_purchase ?? this.#availableForPurchase;
        this.#botId = data.bot_id ?? this.#botId;
        this.#guildConnections = data.guild_connections ?? this.#guildConnections;
        this.#integrationId = data.integration_id ?? this.#integrationId;
        this.#premiumSubscriber = data.premium_subscriber ?? this.#premiumSubscriber;
        this.#subscriptionListingId = data.subscription_listing_id ?? this.#subscriptionListingId;
    }

    toJSON(): Partial<RoleTagsStructure> {
        return {
            available_for_purchase: this.#availableForPurchase,
            bot_id: this.#botId ?? undefined,
            guild_connections: this.#guildConnections,
            integration_id: this.#integrationId ?? undefined,
            premium_subscriber: this.#premiumSubscriber,
            subscription_listing_id: this.#subscriptionListingId ?? undefined,
        };
    }
}

export class Role {
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
        this.patch(data);
    }

    get color() {
        return this.#color;
    }

    get flags() {
        return this.#flags;
    }

    get hoist() {
        return this.#hoist;
    }

    get icon() {
        return this.#icon;
    }

    get id() {
        return this.#id;
    }

    get managed() {
        return this.#managed;
    }

    get mentionable() {
        return this.#mentionable;
    }

    get name() {
        return this.#name;
    }

    get permissions() {
        return this.#permissions;
    }

    get position() {
        return this.#position;
    }

    get tags() {
        return this.#tags;
    }

    get unicodeEmoji() {
        return this.#unicodeEmoji;
    }

    patch(data: Partial<RoleStructure>): void {
        if (!data) {
            return;
        }

        this.#color = data.color ?? this.#color;
        this.#flags = data.flags ?? this.#flags;
        this.#hoist = data.hoist ?? this.#hoist;
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#managed = data.managed ?? this.#managed;
        this.#mentionable = data.mentionable ?? this.#mentionable;
        this.#name = data.name ?? this.#name;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#position = data.position ?? this.#position;

        if (data.tags) {
            this.#tags = new RoleTags(data.tags);
        }

        this.#unicodeEmoji = data.unicode_emoji ?? this.#unicodeEmoji;
    }

    toJSON(): Partial<RoleStructure> {
        return {
            color: this.#color ?? undefined,
            flags: this.#flags,
            hoist: this.#hoist,
            icon: this.#icon,
            id: this.#id ?? undefined,
            managed: this.#managed,
            mentionable: this.#mentionable,
            name: this.#name ?? undefined,
            permissions: this.#permissions ?? undefined,
            position: this.#position ?? undefined,
            tags: this.#tags?.toJSON(),
            unicode_emoji: this.#unicodeEmoji,
        };
    }
}
