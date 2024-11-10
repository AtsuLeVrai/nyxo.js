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
import { Base } from "./Base.js";

export interface ApplicationRoleConnectionSchema {
    readonly metadata: Record<string, ApplicationRoleConnectionMetadataStructure>;
    readonly platformName: string | null;
    readonly platformUsername: string | null;
}

export class ApplicationRoleConnection extends Base<
    ApplicationRoleConnectionStructure,
    ApplicationRoleConnectionSchema
> {
    #metadata: Record<string, ApplicationRoleConnectionMetadataStructure> = {};
    #platformName: string | null = null;
    #platformUsername: string | null = null;

    constructor(data: Partial<ApplicationRoleConnectionStructure>) {
        super();
        this.patch(data);
    }

    get metadata(): Record<string, ApplicationRoleConnectionMetadataStructure> {
        return { ...this.#metadata };
    }

    get platformName(): string | null {
        return this.#platformName;
    }

    get platformUsername(): string | null {
        return this.#platformUsername;
    }

    static from(data: Partial<ApplicationRoleConnectionStructure>): ApplicationRoleConnection {
        return new ApplicationRoleConnection(data);
    }

    patch(data: Partial<ApplicationRoleConnectionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#metadata = data.metadata ?? this.#metadata;
        this.#platformName = data.platform_name ?? this.#platformName;
        this.#platformUsername = data.platform_username ?? this.#platformUsername;
    }

    toJson(): Partial<ApplicationRoleConnectionStructure> {
        return {
            metadata: this.#metadata,
            platform_name: this.#platformName,
            platform_username: this.#platformUsername,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ApplicationRoleConnectionSchema {
        return {
            metadata: this.#metadata,
            platformName: this.#platformName,
            platformUsername: this.#platformUsername,
        };
    }

    clone(): ApplicationRoleConnection {
        return new ApplicationRoleConnection(this.toJson());
    }

    reset(): void {
        this.#metadata = {};
        this.#platformName = null;
        this.#platformUsername = null;
    }

    equals(other: Partial<ApplicationRoleConnection>): boolean {
        return (
            JSON.stringify(this.#metadata) === JSON.stringify(other.metadata) &&
            this.#platformName === other.platformName &&
            this.#platformUsername === other.platformUsername
        );
    }
}

export interface ConnectionSchema {
    readonly friendSync: boolean;
    readonly id: string | null;
    readonly integrations: Partial<IntegrationStructure>[];
    readonly name: string | null;
    readonly revoked: boolean;
    readonly showActivity: boolean;
    readonly twoWayLink: boolean;
    readonly type: ConnectionServices | null;
    readonly verified: boolean;
    readonly visibility: ConnectionVisibilityTypes | null;
}

export class Connection extends Base<ConnectionStructure, ConnectionSchema> {
    #friendSync = false;
    #id: string | null = null;
    #integrations: Partial<IntegrationStructure>[] = [];
    #name: string | null = null;
    #revoked = false;
    #showActivity = false;
    #twoWayLink = false;
    #type: ConnectionServices | null = null;
    #verified = false;
    #visibility: ConnectionVisibilityTypes | null = null;

    constructor(data: Partial<ConnectionStructure>) {
        super();
        this.patch(data);
    }

    get friendSync(): boolean {
        return this.#friendSync;
    }

    get id(): string | null {
        return this.#id;
    }

    get integrations(): Partial<IntegrationStructure>[] {
        return [...this.#integrations];
    }

    get name(): string | null {
        return this.#name;
    }

    get revoked(): boolean {
        return this.#revoked;
    }

    get showActivity(): boolean {
        return this.#showActivity;
    }

    get twoWayLink(): boolean {
        return this.#twoWayLink;
    }

    get type(): ConnectionServices | null {
        return this.#type;
    }

    get verified(): boolean {
        return this.#verified;
    }

    get visibility(): ConnectionVisibilityTypes | null {
        return this.#visibility;
    }

    static from(data: Partial<ConnectionStructure>): Connection {
        return new Connection(data);
    }

    patch(data: Partial<ConnectionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#friendSync = Boolean(data.friend_sync ?? this.#friendSync);
        this.#id = data.id ?? this.#id;
        this.#integrations = data.integrations ?? this.#integrations;
        this.#name = data.name ?? this.#name;
        this.#revoked = Boolean(data.revoked ?? this.#revoked);
        this.#showActivity = Boolean(data.show_activity ?? this.#showActivity);
        this.#twoWayLink = Boolean(data.two_way_link ?? this.#twoWayLink);
        this.#type = data.type ?? this.#type;
        this.#verified = Boolean(data.verified ?? this.#verified);
        this.#visibility = data.visibility ?? this.#visibility;
    }

    toJson(): Partial<ConnectionStructure> {
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

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ConnectionSchema {
        return {
            friendSync: this.#friendSync,
            id: this.#id,
            integrations: this.#integrations,
            name: this.#name,
            revoked: this.#revoked,
            showActivity: this.#showActivity,
            twoWayLink: this.#twoWayLink,
            type: this.#type,
            verified: this.#verified,
            visibility: this.#visibility,
        };
    }

    clone(): Connection {
        return new Connection(this.toJson());
    }

    reset(): void {
        this.#friendSync = false;
        this.#id = null;
        this.#integrations = [];
        this.#name = null;
        this.#revoked = false;
        this.#showActivity = false;
        this.#twoWayLink = false;
        this.#type = null;
        this.#verified = false;
        this.#visibility = null;
    }

    equals(other: Partial<Connection>): boolean {
        return (
            this.#friendSync === other.friendSync &&
            this.#id === other.id &&
            JSON.stringify(this.#integrations) === JSON.stringify(other.integrations) &&
            this.#name === other.name &&
            this.#revoked === other.revoked &&
            this.#showActivity === other.showActivity &&
            this.#twoWayLink === other.twoWayLink &&
            this.#type === other.type &&
            this.#verified === other.verified &&
            this.#visibility === other.visibility
        );
    }
}

export interface AvatarDecorationDataSchema {
    readonly asset: string | null;
    readonly skuId: string | null;
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure, AvatarDecorationDataSchema> {
    #asset: string | null = null;
    #skuId: string | null = null;

    constructor(data: Partial<AvatarDecorationDataStructure>) {
        super();
        this.patch(data);
    }

    get asset(): string | null {
        return this.#asset;
    }

    get skuId(): string | null {
        return this.#skuId;
    }

    static from(data: Partial<AvatarDecorationDataStructure>): AvatarDecorationData {
        return new AvatarDecorationData(data);
    }

    patch(data: Partial<AvatarDecorationDataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#asset = data.asset ?? this.#asset;
        this.#skuId = data.sku_id ?? this.#skuId;
    }

    toJson(): Partial<AvatarDecorationDataStructure> {
        return {
            asset: this.#asset ?? undefined,
            sku_id: this.#skuId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AvatarDecorationDataSchema {
        return {
            asset: this.#asset,
            skuId: this.#skuId,
        };
    }

    clone(): AvatarDecorationData {
        return new AvatarDecorationData(this.toJson());
    }

    reset(): void {
        this.#asset = null;
        this.#skuId = null;
    }

    equals(other: Partial<AvatarDecorationData>): boolean {
        return Boolean(this.#asset === other.asset && this.#skuId === other.skuId);
    }
}

export interface UserSchema {
    readonly accentColor: Integer | null;
    readonly avatar: string | null;
    readonly avatarDecorationData: AvatarDecorationData | null;
    readonly banner: string | null;
    readonly bot: boolean;
    readonly discriminator: string | null;
    readonly email: string | null;
    readonly flags: UserFlags | null;
    readonly globalName: string | null;
    readonly id: Snowflake | null;
    readonly locale: LocaleKeys | null;
    readonly mfaEnabled: boolean;
    readonly premiumType: PremiumTypes | null;
    readonly publicFlags: UserFlags | null;
    readonly system: boolean;
    readonly username: string | null;
    readonly verified: boolean;
}

export class User extends Base<UserStructure, UserSchema> {
    #accentColor: Integer | null = null;
    #avatar: string | null = null;
    #avatarDecorationData: AvatarDecorationData | null = null;
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
        super();
        this.patch(data);
    }

    get accentColor(): Integer | null {
        return this.#accentColor;
    }

    get avatar(): string | null {
        return this.#avatar;
    }

    get avatarDecorationData(): AvatarDecorationData | null {
        return this.#avatarDecorationData;
    }

    get banner(): string | null {
        return this.#banner;
    }

    get bot(): boolean {
        return this.#bot;
    }

    get discriminator(): string | null {
        return this.#discriminator;
    }

    get email(): string | null {
        return this.#email;
    }

    get flags(): UserFlags | null {
        return this.#flags;
    }

    get globalName(): string | null {
        return this.#globalName;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get locale(): LocaleKeys | null {
        return this.#locale;
    }

    get mfaEnabled(): boolean {
        return this.#mfaEnabled;
    }

    get premiumType(): PremiumTypes | null {
        return this.#premiumType;
    }

    get publicFlags(): UserFlags | null {
        return this.#publicFlags;
    }

    get system(): boolean {
        return this.#system;
    }

    get username(): string | null {
        return this.#username;
    }

    get verified(): boolean {
        return this.#verified;
    }

    static from(data: Partial<UserStructure>): User {
        return new User(data);
    }

    patch(data: Partial<UserStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#accentColor = data.accent_color ?? this.#accentColor;
        this.#avatar = data.avatar ?? this.#avatar;
        this.#avatarDecorationData = data.avatar_decoration_data
            ? AvatarDecorationData.from(data.avatar_decoration_data)
            : this.#avatarDecorationData;
        this.#banner = data.banner ?? this.#banner;
        this.#bot = Boolean(data.bot ?? this.#bot);
        this.#discriminator = data.discriminator ?? this.#discriminator;
        this.#email = data.email ?? this.#email;
        this.#flags = data.flags ?? this.#flags;
        this.#globalName = data.global_name ?? this.#globalName;
        this.#id = data.id ?? this.#id;
        this.#locale = data.locale ?? this.#locale;
        this.#mfaEnabled = Boolean(data.mfa_enabled ?? this.#mfaEnabled);
        this.#premiumType = data.premium_type ?? this.#premiumType;
        this.#publicFlags = data.public_flags ?? this.#publicFlags;
        this.#system = Boolean(data.system ?? this.#system);
        this.#username = data.username ?? this.#username;
        this.#verified = Boolean(data.verified ?? this.#verified);
    }

    toJson(): Partial<UserStructure> {
        return {
            accent_color: this.#accentColor,
            avatar: this.#avatar,
            avatar_decoration_data: this.#avatarDecorationData?.toJson() as AvatarDecorationDataStructure,
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

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): UserSchema {
        return {
            accentColor: this.#accentColor,
            avatar: this.#avatar,
            avatarDecorationData: this.#avatarDecorationData,
            banner: this.#banner,
            bot: this.#bot,
            discriminator: this.#discriminator,
            email: this.#email,
            flags: this.#flags,
            globalName: this.#globalName,
            id: this.#id,
            locale: this.#locale,
            mfaEnabled: this.#mfaEnabled,
            premiumType: this.#premiumType,
            publicFlags: this.#publicFlags,
            system: this.#system,
            username: this.#username,
            verified: this.#verified,
        };
    }

    clone(): User {
        return new User(this.toJson());
    }

    reset(): void {
        this.#accentColor = null;
        this.#avatar = null;
        this.#avatarDecorationData = null;
        this.#banner = null;
        this.#bot = false;
        this.#discriminator = null;
        this.#email = null;
        this.#flags = null;
        this.#globalName = null;
        this.#id = null;
        this.#locale = null;
        this.#mfaEnabled = false;
        this.#premiumType = null;
        this.#publicFlags = null;
        this.#system = false;
        this.#username = null;
        this.#verified = false;
    }

    equals(other: Partial<User>): boolean {
        return Boolean(
            this.#accentColor === other.accentColor &&
                this.#avatar === other.avatar &&
                this.#avatarDecorationData?.equals(other.avatarDecorationData ?? this.#avatarDecorationData) &&
                this.#banner === other.banner &&
                this.#bot === other.bot &&
                this.#discriminator === other.discriminator &&
                this.#email === other.email &&
                this.#flags === other.flags &&
                this.#globalName === other.globalName &&
                this.#id === other.id &&
                this.#locale === other.locale &&
                this.#mfaEnabled === other.mfaEnabled &&
                this.#premiumType === other.premiumType &&
                this.#publicFlags === other.publicFlags &&
                this.#system === other.system &&
                this.#username === other.username &&
                this.#verified === other.verified,
        );
    }
}
