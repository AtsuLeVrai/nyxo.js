import type { AvailableLocales, OAuth2Scopes } from "../enums/index.js";
import type { Integer, Snowflake } from "../markdown/index.js";
import type { GuildStructure } from "./guilds.js";
import type { TeamStructure } from "./teams.js";
import type { UserStructure } from "./users.js";

/**
 * Enumeration representing the types of application role connection metadata.
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type|Application Role Connection Metadata Type}
 */
export enum ApplicationRoleConnectionMetadataType {
    /**
     * The metadata value (integer) is less than or equal to the guild's configured value (integer).
     */
    IntegerLessThanOrEqual = 1,
    /**
     * The metadata value (integer) is greater than or equal to the guild's configured value (integer).
     */
    IntegerGreaterThanOrEqual = 2,
    /**
     * The metadata value (integer) is equal to the guild's configured value (integer).
     */
    IntegerEqual = 3,
    /**
     * The metadata value (integer) is not equal to the guild's configured value (integer).
     */
    IntegerNotEqual = 4,
    /**
     * The metadata value (ISO8601 string) is less than or equal to the guild's configured value (integer; days before current date).
     */
    DatetimeLessThanOrEqual = 5,
    /**
     * The metadata value (ISO8601 string) is greater than or equal to the guild's configured value (integer; days before current date).
     */
    DatetimeGreaterThanOrEqual = 6,
    /**
     * The metadata value (integer) is equal to the guild's configured value (integer; 1).
     */
    BooleanEqual = 7,
    /**
     * The metadata value (integer) is not equal to the guild's configured value (integer; 1).
     */
    BooleanNotEqual = 8,
}

/**
 * Type representing the structure of application role connection metadata.
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure|Application Role Connection Metadata Structure}
 */
export type ApplicationRoleConnectionMetadataStructure = {
    /**
     * Description of the metadata field (1-200 characters).
     */
    description: string;
    /**
     * Translations of the description.
     */
    description_localizations?: AvailableLocales;
    /**
     * Dictionary key for the metadata field (must be a-z, 0-9, or _ characters; 1-50 characters).
     */
    key: string;
    /**
     * Name of the metadata field (1-100 characters).
     */
    name: string;
    /**
     * Translations of the name.
     */
    name_localizations?: AvailableLocales;
    /**
     * Type of metadata value.
     */
    type: ApplicationRoleConnectionMetadataType;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure|Install Params Structure}
 */
export type InstallParamsStructure = {
    /**
     * Permissions to request for the bot role.
     *
     * @todo I don't know this might be a string or BitfieldResolvable<BitwisePermissions>
     */
    permissions: string;
    /**
     * Scopes to add the application to the server with.
     */
    scopes: OAuth2Scopes[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags|Application Flags}
 */
export enum ApplicationFlags {
    /**
     * Indicates if an app uses the Auto Moderation API.
     */
    AutoModerationRuleCreateBadge = 64,
    /**
     * Intent required for bots in 100 or more servers to receive presence_update events.
     */
    GatewayPresence = 4_096,
    /**
     * Intent required for bots in under 100 servers to receive presence_update events, found on the Bot page in your app's settings.
     */
    GatewayPresenceLimited = 8_192,
    /**
     * Intent required for bots in 100 or more servers to receive member-related events like guild_member_add.
     */
    GatewayGuildMembers = 16_384,
    /**
     * Intent required for bots in under 100 servers to receive member-related events like guild_member_add, found on the Bot page in your app's settings.
     */
    GatewayGuildMembersLimited = 32_768,
    /**
     * Indicates unusual growth of an app that prevents verification.
     */
    VerificationPendingGuildLimit = 65_536,
    /**
     * Indicates if an app is embedded within the Discord client (currently unavailable publicly).
     */
    Embedded = 131_072,
    /**
     * Intent required for bots in 100 or more servers to receive message content.
     */
    GatewayMessageContent = 262_144,
    /**
     * Intent required for bots in under 100 servers to receive message content, found on the Bot page in your app's settings.
     */
    GatewayMessageContentLimited = 524_288,
    /**
     * Indicates if an app has registered global application commands.
     */
    ApplicationCommandBadge = 8_388_608,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object|Integration Type Configuration Object}
 */
export type IntegrationTypeConfigurationStructure = {
    /**
     * Install params for each installation context's default in-app authorization link.
     */
    oauth2_install_params: InstallParamsStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types|Application Integration Types}
 */
export enum ApplicationIntegrationTypes {
    /**
     * App is installable to servers.
     */
    GuildInstall = 0,
    /**
     * App is installable to users.
     */
    UserInstall = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure|Application Structure}
 */
export type ApplicationStructure = {
    /**
     * Approximate count of guilds the app has been added to.
     */
    approximate_guild_count?: Integer;
    /**
     * Approximate count of users that have installed the app.
     */
    approximate_user_install_count?: Integer;
    /**
     * Partial user object for the bot user associated with the app.
     *
     * @todo No information available in the Discord API documentation
     */
    bot?: Partial<UserStructure>;
    /**
     * When false, only the app owner can add the app to guilds.
     */
    bot_public: boolean;
    /**
     * When true, the app's bot will only join upon completion of the full OAuth2 code grant flow.
     */
    bot_require_code_grant: boolean;
    /**
     * App's default rich presence invite cover image hash.
     */
    cover_image?: string;
    /**
     * Default custom authorization URL for the app, if enabled.
     */
    custom_install_url?: string;
    /**
     * Description of the app.
     */
    description: string;
    /**
     * App's public flags.
     */
    flags?: ApplicationFlags;
    /**
     * Partial object of the associated guild.
     *
     * @todo No information available in the Discord API documentation
     */
    guild?: Partial<GuildStructure>;
    /**
     * Guild associated with the app. For example, a developer support server.
     */
    guild_id?: Snowflake;
    /**
     * Icon hash of the app.
     */
    icon: string | null;
    /**
     * ID of the app.
     */
    id: Snowflake;
    /**
     * Settings for the app's default in-app authorization link, if enabled.
     */
    install_params?: InstallParamsStructure;
    /**
     * Default scopes and permissions for each supported installation context. Value for each key is an integration type configuration object.
     */
    integration_types_config?: Record<ApplicationIntegrationTypes, IntegrationTypeConfigurationStructure>;
    /**
     * Interactions endpoint URL for the app.
     */
    interactions_endpoint_url?: string | null;
    /**
     * Name of the app.
     */
    name: string;
    /**
     * Partial user object for the owner of the app.
     *
     * @todo Verify if this is correct
     */
    owner?: Pick<UserStructure, "avatar" | "discriminator" | "flags" | "id" | "username">;
    /**
     * If this app is a game sold on Discord, this field will be the id of the "Game SKU" that is created, if exists.
     */
    primary_sku_id?: Snowflake;
    /**
     * URL of the app's Privacy Policy.
     */
    privacy_policy_url?: string;
    /**
     * Array of redirect URIs for the app.
     */
    redirect_uris?: string[];
    /**
     * Role connection verification URL for the app.
     */
    role_connections_verification_url?: string | null;
    /**
     * List of RPC origin URLs, if RPC is enabled.
     */
    rpc_origins?: string[];
    /**
     * If this app is a game sold on Discord, this field will be the URL slug that links to the store page.
     */
    slug?: string;
    /**
     * List of tags describing the content and functionality of the app. Max of 5 tags.
     */
    tags?: string[];
    /**
     * If the app belongs to a team, this will be a list of the members of that team.
     */
    team: TeamStructure | null;
    /**
     * URL of the app's Terms of Service.
     */
    terms_of_service_url?: string;
    /**
     * Hex encoded key for verification in interactions and the GameSDK's GetTicket.
     */
    verify_key: string;
};
