import type {
    ApplicationRoleConnectionStructure,
    AvatarDecorationDataStructure,
    ConnectionServices,
    ConnectionStructure,
    ConnectionVisibilityTypes,
    Integer,
    LocaleKeys,
    PremiumTypes,
    Snowflake,
    UserFlags,
    UserStructure,
} from "@nyxjs/core";
import { Base } from "./Base";

export class ApplicationRoleConnection extends Base<ApplicationRoleConnectionStructure> {
    /**
     * @todo ApplicationRoleConnectionMetadata
     */
    public metadata: Record<string, unknown>;

    public platformName: string | null;

    public platformUsername: string | null;

    public constructor(data: Partial<ApplicationRoleConnectionStructure> = {}) {
        super();
        this.metadata = data.metadata!;
        this.platformName = data.platform_name!;
        this.platformUsername = data.platform_username!;
    }
}

export class Connection extends Base<ConnectionStructure> {
    public friendSync: boolean;

    public id: string;

    /**
     * @todo Integration
     */
    public integrations?: unknown[];

    public name: string;

    public revoked?: boolean;

    public showActivity: boolean;

    public twoWayLink: boolean;

    public type: ConnectionServices;

    public verified: boolean;

    public visibility: ConnectionVisibilityTypes;

    public constructor(data: Partial<ConnectionStructure> = {}) {
        super();
        this.friendSync = data.friend_sync!;
        this.id = data.id!;
        this.integrations = data.integrations;
        this.name = data.name!;
        this.revoked = data.revoked;
        this.showActivity = data.show_activity!;
        this.twoWayLink = data.two_way_link!;
        this.type = data.type!;
        this.verified = data.verified!;
        this.visibility = data.visibility!;
    }
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure> {
    public asset: string;

    public skuId: string;

    public constructor(data: Partial<AvatarDecorationDataStructure> = {}) {
        super();
        this.asset = data.asset!;
        this.skuId = data.sku_id!;
    }
}

export class User extends Base<UserStructure> {
    public accent_color?: Integer | null;

    public avatar: string | null;

    public avatar_decoration_data?: AvatarDecorationDataStructure | null;

    public banner?: string | null;

    public bot?: boolean;

    public discriminator: string;

    public email?: string | null;

    public flags?: UserFlags;

    public global_name: string | null;

    public id: Snowflake;

    public locale?: LocaleKeys;

    public mfa_enabled?: boolean;

    public premium_type?: PremiumTypes;

    public public_flags?: UserFlags;

    public system?: boolean;

    public username: string;

    public verified?: boolean;

    public constructor(data: Partial<UserStructure> = {}) {
        super();
        this.accent_color = data.accent_color;
        this.avatar = data.avatar!;
        this.avatar_decoration_data = data.avatar_decoration_data;
        this.banner = data.banner;
        this.bot = data.bot;
        this.discriminator = data.discriminator!;
        this.email = data.email;
        this.flags = data.flags;
        this.global_name = data.global_name!;
        this.id = data.id!;
        this.locale = data.locale;
        this.mfa_enabled = data.mfa_enabled;
        this.premium_type = data.premium_type;
        this.public_flags = data.public_flags;
        this.system = data.system;
        this.username = data.username!;
        this.verified = data.verified;
    }
}
