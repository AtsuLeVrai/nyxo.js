import type {
    ApplicationRoleConnectionStructure,
    AvatarDecorationDataStructure,
    ConnectionServices,
    ConnectionStructure,
    ConnectionVisibilityTypes,
    PremiumTypes,
    UserFlags,
    UserStructure,
} from "@nyxjs/api-types";
import type { Integer, Locales, Snowflake } from "@nyxjs/core";
import { ApplicationRoleConnectionMetadata } from "./Applications";
import { Base } from "./Base";
import { Integration } from "./Guilds";

export class ApplicationRoleConnection extends Base<ApplicationRoleConnectionStructure> {
    public metadata!: Record<string, ApplicationRoleConnectionMetadata>;

    public platformName!: string | null;

    public platformUsername!: string | null;

    public constructor(data: Partial<ApplicationRoleConnectionStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationRoleConnectionStructure>): void {
        this.metadata = Object.entries(data.metadata!).reduce<Record<string, ApplicationRoleConnectionMetadata>>(
            (acc, [key, value]) => {
                acc[key] = ApplicationRoleConnectionMetadata.from(value);
                return acc;
            },
            {}
        );
        this.platformName = data.platform_name ?? this.platformName;
        this.platformUsername = data.platform_username ?? this.platformUsername;
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

    protected patch(data: Partial<ConnectionStructure>): void {
        this.friendSync = data.friend_sync ?? this.friendSync;
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.showActivity = data.show_activity ?? this.showActivity;
        this.twoWayLink = data.two_way_link ?? this.twoWayLink;
        this.type = data.type ?? this.type;
        this.verified = data.verified ?? this.verified;
        this.visibility = data.visibility ?? this.visibility;

        if ("integrations" in data && data.integrations) {
            this.integrations = data.integrations.map((integration) => Integration.from(integration));
        }

        if ("revoked" in data) {
            this.revoked = data.revoked;
        }
    }
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure> {
    public asset!: string;

    public skuId!: Snowflake;

    public constructor(data: Partial<AvatarDecorationDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<AvatarDecorationDataStructure>): void {
        this.asset = data.asset ?? this.asset;
        this.skuId = data.sku_id ?? this.skuId;
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

    protected patch(data: Partial<UserStructure>): void {
        this.avatar = data.avatar ?? this.avatar;
        this.discriminator = data.discriminator ?? this.discriminator;
        this.globalName = data.global_name ?? this.globalName;
        this.id = data.id ?? this.id;
        this.username = data.username ?? this.username;

        if ("accent_color" in data) {
            this.accentColor = data.accent_color;
        }

        if ("avatar_decoration_data" in data) {
            this.avatarDecorationData = data.avatar_decoration_data;
        }

        if ("banner" in data) {
            this.banner = data.banner;
        }

        if ("bot" in data) {
            this.bot = data.bot;
        }

        if ("email" in data) {
            this.email = data.email;
        }

        if ("flags" in data) {
            this.flags = data.flags;
        }

        if ("locale" in data) {
            this.locale = data.locale;
        }

        if ("mfa_enabled" in data) {
            this.mfaEnabled = data.mfa_enabled;
        }

        if ("premium_type" in data) {
            this.premiumType = data.premium_type;
        }

        if ("public_flags" in data) {
            this.publicFlags = data.public_flags;
        }

        if ("system" in data) {
            this.system = data.system;
        }

        if ("verified" in data) {
            this.verified = data.verified;
        }
    }
}

export { type ConnectionServices, ConnectionVisibilityTypes, PremiumTypes, UserFlags } from "@nyxjs/api-types";
