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
    #metadata: Record<string, ApplicationRoleConnectionMetadataStructure> = {};
    #platformName: string | null = null;
    #platformUsername: string | null = null;

    constructor(data: Partial<ApplicationRoleConnectionStructure>) {
        this.patch(data);
    }

    get metadata() {
        return { ...this.#metadata };
    }

    get platformName() {
        return this.#platformName;
    }

    get platformUsername() {
        return this.#platformUsername;
    }

    patch(data: Partial<ApplicationRoleConnectionStructure>): void {
        if (!data) {
            return;
        }

        this.#metadata = data.metadata ?? this.#metadata;
        this.#platformName = data.platform_name ?? this.#platformName;
        this.#platformUsername = data.platform_username ?? this.#platformUsername;
    }

    toJSON(): Partial<ApplicationRoleConnectionStructure> {
        return {
            metadata: this.#metadata,
            platform_name: this.#platformName,
            platform_username: this.#platformUsername,
        };
    }
}

export class Connection {
    #friendSync = false;
    #id: string | null = null;
    /**
     * @todo No information available in the Discord API documentation
     * @todo Change to Integration
     */
    #integrations: Partial<IntegrationStructure>[] = [];
    #name: string | null = null;
    #revoked = false;
    #showActivity = false;
    #twoWayLink = false;
    #type: ConnectionServices | null = null;
    #verified = false;
    #visibility: ConnectionVisibilityTypes | null = null;

    constructor(data: Partial<ConnectionStructure>) {
        this.patch(data);
    }

    get friendSync() {
        return this.#friendSync;
    }

    get id() {
        return this.#id;
    }

    get integrations() {
        return [...this.#integrations];
    }

    get name() {
        return this.#name;
    }

    get revoked() {
        return this.#revoked;
    }

    get showActivity() {
        return this.#showActivity;
    }

    get twoWayLink() {
        return this.#twoWayLink;
    }

    get type() {
        return this.#type;
    }

    get verified() {
        return this.#verified;
    }

    get visibility() {
        return this.#visibility;
    }

    patch(data: Partial<ConnectionStructure>): void {
        if (!data) {
            return;
        }

        this.#friendSync = data.friend_sync ?? this.#friendSync;
        this.#id = data.id ?? this.#id;
        this.#integrations = data.integrations ?? this.#integrations;
        this.#name = data.name ?? this.#name;
        this.#revoked = data.revoked ?? this.#revoked;
        this.#showActivity = data.show_activity ?? this.#showActivity;
        this.#twoWayLink = data.two_way_link ?? this.#twoWayLink;
        this.#type = data.type ?? this.#type;
        this.#verified = data.verified ?? this.#verified;
        this.#visibility = data.visibility ?? this.#visibility;
    }

    toJSON(): Partial<ConnectionStructure> {
        return {
            friend_sync: this.#friendSync,
            id: this.#id ?? undefined,
            integrations: this.#integrations,
            name: this.#name ?? undefined,
            revoked: this.#revoked,
            show_activity: this.#showActivity,
            two_way_link: this.#twoWayLink,
            type: this.#type ?? undefined,
            verified: this.#verified,
            visibility: this.#visibility ?? undefined,
        };
    }
}

export class AvatarDecorationData {
    #asset: string | null = null;
    #skuId: string | null = null;

    constructor(data: Partial<AvatarDecorationDataStructure>) {
        this.patch(data);
    }

    get asset() {
        return this.#asset;
    }

    get skuId() {
        return this.#skuId;
    }

    patch(data: Partial<AvatarDecorationDataStructure>): void {
        if (!data) {
            return;
        }

        this.#asset = data.asset ?? this.#asset;
        this.#skuId = data.sku_id ?? this.#skuId;
    }

    toJSON(): Partial<AvatarDecorationDataStructure> {
        return {
            asset: this.#asset ?? undefined,
            sku_id: this.#skuId ?? undefined,
        };
    }
}

export class User {
    #accentColor: Integer | null = null;
    #avatar: string | null = null;
    #avatarDecorationData: AvatarDecorationDataStructure | null = null;
    #banner: string | null = null;
    #bot = false;
    #discriminator: string | null = null;
    #email: string | null = null;
    #flags: UserFlags | null = null;
    #globalName: string | null = null;
    #id: Snowflake | null = null;
    #locale: LocaleKeys | null = null;
    #mfaEnabled = false;
    #premiumType: PremiumTypes | null = null;
    #publicFlags: UserFlags | null = null;
    #system = false;
    #username: string | null = null;
    #verified = false;

    constructor(data: Partial<UserStructure>) {
        this.patch(data);
    }

    get accentColor() {
        return this.#accentColor;
    }

    get avatar() {
        return this.#avatar;
    }

    get avatarDecorationData() {
        return this.#avatarDecorationData;
    }

    get banner() {
        return this.#banner;
    }

    get bot() {
        return this.#bot;
    }

    get discriminator() {
        return this.#discriminator;
    }

    get email() {
        return this.#email;
    }

    get flags() {
        return this.#flags;
    }

    get globalName() {
        return this.#globalName;
    }

    get id() {
        return this.#id;
    }

    get locale() {
        return this.#locale;
    }

    get mfaEnabled() {
        return this.#mfaEnabled;
    }

    get premiumType() {
        return this.#premiumType;
    }

    get publicFlags() {
        return this.#publicFlags;
    }

    get system() {
        return this.#system;
    }

    get username() {
        return this.#username;
    }

    get verified() {
        return this.#verified;
    }

    patch(data: Partial<UserStructure>): void {
        if (!data) {
            return;
        }

        this.#accentColor = data.accent_color ?? this.#accentColor;
        this.#avatar = data.avatar ?? this.#avatar;
        this.#avatarDecorationData = data.avatar_decoration_data ?? this.#avatarDecorationData;
        this.#banner = data.banner ?? this.#banner;
        this.#bot = data.bot ?? this.#bot;
        this.#discriminator = data.discriminator ?? this.#discriminator;
        this.#email = data.email ?? this.#email;
        this.#flags = data.flags ?? this.#flags;
        this.#globalName = data.global_name ?? this.#globalName;
        this.#id = data.id ?? this.#id;
        this.#locale = data.locale ?? this.#locale;
        this.#mfaEnabled = data.mfa_enabled ?? this.#mfaEnabled;
        this.#premiumType = data.premium_type ?? this.#premiumType;
        this.#publicFlags = data.public_flags ?? this.#publicFlags;
        this.#system = data.system ?? this.#system;
        this.#username = data.username ?? this.#username;
        this.#verified = data.verified ?? this.#verified;
    }

    toJSON(): Partial<UserStructure> {
        return {
            accent_color: this.#accentColor,
            avatar: this.#avatar,
            avatar_decoration_data: this.#avatarDecorationData,
            banner: this.#banner,
            bot: this.#bot,
            discriminator: this.#discriminator ?? undefined,
            email: this.#email,
            flags: this.#flags ?? undefined,
            global_name: this.#globalName,
            id: this.#id ?? undefined,
            locale: this.#locale ?? undefined,
            mfa_enabled: this.#mfaEnabled,
            premium_type: this.#premiumType ?? undefined,
            public_flags: this.#publicFlags ?? undefined,
            system: this.#system,
            username: this.#username ?? undefined,
            verified: this.#verified,
        };
    }
}
