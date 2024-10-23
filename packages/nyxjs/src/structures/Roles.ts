import type { BitfieldResolvable, Integer, RoleFlags, RoleStructure, RoleTagsStructure, Snowflake } from "@nyxjs/core";

export class RoleTags {
    availableForPurchase?: null;

    botId?: Snowflake;

    guildConnections?: null;

    integrationId?: Snowflake;

    premiumSubscriber?: null;

    subscriptionListingId?: Snowflake;

    constructor(data: Partial<RoleTagsStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<RoleTagsStructure>): void {
        if (data.available_for_purchase) {
            this.availableForPurchase = data.available_for_purchase;
        }
        if (data.bot_id) {
            this.botId = data.bot_id;
        }
        if (data.guild_connections) {
            this.guildConnections = data.guild_connections;
        }
        if (data.integration_id) {
            this.integrationId = data.integration_id;
        }
        if (data.premium_subscriber) {
            this.premiumSubscriber = data.premium_subscriber;
        }
        if (data.subscription_listing_id) {
            this.subscriptionListingId = data.subscription_listing_id;
        }
    }
}

export class Role {
    color!: Integer;

    flags!: BitfieldResolvable<RoleFlags>;

    hoist!: boolean;

    icon?: string | null;

    id!: Snowflake;

    managed!: boolean;

    mentionable!: boolean;

    name!: string;

    permissions!: string;

    position!: Integer;

    tags?: RoleTags;

    unicodeEmoji?: string | null;

    constructor(data: Partial<RoleStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<RoleStructure>): void {
        if (data.color) {
            this.color = data.color;
        }
        if (data.flags) {
            this.flags = data.flags;
        }
        if (data.hoist) {
            this.hoist = data.hoist;
        }
        if (data.icon) {
            this.icon = data.icon;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.managed) {
            this.managed = data.managed;
        }
        if (data.mentionable) {
            this.mentionable = data.mentionable;
        }
        if (data.name) {
            this.name = data.name;
        }
        if (data.permissions) {
            this.permissions = data.permissions;
        }
        if (data.position) {
            this.position = data.position;
        }
        if (data.tags) {
            this.tags = new RoleTags(data.tags);
        }
        if (data.unicode_emoji) {
            this.unicodeEmoji = data.unicode_emoji;
        }
    }
}
