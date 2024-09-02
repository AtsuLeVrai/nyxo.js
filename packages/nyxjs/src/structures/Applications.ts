import type { Integer, Locales, Oauth2Scopes, Snowflake } from "@nyxjs/core";
import type {
	ApplicationFlags,
	ApplicationInstallParamStructure,
	ApplicationIntegrationTypeConfigurationStructure,
	ApplicationRoleConnectionMetadataStructure,
	ApplicationRoleConnectionMetadataTypes,
	ApplicationStructure,
	GuildStructure,
	IntegrationTypes,
	TeamStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";
import type { User } from "./Users";

export class ApplicationRoleConnectionMetadata extends Base<ApplicationRoleConnectionMetadataStructure> {
	public description!: string;

	public descriptionLocalizations?: Record<Locales, string>;

	public key!: string;

	public name!: string;

	public nameLocalizations?: Record<Locales, string>;

	public type!: ApplicationRoleConnectionMetadataTypes;

	public constructor(
		data: Partial<ApplicationRoleConnectionMetadataStructure>,
	) {
		super(data);
	}
}

export class ApplicationInstallParam extends Base<ApplicationInstallParamStructure> {
	public permissions!: string;

	public scopes!: Oauth2Scopes[];

	public constructor(data: Partial<ApplicationInstallParamStructure>) {
		super(data);
	}
}

export class ApplicationIntegrationTypeConfiguration extends Base<ApplicationIntegrationTypeConfigurationStructure> {
	public oauth2InstallParams!: ApplicationInstallParam;

	public constructor(
		data: Partial<ApplicationIntegrationTypeConfigurationStructure>,
	) {
		super(data);
	}
}

export class Application extends Base<ApplicationStructure> {
	public approximateGuildCount?: Integer;

	public approximateUserInstallCount?: Integer;

	public bot?: Pick<
		User,
		| "accentColor"
		| "avatarDecorationData"
		| "avatar"
		| "banner"
		| "bot"
		| "discriminator"
		| "flags"
		| "globalName"
		| "id"
		| "publicFlags"
		| "username"
	>;

	public botPublic!: boolean;

	public botRequireCodeGrant!: boolean;

	public coverImage?: string;

	public customInstallUrl?: string;

	public description!: string;

	public flags?: ApplicationFlags;

	public guild?: Partial<GuildStructure>;

	public guildId?: Snowflake;

	public icon!: string | null;

	public id!: Snowflake;

	public installParams?: ApplicationInstallParam;

	public integrationTypesConfig?: Record<
		IntegrationTypes,
		ApplicationIntegrationTypeConfiguration
	>;

	public interactionsEndpointUrl?: string;

	public name!: string;

	public owner?: Pick<
		User,
		| "accentColor"
		| "avatarDecorationData"
		| "avatar"
		| "banner"
		| "discriminator"
		| "flags"
		| "globalName"
		| "id"
		| "publicFlags"
	>;

	public primarySkuId?: Snowflake;

	public privacyPolicyUrl?: string;

	public redirectUris?: string[];

	public roleConnectionsVerificationUrl?: string;

	public rpcOrigins?: string[];

	public slug?: string;
	/**
	 * @deprecated This field is deprecated and will be removed in a future API version
	 */
	public summary!: string;

	public tags?: string[];

	public team?: TeamStructure;

	public termsOfServiceUrl?: string;

	public verifyKey!: string;

	public constructor(data: Partial<ApplicationStructure>) {
		super(data);
	}
}

export {
	ApplicationRoleConnectionMetadataTypes,
	ApplicationFlags,
	IntegrationTypes,
} from "@nyxjs/rest";
