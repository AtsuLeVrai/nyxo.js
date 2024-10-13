import type {
    ApplicationRoleConnectionMetadataStructure,
    ApplicationRoleConnectionStructure,
    AvatarDecorationDataStructure,
    ConnectionServices,
    ConnectionStructure,
    ConnectionVisibilityTypes,
    Integer,
    IntegrationStructure,
    LocaleKeys,
    PremiumTypes,
    Snowflake,
    UserFlags,
    UserStructure,
} from "@nyxjs/core";

export class ApplicationRoleConnection {
    /**
     * @todo Change to ApplicationRoleConnectionMetadata
     */
    public metadata!: Record<string, ApplicationRoleConnectionMetadataStructure>;

    public platformName!: string | null;

    public platformUsername!: string | null;

    public constructor(data: Partial<ApplicationRoleConnectionStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<ApplicationRoleConnectionStructure>): void {
        if (data.metadata) this.metadata = data.metadata;
        if (data.platform_name) this.platformName = data.platform_name;
        if (data.platform_username) this.platformUsername = data.platform_username;
    }
}

export class Connection {
    public friendSync!: boolean;

    public id!: string;

    /**
     * @todo No information available in the Discord API documentation
     * @todo Change to Integration
     */
    public integrations?: Partial<IntegrationStructure>[];

    public name!: string;

    public revoked?: boolean;

    public showActivity!: boolean;

    public twoWayLink!: boolean;

    public type!: ConnectionServices;

    public verified!: boolean;

    public visibility!: ConnectionVisibilityTypes;

    public constructor(data: Partial<ConnectionStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<ConnectionStructure>): void {
        // eslint-disable-next-line n/no-sync
        if (data.friend_sync) this.friendSync = data.friend_sync;
        if (data.id) this.id = data.id;
        if (data.integrations) this.integrations = data.integrations;
        if (data.name) this.name = data.name;
        if (data.revoked) this.revoked = data.revoked;
        if (data.show_activity) this.showActivity = data.show_activity;
        if (data.two_way_link) this.twoWayLink = data.two_way_link;
        if (data.type) this.type = data.type;
        if (data.verified) this.verified = data.verified;
        if (data.visibility) this.visibility = data.visibility;
    }
}

export class AvatarDecorationData {
    public asset!: string;

    public skuId!: string;

    public constructor(data: Partial<AvatarDecorationDataStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<AvatarDecorationDataStructure>): void {
        if (data.asset) this.asset = data.asset;
        if (data.sku_id) this.skuId = data.sku_id;
    }
}

export class User {
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

    public locale?: LocaleKeys;

    public mfaEnabled?: boolean;

    public premiumType?: PremiumTypes;

    public publicFlags?: UserFlags;

    public system?: boolean;

    public username!: string;

    public verified?: boolean;

    public constructor(data: Partial<UserStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<UserStructure>): void {
        if (data.accent_color) this.accentColor = data.accent_color;
        if (data.avatar) this.avatar = data.avatar;
        if (data.avatar_decoration_data) this.avatarDecorationData = data.avatar_decoration_data;
        if (data.banner) this.banner = data.banner;
        if (data.bot) this.bot = data.bot;
        if (data.discriminator) this.discriminator = data.discriminator;
        if (data.email) this.email = data.email;
        if (data.flags) this.flags = data.flags;
        if (data.global_name) this.globalName = data.global_name;
        if (data.id) this.id = data.id;
        if (data.locale) this.locale = data.locale;
        if (data.mfa_enabled) this.mfaEnabled = data.mfa_enabled;
        if (data.premium_type) this.premiumType = data.premium_type;
        if (data.public_flags) this.publicFlags = data.public_flags;
        if (data.system) this.system = data.system;
        if (data.username) this.username = data.username;
        if (data.verified) this.verified = data.verified;
    }
}
