import type {
    ApplicationRoleConnectionMetadataStructure,
    ApplicationRoleConnectionStructure,
    AvatarDecorationDataStructure,
    ConnectionServices,
    ConnectionStructure,
    ConnectionVisibilityTypes,
    Integer,
    Locales,
    PremiumTypes,
    Snowflake,
    UserFlags,
    UserStructure,
} from "@nyxjs/core";
import { ApplicationRoleConnectionMetadata } from "./Applications";
import { Base } from "./Base";
import { Integration } from "./Integrations";

export class ApplicationRoleConnection extends Base<ApplicationRoleConnectionStructure> {
    public metadata!: Record<string, ApplicationRoleConnectionMetadata>;

    public platformName!: string | null;

    public platformUsername!: string | null;

    public constructor(data: Readonly<Partial<ApplicationRoleConnectionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationRoleConnectionStructure>>): void {
        if (data.metadata !== undefined) {
            this.metadata = Object.fromEntries(
                Object.entries(data.metadata).map(([key, value]) => [
                    key,
                    ApplicationRoleConnectionMetadata.from(
                        value as Partial<ApplicationRoleConnectionMetadataStructure>
                    ),
                ])
            ) as Record<string, ApplicationRoleConnectionMetadata>;
        }

        if (data.platform_name === undefined) {
            this.platformName = null;
        } else if (data.platform_name !== null) {
            this.platformName = data.platform_name.trim();
        }

        if (data.platform_username === undefined) {
            this.platformUsername = null;
        } else if (data.platform_username !== null) {
            this.platformUsername = data.platform_username.trim();
        }
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

    public constructor(data: Readonly<Partial<ConnectionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ConnectionStructure>>): void {
        if (data.friend_sync !== undefined) {
            this.friendSync = data.friend_sync;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("integrations" in data) {
            if (data.integrations === null) {
                this.integrations = undefined;
            } else if (data.integrations !== undefined) {
                this.integrations = data.integrations.map((integration) => Integration.from(integration));
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("revoked" in data) {
            if (data.revoked === null) {
                this.revoked = undefined;
            } else if (data.revoked !== undefined) {
                this.revoked = data.revoked;
            }
        }

        if (data.show_activity !== undefined) {
            this.showActivity = data.show_activity;
        }

        if (data.two_way_link !== undefined) {
            this.twoWayLink = data.two_way_link;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if (data.verified !== undefined) {
            this.verified = data.verified;
        }

        if (data.visibility !== undefined) {
            this.visibility = data.visibility;
        }
    }
}

export class AvatarDecorationData extends Base<AvatarDecorationDataStructure> {
    public asset!: string;

    public skuId!: Snowflake;

    public constructor(data: Readonly<Partial<AvatarDecorationDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AvatarDecorationDataStructure>>): void {
        if (data.asset !== undefined) {
            this.asset = data.asset;
        }

        if (data.sku_id !== undefined) {
            this.skuId = data.sku_id;
        }
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

    public constructor(data: Readonly<Partial<UserStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<UserStructure>>): void {
        if ("accent_color" in data) {
            if (data.accent_color === null) {
                this.accentColor = undefined;
            } else {
                this.accentColor = data.accent_color;
            }
        }

        if (data.avatar === undefined) {
            this.avatar = null;
        } else {
            this.avatar = data.avatar;
        }

        if ("avatar_decoration_data" in data) {
            if (data.avatar_decoration_data === null) {
                this.avatarDecorationData = undefined;
            } else {
                this.avatarDecorationData = data.avatar_decoration_data;
            }
        }

        if ("banner" in data) {
            if (data.banner === null) {
                this.banner = undefined;
            } else {
                this.banner = data.banner;
            }
        }

        if ("bot" in data) {
            if (data.bot === null) {
                this.bot = undefined;
            } else {
                this.bot = data.bot;
            }
        }

        if (data.discriminator !== undefined) {
            this.discriminator = data.discriminator;
        }

        if ("email" in data) {
            if (data.email === null) {
                this.email = undefined;
            } else {
                this.email = data.email;
            }
        }

        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else {
                this.flags = data.flags;
            }
        }

        if (data.global_name === undefined) {
            this.globalName = null;
        } else {
            this.globalName = data.global_name;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("locale" in data) {
            if (data.locale === null) {
                this.locale = undefined;
            } else {
                this.locale = data.locale;
            }
        }

        if ("mfa_enabled" in data) {
            if (data.mfa_enabled === null) {
                this.mfaEnabled = undefined;
            } else {
                this.mfaEnabled = data.mfa_enabled;
            }
        }

        if ("premium_type" in data) {
            if (data.premium_type === null) {
                this.premiumType = undefined;
            } else {
                this.premiumType = data.premium_type;
            }
        }

        if ("public_flags" in data) {
            if (data.public_flags === null) {
                this.publicFlags = undefined;
            } else {
                this.publicFlags = data.public_flags;
            }
        }

        if ("system" in data) {
            if (data.system === null) {
                this.system = undefined;
            } else {
                this.system = data.system;
            }
        }

        if (data.username !== undefined) {
            this.username = data.username;
        }

        if ("verified" in data) {
            if (data.verified === null) {
                this.verified = undefined;
            } else {
                this.verified = data.verified;
            }
        }
    }
}
