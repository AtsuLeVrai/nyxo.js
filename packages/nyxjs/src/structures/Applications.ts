import type {
    ApplicationFlags,
    ApplicationIntegrationTypes,
    ApplicationRoleConnectionMetadataStructure,
    ApplicationRoleConnectionMetadataType,
    ApplicationStructure,
    AvailableLocales,
    InstallParamsStructure,
    Integer,
    IntegrationTypeConfigurationStructure,
    OAuth2Scopes,
    Snowflake,
    TeamStructure,
    UserStructure,
} from "@nyxjs/core";
import { Base } from "./Base.js";
import { Guild } from "./Guilds.js";
import { Team } from "./Teams.js";
import { User } from "./Users.js";

export interface ApplicationRoleConnectionMetadataSchema {
    readonly description: string | null;
    readonly descriptionLocalizations: AvailableLocales | null;
    readonly key: string | null;
    readonly name: string | null;
    readonly nameLocalizations: AvailableLocales | null;
    readonly type: ApplicationRoleConnectionMetadataType | null;
}

export class ApplicationRoleConnectionMetadata
    extends Base<ApplicationRoleConnectionMetadataStructure, ApplicationRoleConnectionMetadataSchema>
    implements ApplicationRoleConnectionMetadataSchema
{
    #description: string | null = null;
    #descriptionLocalizations: AvailableLocales | null = null;
    #key: string | null = null;
    #name: string | null = null;
    #nameLocalizations: AvailableLocales | null = null;
    #type: ApplicationRoleConnectionMetadataType | null = null;

    constructor(data: Partial<ApplicationRoleConnectionMetadataStructure>) {
        super();
        this.patch(data);
    }

    get description(): string | null {
        return this.#description;
    }

    get descriptionLocalizations(): AvailableLocales | null {
        return this.#descriptionLocalizations;
    }

    get key(): string | null {
        return this.#key;
    }

    get name(): string | null {
        return this.#name;
    }

    get nameLocalizations(): AvailableLocales | null {
        return this.#nameLocalizations;
    }

    get type(): ApplicationRoleConnectionMetadataType | null {
        return this.#type;
    }

    static from(data: Partial<ApplicationRoleConnectionMetadataStructure>): ApplicationRoleConnectionMetadata {
        return new ApplicationRoleConnectionMetadata(data);
    }

    patch(data: Partial<ApplicationRoleConnectionMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.description !== undefined) {
            if (typeof data.description !== "string") {
                throw new TypeError(`Expected string for description, got ${typeof data.description}`);
            }
            if (data.description.length === 0 || data.description.length > 200) {
                throw new RangeError("Description must be between 1 and 200 characters");
            }
            this.#description = data.description;
        }

        this.#descriptionLocalizations = data.description_localizations ?? this.#descriptionLocalizations;

        if (data.key !== undefined) {
            if (typeof data.key !== "string") {
                throw new TypeError(`Expected string for key, got ${typeof data.key}`);
            }
            if (data.key.length === 0 || data.key.length > 50) {
                throw new RangeError("Key must be between 1 and 50 characters");
            }
            if (!/^[a-z0-9_]+$/.test(data.key)) {
                throw new Error("Key must contain only a-z, 0-9, or _");
            }
            this.#key = data.key;
        }

        if (data.name !== undefined) {
            if (typeof data.name !== "string") {
                throw new TypeError(`Expected string for name, got ${typeof data.name}`);
            }
            if (data.name.length === 0 || data.name.length > 100) {
                throw new RangeError("Name must be between 1 and 100 characters");
            }
            this.#name = data.name;
        }

        this.#nameLocalizations = data.name_localizations ?? this.#nameLocalizations;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<ApplicationRoleConnectionMetadataStructure> {
        return {
            description: this.#description ?? undefined,
            description_localizations: this.#descriptionLocalizations ?? undefined,
            key: this.#key ?? undefined,
            name: this.#name ?? undefined,
            name_localizations: this.#nameLocalizations ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ApplicationRoleConnectionMetadataSchema {
        return {
            description: this.#description,
            descriptionLocalizations: this.#descriptionLocalizations,
            key: this.#key,
            name: this.#name,
            nameLocalizations: this.#nameLocalizations,
            type: this.#type,
        };
    }

    clone(): ApplicationRoleConnectionMetadata {
        return new ApplicationRoleConnectionMetadata(this.toJson());
    }

    reset(): void {
        this.#description = null;
        this.#descriptionLocalizations = null;
        this.#key = null;
        this.#name = null;
        this.#nameLocalizations = null;
        this.#type = null;
    }

    equals(other: Partial<ApplicationRoleConnectionMetadata>): boolean {
        return Boolean(
            this.#description === other.description &&
                JSON.stringify(this.#descriptionLocalizations) === JSON.stringify(other.descriptionLocalizations) &&
                this.#key === other.key &&
                this.#name === other.name &&
                JSON.stringify(this.#nameLocalizations) === JSON.stringify(other.nameLocalizations) &&
                this.#type === other.type,
        );
    }
}

export interface InstallParamsSchema {
    readonly permissions: string | null;
    readonly scopes: OAuth2Scopes[];
}

export class InstallParams extends Base<InstallParamsStructure, InstallParamsSchema> implements InstallParamsSchema {
    #permissions: string | null = null;
    #scopes: OAuth2Scopes[] = [];

    constructor(data: Partial<InstallParamsStructure>) {
        super();
        this.patch(data);
    }

    get permissions(): string | null {
        return this.#permissions;
    }

    get scopes(): OAuth2Scopes[] {
        return [...this.#scopes];
    }

    static from(data: Partial<InstallParamsStructure>): InstallParams {
        return new InstallParams(data);
    }

    patch(data: Partial<InstallParamsStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#permissions = data.permissions ?? this.#permissions;
        this.#scopes = data.scopes ? [...data.scopes] : this.#scopes;
    }

    toJson(): Partial<InstallParamsStructure> {
        return {
            permissions: this.#permissions ?? undefined,
            scopes: [...this.#scopes],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): InstallParamsSchema {
        return {
            permissions: this.#permissions,
            scopes: [...this.#scopes],
        };
    }

    clone(): InstallParams {
        return new InstallParams(this.toJson());
    }

    reset(): void {
        this.#permissions = null;
        this.#scopes = [];
    }

    equals(other: Partial<InstallParams>): boolean {
        return Boolean(
            this.#permissions === other.permissions && JSON.stringify(this.#scopes) === JSON.stringify(other.scopes),
        );
    }
}

export interface IntegrationTypeConfigurationSchema {
    readonly oauth2InstallParams: InstallParams | null;
}

export class IntegrationTypeConfiguration
    extends Base<IntegrationTypeConfigurationStructure, IntegrationTypeConfigurationSchema>
    implements IntegrationTypeConfigurationSchema
{
    #oauth2InstallParams: InstallParams | null = null;

    constructor(data: Partial<IntegrationTypeConfigurationStructure>) {
        super();
        this.patch(data);
    }

    get oauth2InstallParams(): InstallParams | null {
        return this.#oauth2InstallParams;
    }

    static from(data: Partial<IntegrationTypeConfigurationStructure>): IntegrationTypeConfiguration {
        return new IntegrationTypeConfiguration(data);
    }

    patch(data: Partial<IntegrationTypeConfigurationStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#oauth2InstallParams = data.oauth2_install_params
            ? InstallParams.from(data.oauth2_install_params)
            : this.#oauth2InstallParams;
    }

    toJson(): Partial<IntegrationTypeConfigurationStructure> {
        return {
            oauth2_install_params: this.#oauth2InstallParams?.toJson() as InstallParamsStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): IntegrationTypeConfigurationSchema {
        return {
            oauth2InstallParams: this.#oauth2InstallParams,
        };
    }

    clone(): IntegrationTypeConfiguration {
        return new IntegrationTypeConfiguration(this.toJson());
    }

    reset(): void {
        this.#oauth2InstallParams = null;
    }

    equals(other: Partial<IntegrationTypeConfiguration>): boolean {
        return Boolean(this.#oauth2InstallParams?.equals(other.oauth2InstallParams ?? {}));
    }
}

export interface ApplicationSchema {
    readonly approximateGuildCount: Integer | null;
    readonly approximateUserInstallCount: Integer | null;
    readonly bot: User | null;
    readonly botPublic: boolean;
    readonly botRequireCodeGrant: boolean;
    readonly coverImage: string | null;
    readonly customInstallUrl: string | null;
    readonly description: string | null;
    readonly flags: ApplicationFlags | null;
    readonly guild: Guild | null;
    readonly guildId: Snowflake | null;
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly installParams: InstallParams | null;
    readonly integrationTypesConfig: Record<ApplicationIntegrationTypes, IntegrationTypeConfiguration> | null;
    readonly interactionsEndpointUrl: string | null;
    readonly name: string | null;
    readonly owner: User | null;
    readonly primarySkuId: Snowflake | null;
    readonly privacyPolicyUrl: string | null;
    readonly redirectUris: string[];
    readonly roleConnectionsVerificationUrl: string | null;
    readonly rpcOrigins: string[];
    readonly slug: string | null;
    readonly tags: string[];
    readonly team: Team | null;
    readonly termsOfServiceUrl: string | null;
    readonly verifyKey: string | null;
}

export class Application extends Base<ApplicationStructure, ApplicationSchema> implements ApplicationSchema {
    #approximateGuildCount: Integer | null = null;
    #approximateUserInstallCount: Integer | null = null;
    #bot: User | null = null;
    #botPublic = false;
    #botRequireCodeGrant = false;
    #coverImage: string | null = null;
    #customInstallUrl: string | null = null;
    #description: string | null = null;
    #flags: ApplicationFlags | null = null;
    #guild: Guild | null = null;
    #guildId: Snowflake | null = null;
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #installParams: InstallParams | null = null;
    #integrationTypesConfig: Record<ApplicationIntegrationTypes, IntegrationTypeConfiguration> | null = null;
    #interactionsEndpointUrl: string | null = null;
    #name: string | null = null;
    #owner: User | null = null;
    #primarySkuId: Snowflake | null = null;
    #privacyPolicyUrl: string | null = null;
    #redirectUris: string[] = [];
    #roleConnectionsVerificationUrl: string | null = null;
    #rpcOrigins: string[] = [];
    #slug: string | null = null;
    #tags: string[] = [];
    #team: Team | null = null;
    #termsOfServiceUrl: string | null = null;
    #verifyKey: string | null = null;

    constructor(data: Partial<ApplicationStructure>) {
        super();
        this.patch(data);
    }

    get approximateGuildCount(): Integer | null {
        return this.#approximateGuildCount;
    }

    get approximateUserInstallCount(): Integer | null {
        return this.#approximateUserInstallCount;
    }

    get bot(): User | null {
        return this.#bot;
    }

    get botPublic(): boolean {
        return this.#botPublic;
    }

    get botRequireCodeGrant(): boolean {
        return this.#botRequireCodeGrant;
    }

    get coverImage(): string | null {
        return this.#coverImage;
    }

    get customInstallUrl(): string | null {
        return this.#customInstallUrl;
    }

    get description(): string | null {
        return this.#description;
    }

    get flags(): ApplicationFlags | null {
        return this.#flags;
    }

    get guild(): Guild | null {
        return this.#guild;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get installParams(): InstallParams | null {
        return this.#installParams;
    }

    get integrationTypesConfig(): Record<ApplicationIntegrationTypes, IntegrationTypeConfiguration> | null {
        return this.#integrationTypesConfig;
    }

    get interactionsEndpointUrl(): string | null {
        return this.#interactionsEndpointUrl;
    }

    get name(): string | null {
        return this.#name;
    }

    get owner(): User | null {
        return this.#owner;
    }

    get primarySkuId(): Snowflake | null {
        return this.#primarySkuId;
    }

    get privacyPolicyUrl(): string | null {
        return this.#privacyPolicyUrl;
    }

    get redirectUris(): string[] {
        return [...this.#redirectUris];
    }

    get roleConnectionsVerificationUrl(): string | null {
        return this.#roleConnectionsVerificationUrl;
    }

    get rpcOrigins(): string[] {
        return [...this.#rpcOrigins];
    }

    get slug(): string | null {
        return this.#slug;
    }

    get tags(): string[] {
        return [...this.#tags];
    }

    get team(): Team | null {
        return this.#team;
    }

    get termsOfServiceUrl(): string | null {
        return this.#termsOfServiceUrl;
    }

    get verifyKey(): string | null {
        return this.#verifyKey;
    }

    static from(data: Partial<ApplicationStructure>): Application {
        return new Application(data);
    }

    patch(data: Partial<ApplicationStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#approximateGuildCount = data.approximate_guild_count ?? this.#approximateGuildCount;
        this.#approximateUserInstallCount = data.approximate_user_install_count ?? this.#approximateUserInstallCount;
        this.#bot = data.bot ? User.from(data.bot) : this.#bot;
        this.#botPublic = Boolean(data.bot_public ?? this.#botPublic);
        this.#botRequireCodeGrant = Boolean(data.bot_require_code_grant ?? this.#botRequireCodeGrant);
        this.#coverImage = data.cover_image ?? this.#coverImage;
        this.#customInstallUrl = data.custom_install_url ?? this.#customInstallUrl;
        this.#description = data.description ?? this.#description;
        this.#flags = data.flags ?? this.#flags;
        this.#guild = data.guild ? Guild.from(data.guild) : this.#guild;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#installParams = data.install_params ? InstallParams.from(data.install_params) : this.#installParams;

        if (data.integration_types_config) {
            this.#integrationTypesConfig = {} as Record<ApplicationIntegrationTypes, IntegrationTypeConfiguration>;
            for (const [key, value] of Object.entries(data.integration_types_config)) {
                this.#integrationTypesConfig[key as unknown as ApplicationIntegrationTypes] =
                    IntegrationTypeConfiguration.from(value);
            }
        }

        this.#interactionsEndpointUrl = data.interactions_endpoint_url ?? this.#interactionsEndpointUrl;
        this.#name = data.name ?? this.#name;
        this.#owner = data.owner ? User.from(data.owner) : this.#owner;
        this.#primarySkuId = data.primary_sku_id ?? this.#primarySkuId;
        this.#privacyPolicyUrl = data.privacy_policy_url ?? this.#privacyPolicyUrl;
        this.#redirectUris = data.redirect_uris ? [...data.redirect_uris] : this.#redirectUris;
        this.#roleConnectionsVerificationUrl =
            data.role_connections_verification_url ?? this.#roleConnectionsVerificationUrl;
        this.#rpcOrigins = data.rpc_origins ? [...data.rpc_origins] : this.#rpcOrigins;
        this.#slug = data.slug ?? this.#slug;
        this.#tags = data.tags ? [...data.tags] : this.#tags;
        this.#team = data.team ? Team.from(data.team) : this.#team;
        this.#termsOfServiceUrl = data.terms_of_service_url ?? this.#termsOfServiceUrl;
        this.#verifyKey = data.verify_key ?? this.#verifyKey;
    }

    toJson(): Partial<ApplicationStructure> {
        return {
            approximate_guild_count: this.#approximateGuildCount ?? undefined,
            approximate_user_install_count: this.#approximateUserInstallCount ?? undefined,
            bot: this.#bot?.toJson(),
            bot_public: this.#botPublic,
            bot_require_code_grant: this.#botRequireCodeGrant,
            cover_image: this.#coverImage ?? undefined,
            custom_install_url: this.#customInstallUrl ?? undefined,
            description: this.#description ?? undefined,
            flags: this.#flags ?? undefined,
            guild: this.#guild?.toJson(),
            guild_id: this.#guildId ?? undefined,
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            install_params: this.#installParams?.toJson() as InstallParamsStructure,
            integration_types_config: (this.#integrationTypesConfig
                ? Object.fromEntries(
                      Object.entries(this.#integrationTypesConfig).map(([key, value]) => [key, value.toJson()]),
                  )
                : undefined) as Record<ApplicationIntegrationTypes, IntegrationTypeConfigurationStructure>,
            interactions_endpoint_url: this.#interactionsEndpointUrl ?? undefined,
            name: this.#name ?? undefined,
            owner: this.#owner?.toJson() as UserStructure,
            primary_sku_id: this.#primarySkuId ?? undefined,
            privacy_policy_url: this.#privacyPolicyUrl ?? undefined,
            redirect_uris: this.#redirectUris.length > 0 ? [...this.#redirectUris] : undefined,
            role_connections_verification_url: this.#roleConnectionsVerificationUrl ?? undefined,
            rpc_origins: this.#rpcOrigins.length > 0 ? [...this.#rpcOrigins] : undefined,
            slug: this.#slug ?? undefined,
            tags: this.#tags.length > 0 ? [...this.#tags] : undefined,
            team: (this.#team?.toJson() ?? null) as TeamStructure,
            terms_of_service_url: this.#termsOfServiceUrl ?? undefined,
            verify_key: this.#verifyKey ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ApplicationSchema {
        return {
            approximateGuildCount: this.#approximateGuildCount,
            approximateUserInstallCount: this.#approximateUserInstallCount,
            bot: this.#bot,
            botPublic: this.#botPublic,
            botRequireCodeGrant: this.#botRequireCodeGrant,
            coverImage: this.#coverImage,
            customInstallUrl: this.#customInstallUrl,
            description: this.#description,
            flags: this.#flags,
            guild: this.#guild,
            guildId: this.#guildId,
            icon: this.#icon,
            id: this.#id,
            installParams: this.#installParams,
            integrationTypesConfig: this.#integrationTypesConfig,
            interactionsEndpointUrl: this.#interactionsEndpointUrl,
            name: this.#name,
            owner: this.#owner,
            primarySkuId: this.#primarySkuId,
            privacyPolicyUrl: this.#privacyPolicyUrl,
            redirectUris: [...this.#redirectUris],
            roleConnectionsVerificationUrl: this.#roleConnectionsVerificationUrl,
            rpcOrigins: [...this.#rpcOrigins],
            slug: this.#slug,
            tags: [...this.#tags],
            team: this.#team,
            termsOfServiceUrl: this.#termsOfServiceUrl,
            verifyKey: this.#verifyKey,
        };
    }

    clone(): Application {
        return new Application(this.toJson());
    }

    reset(): void {
        this.#approximateGuildCount = null;
        this.#approximateUserInstallCount = null;
        this.#bot = null;
        this.#botPublic = false;
        this.#botRequireCodeGrant = false;
        this.#coverImage = null;
        this.#customInstallUrl = null;
        this.#description = null;
        this.#flags = null;
        this.#guild = null;
        this.#guildId = null;
        this.#icon = null;
        this.#id = null;
        this.#installParams = null;
        this.#integrationTypesConfig = null;
        this.#interactionsEndpointUrl = null;
        this.#name = null;
        this.#owner = null;
        this.#primarySkuId = null;
        this.#privacyPolicyUrl = null;
        this.#redirectUris = [];
        this.#roleConnectionsVerificationUrl = null;
        this.#rpcOrigins = [];
        this.#slug = null;
        this.#tags = [];
        this.#team = null;
        this.#termsOfServiceUrl = null;
        this.#verifyKey = null;
    }

    equals(other: Partial<Application>): boolean {
        return Boolean(
            this.#approximateGuildCount === other.approximateGuildCount &&
                this.#approximateUserInstallCount === other.approximateUserInstallCount &&
                this.#bot?.equals(other.bot ?? {}) &&
                this.#botPublic === other.botPublic &&
                this.#botRequireCodeGrant === other.botRequireCodeGrant &&
                this.#coverImage === other.coverImage &&
                this.#customInstallUrl === other.customInstallUrl &&
                this.#description === other.description &&
                this.#flags === other.flags &&
                this.#guild?.equals(other.guild ?? {}) &&
                this.#guildId === other.guildId &&
                this.#icon === other.icon &&
                this.#id === other.id &&
                this.#installParams?.equals(other.installParams ?? {}) &&
                JSON.stringify(this.#integrationTypesConfig) === JSON.stringify(other.integrationTypesConfig) &&
                this.#interactionsEndpointUrl === other.interactionsEndpointUrl &&
                this.#name === other.name &&
                this.#owner?.equals(other.owner ?? {}) &&
                this.#primarySkuId === other.primarySkuId &&
                this.#privacyPolicyUrl === other.privacyPolicyUrl &&
                JSON.stringify(this.#redirectUris) === JSON.stringify(other.redirectUris) &&
                this.#roleConnectionsVerificationUrl === other.roleConnectionsVerificationUrl &&
                JSON.stringify(this.#rpcOrigins) === JSON.stringify(other.rpcOrigins) &&
                this.#slug === other.slug &&
                JSON.stringify(this.#tags) === JSON.stringify(other.tags) &&
                this.#team?.equals(other.team ?? {}) &&
                this.#termsOfServiceUrl === other.termsOfServiceUrl &&
                this.#verifyKey === other.verifyKey,
        );
    }
}
