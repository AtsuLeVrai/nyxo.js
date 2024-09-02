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
import { Base } from "./Base";
import type { Integration } from "./Guilds";

export class ApplicationRoleConnection extends Base<ApplicationRoleConnectionStructure> {
	// TODO: Implement ApplicationRoleConnectionMetadata
	public metadata!: Record<string, any>;

	public platformName!: string | null;

	public platformUsername!: string | null;

	public constructor(data: Partial<ApplicationRoleConnectionStructure>) {
		super(data);
	}
}

export class Connection extends Base<ConnectionStructure> {
	public friendSync!: boolean;

	public id!: string;

	public integrations?: Partial<Integration>[];

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
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure> {
	public asset!: string;

	public skuId!: Snowflake;

	public constructor(data: Partial<AvatarDecorationDataStructure>) {
		super(data);
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
}

export {
	ConnectionVisibilityTypes,
	type ConnectionServices,
	PremiumTypes,
	UserFlags,
} from "@nyxjs/rest";
