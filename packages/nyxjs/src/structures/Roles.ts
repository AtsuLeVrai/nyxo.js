import type { BitfieldResolvable, Integer, RoleFlags, RoleStructure, RoleTagsStructure, Snowflake } from "@nyxjs/core";
import { BaseStructure } from "../bases/BaseStructure";

export class RoleTags extends BaseStructure<RoleTagsStructure> {
    public availableForPurchase?: null;

    public botId?: Snowflake;

    public guildConnections?: null;

    public integrationId?: Snowflake;

    public premiumSubscriber?: null;

    public subscriptionListingId?: Snowflake;

    public constructor(data: Partial<RoleTagsStructure> = {}) {
        super();
        this.availableForPurchase = data.available_for_purchase;
        this.botId = data.bot_id;
        this.guildConnections = data.guild_connections;
        this.integrationId = data.integration_id;
        this.premiumSubscriber = data.premium_subscriber;
        this.subscriptionListingId = data.subscription_listing_id;
    }

    public toJSON(): RoleTagsStructure {
        return {
            available_for_purchase: this.availableForPurchase,
            bot_id: this.botId,
            guild_connections: this.guildConnections,
            integration_id: this.integrationId,
            premium_subscriber: this.premiumSubscriber,
            subscription_listing_id: this.subscriptionListingId,
        };
    }
}

export class Role extends BaseStructure<RoleStructure> {
    public color: Integer;

    public flags: BitfieldResolvable<RoleFlags>;

    public hoist: boolean;

    public icon?: string | null;

    public id: Snowflake;

    public managed: boolean;

    public mentionable: boolean;

    public name: string;

    public permissions: string;

    public position: Integer;

    public tags?: RoleTags;

    public unicodeEmoji?: string | null;

    public constructor(data: Partial<RoleStructure> = {}) {
        super();
        this.color = data.color!;
        this.flags = data.flags!;
        this.hoist = data.hoist!;
        this.icon = data.icon!;
        this.id = data.id!;
        this.managed = data.managed!;
        this.mentionable = data.mentionable!;
        this.name = data.name!;
        this.permissions = data.permissions!;
        this.position = data.position!;
        this.tags = RoleTags.from(data.tags);
        this.unicodeEmoji = data.unicode_emoji!;
    }

    public toJSON(): RoleStructure {
        return {
            color: this.color,
            flags: this.flags,
            hoist: this.hoist,
            icon: this.icon,
            id: this.id,
            managed: this.managed,
            mentionable: this.mentionable,
            name: this.name,
            permissions: this.permissions,
            position: this.position,
            tags: this.tags?.toJSON(),
            unicode_emoji: this.unicodeEmoji,
        };
    }
}
