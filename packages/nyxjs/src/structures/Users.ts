import type {
    AvatarDecorationDataStructure,
    Integer,
    LocaleKeys,
    PremiumTypes,
    Snowflake,
    UserFlags,
    UserStructure,
} from "@nyxjs/core";

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

    public constructor(data: UserStructure) {
        this.accentColor = data.accent_color;
        this.avatar = data.avatar;
        this.avatarDecorationData = data.avatar_decoration_data;
        this.banner = data.banner;
        this.bot = data.bot;
        this.discriminator = data.discriminator;
        this.email = data.email;
        this.flags = data.flags;
        this.globalName = data.global_name;
        this.id = data.id;
        this.locale = data.locale;
        this.mfaEnabled = data.mfa_enabled;
        this.premiumType = data.premium_type;
        this.publicFlags = data.public_flags;
        this.system = data.system;
        this.username = data.username;
        this.verified = data.verified;
    }
}
