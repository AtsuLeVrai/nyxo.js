import type { Integer, Locales, Snowflake } from "@nyxjs/core";
import type {
	ApplicationRoleConnectionStructure,
	AvatarDecorationDataStructure,
	ConnectionServices,
	ConnectionStructure,
	ConnectionVisibilityTypes,
	PremiumTypes,
	UserFlags,
	UserStructure,
} from "@nyxjs/rest";
import { Base } from "./base";

export class ApplicationRoleConnection extends Base<ApplicationRoleConnectionStructure> {
	// TODO: Implement ApplicationRoleConnectionMetadata
	public metadata!: Record<string, any>;

	public platformName!: string | null;

	public platformUsername!: string | null;

	public constructor(data: Partial<ApplicationRoleConnectionStructure>) {
		super(data);
	}

	public toJSON(): ApplicationRoleConnectionStructure {
		return {
			metadata: this.metadata,
			platform_name: this.platformName,
			platform_username: this.platformUsername,
		};
	}

	protected patch(data: Partial<ApplicationRoleConnectionStructure>): void {
		if (data.metadata !== undefined) {
			this.metadata = data.metadata;
		}

		if (data.platform_name !== undefined) {
			this.platformName = data.platform_name;
		}

		if (data.platform_username !== undefined) {
			this.platformUsername = data.platform_username;
		}
	}
}

export class Connection extends Base<ConnectionStructure> {
	public friendSync!: boolean;

	public id!: string;

	// TODO: Implement integrations
	public integrations?: Partial<any>[];

	public name!: string;

	public revoked?: boolean;

	public showActivity!: boolean;

	public twoWayLink!: boolean;

	public type!: ConnectionServices;

	public verified!: boolean;

	public visibility!: ConnectionVisibilityTypes;

	public constructor(data: Partial<ConnectionStructure>) {
		super(data);
	}

	public toJSON(): ConnectionStructure {
		return {
			friend_sync: this.friendSync,
			id: this.id,
			integrations: this.integrations,
			name: this.name,
			revoked: this.revoked,
			show_activity: this.showActivity,
			two_way_link: this.twoWayLink,
			type: this.type,
			verified: this.verified,
			visibility: this.visibility,
		};
	}

	protected patch(data: Partial<ConnectionStructure>): void {
		if (data.friend_sync !== undefined) {
			this.friendSync = data.friend_sync;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.integrations !== undefined) {
			this.integrations = data.integrations;
		}

		if (data.name !== undefined) {
			this.name = data.name;
		}

		if (data.revoked !== undefined) {
			this.revoked = data.revoked;
		}

		if (data.show_activity !== undefined) {
			this.showActivity = data.show_activity;
		}

		if (data.two_way_link !== undefined) {
			this.twoWayLink = data.two_way_link;
		}

		if (data.type !== undefined) {
			this.type = data.type;
		}

		if (data.verified !== undefined) {
			this.verified = data.verified;
		}

		if (data.visibility !== undefined) {
			this.visibility = data.visibility;
		}
	}
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure> {
	public asset!: string;

	public skuId!: Snowflake;

	public constructor(data: Partial<AvatarDecorationDataStructure>) {
		super(data);
	}

	public toJSON(): AvatarDecorationDataStructure {
		return {
			asset: this.asset,
			sku_id: this.skuId,
		};
	}

	protected patch(data: Partial<AvatarDecorationDataStructure>): void {
		if (data.asset !== undefined) {
			this.asset = data.asset;
		}

		if (data.sku_id !== undefined) {
			this.skuId = data.sku_id;
		}
	}
}

export class User extends Base<UserStructure> {
	public accentColor?: Integer | null;

	public avatar!: string | null;

	public avatarDecorationData?: AvatarDecorationDataStructure | null;

	public banner?: string | null;

	public bot?: boolean;

	public discriminator!: string;

	public email?: string | null;

	public flags?: UserFlags;

	public globalName!: string | null;

	public id!: Snowflake;

	public locale?: Locales;

	public mfaEnabled?: boolean;

	public premiumType?: PremiumTypes;

	public publicFlags?: UserFlags;

	public system?: boolean;

	public username!: string;

	public verified?: boolean;

	public constructor(data: Partial<UserStructure>) {
		super(data);
	}

	public toJSON(): UserStructure {
		return {
			accent_color: this.accentColor,
			avatar: this.avatar,
			avatar_decoration_data: this.avatarDecorationData,
			banner: this.banner,
			bot: this.bot,
			discriminator: this.discriminator,
			email: this.email,
			flags: this.flags,
			global_name: this.globalName,
			id: this.id,
			locale: this.locale,
			mfa_enabled: this.mfaEnabled,
			premium_type: this.premiumType,
			public_flags: this.publicFlags,
			system: this.system,
			username: this.username,
			verified: this.verified,
		};
	}

	protected patch(data: Partial<UserStructure>): void {
		if (data.accent_color !== undefined) {
			this.accentColor = data.accent_color;
		}

		if (data.avatar !== undefined) {
			this.avatar = data.avatar;
		}

		if (data.avatar_decoration_data !== undefined) {
			this.avatarDecorationData = data.avatar_decoration_data;
		}

		if (data.banner !== undefined) {
			this.banner = data.banner;
		}

		if (data.bot !== undefined) {
			this.bot = data.bot;
		}

		if (data.discriminator !== undefined) {
			this.discriminator = data.discriminator;
		}

		if (data.email !== undefined) {
			this.email = data.email;
		}

		if (data.flags !== undefined) {
			this.flags = data.flags;
		}

		if (data.global_name !== undefined) {
			this.globalName = data.global_name;
		}

		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.locale !== undefined) {
			this.locale = data.locale;
		}

		if (data.mfa_enabled !== undefined) {
			this.mfaEnabled = data.mfa_enabled;
		}

		if (data.premium_type !== undefined) {
			this.premiumType = data.premium_type;
		}

		if (data.public_flags !== undefined) {
			this.publicFlags = data.public_flags;
		}

		if (data.system !== undefined) {
			this.system = data.system;
		}

		if (data.username !== undefined) {
			this.username = data.username;
		}

		if (data.verified !== undefined) {
			this.verified = data.verified;
		}
	}
}

export {
	ConnectionVisibilityTypes,
	type ConnectionServices,
	PremiumTypes,
	UserFlags,
} from "@nyxjs/rest";
