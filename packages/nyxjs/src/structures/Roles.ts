import type { Integer, RoleFlags, RoleStructure, RoleTagStructure, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";

export class RoleTags extends Base<RoleTagStructure> {
    public availableForPurchase?: null;

    public botId?: Snowflake;

    public guildConnections?: null;

    public integrationId?: Snowflake;

    public premiumSubscriber?: null;

    public subscriptionListingId?: Snowflake;

    public constructor(data: Readonly<Partial<RoleTagStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<RoleTagStructure>>): void {
        if ("available_for_purchase" in data) {
            if (data.available_for_purchase === null) {
                this.availableForPurchase = undefined;
            } else if (data.available_for_purchase !== undefined) {
                this.availableForPurchase = data.available_for_purchase;
            }
        }

        if ("bot_id" in data) {
            if (data.bot_id === null) {
                this.botId = undefined;
            } else if (data.bot_id !== undefined) {
                this.botId = data.bot_id;
            }
        }

        if ("guild_connections" in data) {
            if (data.guild_connections === null) {
                this.guildConnections = undefined;
            } else if (data.guild_connections !== undefined) {
                this.guildConnections = data.guild_connections;
            }
        }

        if ("integration_id" in data) {
            if (data.integration_id === null) {
                this.integrationId = undefined;
            } else if (data.integration_id !== undefined) {
                this.integrationId = data.integration_id;
            }
        }

        if ("premium_subscriber" in data) {
            if (data.premium_subscriber === null) {
                this.premiumSubscriber = undefined;
            } else if (data.premium_subscriber !== undefined) {
                this.premiumSubscriber = data.premium_subscriber;
            }
        }

        if ("subscription_listing_id" in data) {
            if (data.subscription_listing_id === null) {
                this.subscriptionListingId = undefined;
            } else if (data.subscription_listing_id !== undefined) {
                this.subscriptionListingId = data.subscription_listing_id;
            }
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

    public constructor(data: Readonly<Partial<RoleStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<RoleStructure>>): void {
        if (data.color !== undefined) {
            this.color = data.color;
        }

        if (data.flags !== undefined) {
            this.flags = data.flags;
        }

        if (data.hoist !== undefined) {
            this.hoist = data.hoist;
        }

        if ("icon" in data) {
            if (data.icon === null) {
                this.icon = undefined;
            } else {
                this.icon = data.icon;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.managed !== undefined) {
            this.managed = data.managed;
        }

        if (data.mentionable !== undefined) {
            this.mentionable = data.mentionable;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.permissions !== undefined) {
            this.permissions = data.permissions;
        }

        if (data.position !== undefined) {
            this.position = data.position;
        }

        if ("tags" in data) {
            if (data.tags === null) {
                this.tags = undefined;
            } else if (data.tags !== undefined) {
                this.tags = RoleTags.from(data.tags);
            }
        }

        if ("unicode_emoji" in data) {
            if (data.unicode_emoji === null) {
                this.unicodeEmoji = undefined;
            } else {
                this.unicodeEmoji = data.unicode_emoji;
            }
        }
    }
}
