import type {
    ApplicationFlags,
    ApplicationInstallParamStructure,
    ApplicationIntegrationTypeConfigurationStructure,
    ApplicationRoleConnectionMetadataStructure,
    ApplicationRoleConnectionMetadataTypes,
    ApplicationStructure,
    IntegrationTypes,
} from "@nyxjs/api-types";
import type { Integer, Locales, Oauth2Scopes, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { Guild } from "./Guilds";
import { Team } from "./Teams";
import { User } from "./Users";

export class ApplicationRoleConnectionMetadata extends Base<ApplicationRoleConnectionMetadataStructure> {
    public description!: string;

    public descriptionLocalizations?: Record<Locales, string>;

    public key!: string;

    public name!: string;

    public nameLocalizations?: Record<Locales, string>;

    public type!: ApplicationRoleConnectionMetadataTypes;

    public constructor(data: Partial<ApplicationRoleConnectionMetadataStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationRoleConnectionMetadataStructure>): void {
        this.description = data.description ?? this.description;
        if ("description_localizations" in data) {
            this.descriptionLocalizations = data.description_localizations;
        }

        this.key = data.key ?? this.key;
        this.name = data.name ?? this.name;
        if ("name_localizations" in data) {
            this.nameLocalizations = data.name_localizations;
        }

        this.type = data.type ?? this.type;
    }
}

export class ApplicationInstallParam extends Base<ApplicationInstallParamStructure> {
    public permissions!: string;

    public scopes!: Oauth2Scopes[];

    public constructor(data: Partial<ApplicationInstallParamStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationInstallParamStructure>): void {
        this.permissions = data.permissions ?? this.permissions;
        this.scopes = data.scopes ?? this.scopes;
    }
}

export class ApplicationIntegrationTypeConfiguration extends Base<ApplicationIntegrationTypeConfigurationStructure> {
    public oauth2InstallParams!: ApplicationInstallParam;

    public constructor(data: Partial<ApplicationIntegrationTypeConfigurationStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationIntegrationTypeConfigurationStructure>): void {
        this.oauth2InstallParams = data.oauth2_install_params
            ? ApplicationInstallParam.from(data.oauth2_install_params)
            : this.oauth2InstallParams;
    }
}

export class Application extends Base<ApplicationStructure> {
    public approximateGuildCount?: Integer;

    public approximateUserInstallCount?: Integer;

    public bot?: Pick<
        User,
        | "accentColor"
        | "avatar"
        | "avatarDecorationData"
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

    public guild?: Partial<Guild>;

    public guildId?: Snowflake;

    public icon!: string | null;

    public id!: Snowflake;

    public installParams?: ApplicationInstallParam;

    public integrationTypesConfig?: Partial<Record<IntegrationTypes, ApplicationIntegrationTypeConfiguration>>;

    public interactionsEndpointUrl?: string;

    public name!: string;

    public owner?: Pick<
        User,
        | "accentColor"
        | "avatar"
        | "avatarDecorationData"
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

    public summary!: string;

    public tags?: string[];

    public team?: Team;

    public termsOfServiceUrl?: string;

    public verifyKey!: string;

    public constructor(data: Partial<ApplicationStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationStructure>): void {
        if ("approximate_guild_count" in data) {
            this.approximateGuildCount = data.approximate_guild_count;
        }

        if ("approximate_user_install_count" in data) {
            this.approximateUserInstallCount = data.approximate_user_install_count;
        }

        if ("bot" in data && data.bot) {
            this.bot = User.from(data.bot);
        }

        this.botPublic = data.bot_public ?? this.botPublic;
        this.botRequireCodeGrant = data.bot_require_code_grant ?? this.botRequireCodeGrant;
        if ("cover_image" in data) {
            this.coverImage = data.cover_image;
        }

        if ("custom_install_url" in data) {
            this.customInstallUrl = data.custom_install_url;
        }

        this.description = data.description ?? this.description;
        if ("flags" in data) {
            this.flags = data.flags;
        }

        if ("guild" in data && data.guild) {
            this.guild = Guild.from(data.guild);
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        if ("icon" in data && data.icon) {
            this.icon = data.icon;
        }

        this.id = data.id ?? this.id;
        if ("install_params" in data && data.install_params) {
            this.installParams = ApplicationInstallParam.from(data.install_params);
        }

        if ("integration_types_config" in data && data.integration_types_config) {
            this.integrationTypesConfig = Object.entries(data.integration_types_config).reduce<
                Partial<Record<IntegrationTypes, ApplicationIntegrationTypeConfiguration>>
            >((acc, [key, value]) => {
                acc[key as unknown as IntegrationTypes] = ApplicationIntegrationTypeConfiguration.from(value);
                return acc;
            }, {});
        }

        if ("interactions_endpoint_url" in data) {
            this.interactionsEndpointUrl = data.interactions_endpoint_url;
        }

        this.name = data.name ?? this.name;
        if ("owner" in data && data.owner) {
            this.owner = User.from(data.owner);
        }

        if ("primary_sku_id" in data) {
            this.primarySkuId = data.primary_sku_id;
        }

        if ("privacy_policy_url" in data) {
            this.privacyPolicyUrl = data.privacy_policy_url;
        }

        if ("redirect_uris" in data) {
            this.redirectUris = data.redirect_uris;
        }

        if ("role_connections_verification_url" in data) {
            this.roleConnectionsVerificationUrl = data.role_connections_verification_url;
        }

        if ("rpc_origins" in data) {
            this.rpcOrigins = data.rpc_origins;
        }

        if ("slug" in data) {
            this.slug = data.slug;
        }

        this.summary = data.summary ?? this.summary;
        if ("tags" in data) {
            this.tags = data.tags;
        }

        if ("team" in data && data.team) {
            this.team = Team.from(data.team);
        }

        if ("terms_of_service_url" in data) {
            this.termsOfServiceUrl = data.terms_of_service_url;
        }

        this.verifyKey = data.verify_key ?? this.verifyKey;
    }
}

export { ApplicationFlags, ApplicationRoleConnectionMetadataTypes, IntegrationTypes } from "@nyxjs/api-types";
