import type { Integer, Snowflake } from "@nyxjs/core";
import type { RoleFlags, RoleStructure, RoleTagStructure } from "@nyxjs/rest";
import { Base } from "./Base";

export class RoleTags extends Base<RoleTagStructure> {
    public availableForPurchase?: null;

    public botId?: Snowflake;

    public guildConnections?: null;

    public integrationId?: Snowflake;

    public premiumSubscriber?: null;

    public subscriptionListingId?: Snowflake;

    public constructor(data: Partial<RoleTagStructure>) {
        super(data);
    }

    protected patch(data: Partial<RoleTagStructure>): void {
        if ("available_for_purchase" in data) {
            this.availableForPurchase = data.available_for_purchase ?? null;
        }

        if ("bot_id" in data) {
            this.botId = data.bot_id;
        }

        if ("guild_connections" in data) {
            this.guildConnections = data.guild_connections ?? null;
        }

        if ("integration_id" in data) {
            this.integrationId = data.integration_id;
        }

        if ("premium_subscriber" in data) {
            this.premiumSubscriber = data.premium_subscriber ?? null;
        }

        if ("subscription_listing_id" in data) {
            this.subscriptionListingId = data.subscription_listing_id;
        }
    }
}

export class Role extends Base<RoleStructure> {
    public color!: Integer;

    public flags!: RoleFlags;

    public hoist!: boolean;

    public icon?: string | null;

    public id!: Snowflake;

    public managed!: boolean;

    public mentionable!: boolean;

    public name!: string;

    public permissions!: string;

    public position!: Integer;

    public tags?: RoleTags;

    public unicodeEmoji?: string | null;

    public constructor(data: Partial<RoleStructure>) {
        super(data);
    }

    protected patch(data: Partial<RoleStructure>): void {
        this.color = data.color ?? this.color;
        this.flags = data.flags ?? this.flags;
        this.hoist = data.hoist ?? this.hoist;
        this.id = data.id ?? this.id;
        this.managed = data.managed ?? this.managed;
        this.mentionable = data.mentionable ?? this.mentionable;
        this.name = data.name ?? this.name;
        this.permissions = data.permissions ?? this.permissions;
        this.position = data.position ?? this.position;

        if ("icon" in data) {
            this.icon = data.icon;
        }

        if ("unicode_emoji" in data) {
            this.unicodeEmoji = data.unicode_emoji;
        }

        if ("tags" in data && data.tags) {
            this.tags = new RoleTags(data.tags);
        }
    }
}
