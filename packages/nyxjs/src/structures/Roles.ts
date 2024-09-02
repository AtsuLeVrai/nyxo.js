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
}

export { RoleFlags } from "@nyxjs/rest";
