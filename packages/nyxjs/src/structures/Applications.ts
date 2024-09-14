import type {
    ApplicationFlags,
    ApplicationInstallParamStructure,
    ApplicationIntegrationTypeConfigurationStructure,
    ApplicationRoleConnectionMetadataStructure,
    ApplicationRoleConnectionMetadataTypes,
    ApplicationStructure,
    Integer,
    IntegrationTypes,
    Locales,
    Oauth2Scopes,
    Snowflake,
} from "@nyxjs/core";
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

    public constructor(data: Readonly<Partial<ApplicationRoleConnectionMetadataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationRoleConnectionMetadataStructure>>): void {
        if (data.description !== undefined) {
            this.description = data.description.trim();
        }

        if ("description_localizations" in data) {
            if (data.description_localizations === null) {
                this.descriptionLocalizations = undefined;
            } else if (data.description_localizations !== undefined) {
                this.descriptionLocalizations = data.description_localizations;
            }
        }

        if (data.key !== undefined) {
            this.key = data.key.trim();
        }

        if (data.name !== undefined) {
            this.name = data.name.trim();
        }

        if ("name_localizations" in data) {
            if (data.name_localizations === null) {
                this.nameLocalizations = undefined;
            } else if (data.name_localizations !== undefined) {
                this.nameLocalizations = data.name_localizations;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class ApplicationInstallParam extends Base<ApplicationInstallParamStructure> {
    public permissions!: string;

    public scopes!: Oauth2Scopes[];

    public constructor(data: Readonly<Partial<ApplicationInstallParamStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationInstallParamStructure>>): void {
        if (data.permissions !== undefined) {
            this.permissions = data.permissions.trim();
        }

        if (data.scopes !== undefined) {
            this.scopes = data.scopes;
        }
    }
}

export class ApplicationIntegrationTypeConfiguration extends Base<ApplicationIntegrationTypeConfigurationStructure> {
    public oauth2InstallParams!: ApplicationInstallParam;

    public constructor(data: Readonly<Partial<ApplicationIntegrationTypeConfigurationStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationIntegrationTypeConfigurationStructure>>): void {
        if (data.oauth2_install_params !== undefined) {
            this.oauth2InstallParams = ApplicationInstallParam.from(data.oauth2_install_params);
        }
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

    public constructor(data: Readonly<Partial<ApplicationStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationStructure>>): void {
        if ("approximate_guild_count" in data) {
            if (data.approximate_guild_count === null) {
                this.approximateGuildCount = undefined;
            } else if (data.approximate_guild_count !== undefined) {
                this.approximateGuildCount = data.approximate_guild_count;
            }
        }

        if ("approximate_user_install_count" in data) {
            if (data.approximate_user_install_count === null) {
                this.approximateUserInstallCount = undefined;
            } else if (data.approximate_user_install_count !== undefined) {
                this.approximateUserInstallCount = data.approximate_user_install_count;
            }
        }

        if ("bot" in data) {
            if (data.bot === null) {
                this.bot = undefined;
            } else if (data.bot !== undefined) {
                this.bot = User.from(data.bot);
            }
        }

        if (data.bot_public !== undefined) {
            this.botPublic = data.bot_public;
        }

        if (data.bot_require_code_grant !== undefined) {
            this.botRequireCodeGrant = data.bot_require_code_grant;
        }

        if ("cover_image" in data) {
            if (data.cover_image === null) {
                this.coverImage = undefined;
            } else if (data.cover_image !== undefined) {
                this.coverImage = data.cover_image;
            }
        }

        if ("custom_install_url" in data) {
            if (data.custom_install_url === null) {
                this.customInstallUrl = undefined;
            } else if (data.custom_install_url !== undefined) {
                this.customInstallUrl = data.custom_install_url;
            }
        }

        if (data.description !== undefined) {
            this.description = data.description.trim();
        }

        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else if (data.flags !== undefined) {
                this.flags = data.flags;
            }
        }

        if ("guild" in data) {
            if (data.guild === null) {
                this.guild = undefined;
            } else if (data.guild !== undefined) {
                this.guild = Guild.from(data.guild);
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else if (data.guild_id !== undefined) {
                this.guildId = data.guild_id;
            }
        }

        if (data.icon !== undefined) {
            this.icon = data.icon;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("install_params" in data) {
            if (data.install_params === null) {
                this.installParams = undefined;
            } else if (data.install_params !== undefined) {
                this.installParams = ApplicationInstallParam.from(data.install_params);
            }
        }

        if ("integration_types_config" in data) {
            if (data.integration_types_config === null) {
                this.integrationTypesConfig = undefined;
            } else if (data.integration_types_config !== undefined) {
                this.integrationTypesConfig = Object.fromEntries(
                    Object.entries(data.integration_types_config).map(([key, value]) => [
                        key,
                        ApplicationIntegrationTypeConfiguration.from(value),
                    ])
                );
            }
        }

        if ("interactions_endpoint_url" in data) {
            if (data.interactions_endpoint_url === null) {
                this.interactionsEndpointUrl = undefined;
            } else if (data.interactions_endpoint_url !== undefined) {
                this.interactionsEndpointUrl = data.interactions_endpoint_url;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name.trim();
        }

        if ("owner" in data) {
            if (data.owner === null) {
                this.owner = undefined;
            } else if (data.owner !== undefined) {
                this.owner = User.from(data.owner);
            }
        }

        if ("primary_sku_id" in data) {
            if (data.primary_sku_id === null) {
                this.primarySkuId = undefined;
            } else if (data.primary_sku_id !== undefined) {
                this.primarySkuId = data.primary_sku_id;
            }
        }

        if ("privacy_policy_url" in data) {
            if (data.privacy_policy_url === null) {
                this.privacyPolicyUrl = undefined;
            } else if (data.privacy_policy_url !== undefined) {
                this.privacyPolicyUrl = data.privacy_policy_url;
            }
        }

        if ("redirect_uris" in data) {
            if (data.redirect_uris === null) {
                this.redirectUris = undefined;
            } else if (data.redirect_uris !== undefined) {
                this.redirectUris = data.redirect_uris;
            }
        }

        if ("role_connections_verification_url" in data) {
            if (data.role_connections_verification_url === null) {
                this.roleConnectionsVerificationUrl = undefined;
            } else if (data.role_connections_verification_url !== undefined) {
                this.roleConnectionsVerificationUrl = data.role_connections_verification_url;
            }
        }

        if ("rpc_origins" in data) {
            if (data.rpc_origins === null) {
                this.rpcOrigins = undefined;
            } else if (data.rpc_origins !== undefined) {
                this.rpcOrigins = data.rpc_origins;
            }
        }

        if ("slug" in data) {
            if (data.slug === null) {
                this.slug = undefined;
            } else if (data.slug !== undefined) {
                this.slug = data.slug.trim();
            }
        }

        if (data.summary !== undefined) {
            this.summary = data.summary.trim();
        }

        if ("tags" in data) {
            if (data.tags === null) {
                this.tags = undefined;
            } else if (data.tags !== undefined) {
                this.tags = data.tags;
            }
        }

        if ("team" in data) {
            if (data.team === null) {
                this.team = undefined;
            } else if (data.team !== undefined) {
                this.team = Team.from(data.team);
            }
        }

        if ("terms_of_service_url" in data) {
            if (data.terms_of_service_url === null) {
                this.termsOfServiceUrl = undefined;
            } else if (data.terms_of_service_url !== undefined) {
                this.termsOfServiceUrl = data.terms_of_service_url;
            }
        }

        if (data.verify_key !== undefined) {
            this.verifyKey = data.verify_key;
        }
    }
}
