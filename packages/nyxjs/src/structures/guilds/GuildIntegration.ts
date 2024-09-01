import type {
	Integer,
	IsoO8601Timestamp,
	Oauth2Scopes,
	Snowflake,
} from "@nyxjs/core";
import type {
	IntegrationAccountStructure,
	IntegrationApplicationStructure,
	IntegrationExpireBehaviors,
	IntegrationPlatformTypes,
	IntegrationStructure,
} from "@nyxjs/rest";
import { Base } from "../Base";
import { User } from "../Users";

export class IntegrationApplication extends Base<IntegrationApplicationStructure> {
	public bot?: User;

	public description!: string;

	public icon!: string | null;

	public id!: Snowflake;

	public name!: string;

	public constructor(data: Partial<IntegrationApplicationStructure>) {
		super(data);
	}

	public toJSON(): IntegrationApplicationStructure {
		return {
			bot: this.bot?.toJSON(),
			description: this.description,
			icon: this.icon,
			id: this.id,
			name: this.name,
		};
	}

	protected patch(data: Partial<IntegrationApplicationStructure>): void {
		if (data.bot !== undefined) {
			this.bot = User.from(data.bot);
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.icon !== undefined) {
			this.icon = data.icon;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}
	}
}

export class IntegrationAccount extends Base<IntegrationAccountStructure> {
	public id!: string;

	public name!: string;

	public constructor(data: Partial<IntegrationAccountStructure>) {
		super(data);
	}

	public toJSON(): IntegrationAccountStructure {
		return {
			id: this.id,
			name: this.name,
		};
	}

	protected patch(data: Partial<IntegrationAccountStructure>): void {
		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}
	}
}

export class Integration extends Base<IntegrationStructure> {
	public account!: IntegrationAccount;

	public application?: IntegrationApplication;

	public enableEmoticons?: boolean;

	public enabled!: boolean;

	public expireBehavior?: IntegrationExpireBehaviors;

	public expireGracePeriod?: Integer;

	public id!: Snowflake;

	public name!: string;

	public revoked?: boolean;

	public roleId?: Snowflake;

	public scopes?: Oauth2Scopes[];

	public subscriberCount?: Integer;

	public syncedAt?: IsoO8601Timestamp;

	public syncing?: boolean;

	public type!: IntegrationPlatformTypes;

	public user?: User;

	public constructor(data: Partial<IntegrationStructure>) {
		super(data);
	}

	public toJSON(): IntegrationStructure {
		return {
			account: this.account.toJSON(),
			application: this.application?.toJSON(),
			enable_emoticons: this.enableEmoticons,
			enabled: this.enabled,
			expire_behavior: this.expireBehavior,
			expire_grace_period: this.expireGracePeriod,
			id: this.id,
			name: this.name,
			revoked: this.revoked,
			role_id: this.roleId,
			scopes: this.scopes,
			subscriber_count: this.subscriberCount,
			synced_at: this.syncedAt,
			syncing: this.syncing,
			type: this.type,
			user: this.user?.toJSON(),
		};
	}

	protected patch(data: Partial<IntegrationStructure>): void {
		if (data.account !== undefined) {
			this.account = IntegrationAccount.from(data.account);
		}

		if (data.application !== undefined) {
			this.application = IntegrationApplication.from(data.application);
		}

		if (data.enable_emoticons !== undefined) {
			this.enableEmoticons = data.enable_emoticons;
		}

		if (data.enabled !== undefined) {
			this.enabled = data.enabled;
		}

		if (data.expire_behavior !== undefined) {
			this.expireBehavior = data.expire_behavior;
		}

		if (data.expire_grace_period !== undefined) {
			this.expireGracePeriod = data.expire_grace_period;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.revoked !== undefined) {
			this.revoked = data.revoked;
		}

		if (data.role_id !== undefined) {
			this.roleId = data.role_id;
		}

		if (data.scopes !== undefined) {
			this.scopes = data.scopes;
		}

		if (data.subscriber_count !== undefined) {
			this.subscriberCount = data.subscriber_count;
		}

		if (data.synced_at !== undefined) {
			this.syncedAt = data.synced_at;
		}

		if (data.syncing !== undefined) {
			this.syncing = data.syncing;
		}

		if (data.type !== undefined) {
			this.type = data.type;
		}

		if (data.user !== undefined) {
			this.user = User.from(data.user);
		}
	}
}

export {
	IntegrationExpireBehaviors,
	IntegrationPlatformTypes,
} from "@nyxjs/rest";
