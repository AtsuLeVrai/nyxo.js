import type { Integer, Snowflake } from "@nyxjs/core";
import type { RoleFlags, RoleStructure, RoleTagStructure } from "@nyxjs/rest";
import { Base } from "./base";

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

	public toJSON(): RoleTagStructure {
		return {
			available_for_purchase: this.availableForPurchase,
			bot_id: this.botId,
			guild_connections: this.guildConnections,
			integration_id: this.integrationId,
			premium_subscriber: this.premiumSubscriber,
			subscription_listing_id: this.subscriptionListingId,
		};
	}

	protected patch(data: Partial<RoleTagStructure>): void {
		if (data.available_for_purchase !== undefined) {
			this.availableForPurchase = data.available_for_purchase;
		}

		if (data.bot_id !== undefined) {
			this.botId = data.bot_id;
		}

		if (data.guild_connections !== undefined) {
			this.guildConnections = data.guild_connections;
		}

		if (data.integration_id !== undefined) {
			this.integrationId = data.integration_id;
		}

		if (data.premium_subscriber !== undefined) {
			this.premiumSubscriber = data.premium_subscriber;
		}

		if (data.subscription_listing_id !== undefined) {
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

	protected patch(data: Partial<RoleStructure>): void {
		if (data.color !== undefined) {
			this.color = data.color;
		}

		if (data.flags !== undefined) {
			this.flags = data.flags;
		}

		if (data.hoist !== undefined) {
			this.hoist = data.hoist;
		}

		if (data.icon !== undefined) {
			this.icon = data.icon;
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

		if (data.tags !== undefined) {
			this.tags = RoleTags.from(data.tags);
		}

		if (data.unicode_emoji !== undefined) {
			this.unicodeEmoji = data.unicode_emoji;
		}
	}
}

export { RoleFlags } from "@nyxjs/rest";
