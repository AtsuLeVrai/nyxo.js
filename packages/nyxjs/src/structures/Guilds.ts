import type {
    AvatarDecorationDataStructure,
    BanStructure,
    BitfieldResolvable,
    ChannelStructure,
    EmojiStructure,
    GuildDefaultMessageNotificationLevel,
    GuildExplicitContentFilterLevel,
    GuildFeatures,
    GuildMemberFlags,
    GuildMemberStructure,
    GuildMfaLevel,
    GuildNsfwLevel,
    GuildOnboardingModes,
    GuildOnboardingPromptOptionStructure,
    GuildOnboardingPromptStructure,
    GuildOnboardingPromptTypes,
    GuildOnboardingStructure,
    GuildPreviewStructure,
    GuildScheduledEventStructure,
    GuildStructure,
    GuildVerificationLevel,
    GuildWidgetSettingsStructure,
    GuildWidgetStructure,
    Integer,
    IntegrationAccountStructure,
    IntegrationApplicationStructure,
    IntegrationExpireBehaviors,
    IntegrationStructure,
    IntegrationTypes,
    Iso8601Timestamp,
    LocaleKeys,
    OAuth2Scopes,
    PremiumTier,
    RoleStructure,
    Snowflake,
    StageInstanceStructure,
    StickerStructure,
    SystemChannelFlags,
    UnavailableGuildStructure,
    UserStructure,
    VoiceStateStructure,
    WelcomeScreenChannelStructure,
    WelcomeScreenStructure,
} from "@nyxjs/core";
import type { GuildCreateExtraFields, PresenceUpdateEventFields } from "@nyxjs/gateway";
import type { PickWithMethods } from "../types/index.js";
import { Base } from "./Base.js";
import { Emoji } from "./Emojis.js";
import { Role } from "./Roles.js";
import { StageInstance } from "./Stages.js";
import { Sticker } from "./Stickers.js";
import { AvatarDecorationData, User } from "./Users.js";

export interface GuildOnboardingPromptOptionSchema {
    readonly channelIds: Snowflake[];
    readonly description: string | null;
    readonly emojiAnimated: boolean;
    readonly emojiId: Snowflake | null;
    readonly emojiName: string | null;
    readonly id: Snowflake | null;
    readonly roleIds: Snowflake[];
    readonly title: string | null;
}

export class GuildOnboardingPromptOption extends Base<
    GuildOnboardingPromptOptionStructure,
    GuildOnboardingPromptOptionSchema
> {
    #channelIds: Snowflake[] = [];
    #description: string | null = null;
    #emojiAnimated = false;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;
    #id: Snowflake | null = null;
    #roleIds: Snowflake[] = [];
    #title: string | null = null;

    constructor(data: Partial<GuildOnboardingPromptOptionStructure>) {
        super();
        this.patch(data);
    }

    get channelIds(): Snowflake[] {
        return [...this.#channelIds];
    }

    get description(): string | null {
        return this.#description;
    }

    get emojiAnimated(): boolean {
        return this.#emojiAnimated;
    }

    get emojiId(): Snowflake | null {
        return this.#emojiId;
    }

    get emojiName(): string | null {
        return this.#emojiName;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get roleIds(): Snowflake[] {
        return [...this.#roleIds];
    }

    get title(): string | null {
        return this.#title;
    }

    static from(data: Partial<GuildOnboardingPromptOptionStructure>): GuildOnboardingPromptOption {
        return new GuildOnboardingPromptOption(data);
    }

    patch(data: Partial<GuildOnboardingPromptOptionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (Array.isArray(data.channel_ids)) {
            this.#channelIds = [...data.channel_ids];
        }

        this.#description = data.description ?? this.#description;
        this.#emojiAnimated = Boolean(data.emoji_animated ?? this.#emojiAnimated);
        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
        this.#id = data.id ?? this.#id;

        if (Array.isArray(data.role_ids)) {
            this.#roleIds = [...data.role_ids];
        }

        this.#title = data.title ?? this.#title;
    }

    toJson(): Partial<GuildOnboardingPromptOptionStructure> {
        return {
            channel_ids: [...this.#channelIds],
            description: this.#description ?? undefined,
            emoji_animated: this.#emojiAnimated,
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
            id: this.#id ?? undefined,
            role_ids: [...this.#roleIds],
            title: this.#title ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildOnboardingPromptOptionSchema {
        return {
            channelIds: [...this.#channelIds],
            description: this.#description,
            emojiAnimated: this.#emojiAnimated,
            emojiId: this.#emojiId,
            emojiName: this.#emojiName,
            id: this.#id,
            roleIds: [...this.#roleIds],
            title: this.#title,
        };
    }

    clone(): GuildOnboardingPromptOption {
        return new GuildOnboardingPromptOption(this.toJson());
    }

    reset(): void {
        this.#channelIds = [];
        this.#description = null;
        this.#emojiAnimated = false;
        this.#emojiId = null;
        this.#emojiName = null;
        this.#id = null;
        this.#roleIds = [];
        this.#title = null;
    }

    equals(other: Partial<GuildOnboardingPromptOption>): boolean {
        return Boolean(
            JSON.stringify(this.#channelIds) === JSON.stringify(other.channelIds) &&
                this.#description === other.description &&
                this.#emojiAnimated === other.emojiAnimated &&
                this.#emojiId === other.emojiId &&
                this.#emojiName === other.emojiName &&
                this.#id === other.id &&
                JSON.stringify(this.#roleIds) === JSON.stringify(other.roleIds) &&
                this.#title === other.title,
        );
    }
}

export interface GuildOnboardingPromptSchema {
    readonly id: Snowflake | null;
    readonly inOnboarding: boolean;
    readonly options: GuildOnboardingPromptOption[];
    readonly required: boolean;
    readonly singleSelect: boolean;
    readonly title: string | null;
    readonly type: GuildOnboardingPromptTypes | null;
}

export class GuildOnboardingPrompt extends Base<GuildOnboardingPromptStructure, GuildOnboardingPromptSchema> {
    #id: Snowflake | null = null;
    #inOnboarding = false;
    #options: GuildOnboardingPromptOption[] = [];
    #required = false;
    #singleSelect = false;
    #title: string | null = null;
    #type: GuildOnboardingPromptTypes | null = null;

    constructor(data: Partial<GuildOnboardingPromptStructure>) {
        super();
        this.patch(data);
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get inOnboarding(): boolean {
        return this.#inOnboarding;
    }

    get options(): GuildOnboardingPromptOption[] {
        return [...this.#options];
    }

    get required(): boolean {
        return this.#required;
    }

    get singleSelect(): boolean {
        return this.#singleSelect;
    }

    get title(): string | null {
        return this.#title;
    }

    get type(): GuildOnboardingPromptTypes | null {
        return this.#type;
    }

    static from(data: Partial<GuildOnboardingPromptStructure>): GuildOnboardingPrompt {
        return new GuildOnboardingPrompt(data);
    }

    patch(data: Partial<GuildOnboardingPromptStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#id = data.id ?? this.#id;
        this.#inOnboarding = Boolean(data.in_onboarding ?? this.#inOnboarding);

        if (Array.isArray(data.options)) {
            this.#options = data.options.map((option) => GuildOnboardingPromptOption.from(option));
        }

        this.#required = Boolean(data.required ?? this.#required);
        this.#singleSelect = Boolean(data.single_select ?? this.#singleSelect);
        this.#title = data.title ?? this.#title;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<GuildOnboardingPromptStructure> {
        return {
            id: this.#id ?? undefined,
            in_onboarding: this.#inOnboarding,
            options: this.#options.map((option) => option.toJson()) as GuildOnboardingPromptOptionStructure[],
            required: this.#required,
            single_select: this.#singleSelect,
            title: this.#title ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildOnboardingPromptSchema {
        return {
            id: this.#id,
            inOnboarding: this.#inOnboarding,
            options: [...this.#options],
            required: this.#required,
            singleSelect: this.#singleSelect,
            title: this.#title,
            type: this.#type,
        };
    }

    clone(): GuildOnboardingPrompt {
        return new GuildOnboardingPrompt(this.toJson());
    }

    reset(): void {
        this.#id = null;
        this.#inOnboarding = false;
        this.#options = [];
        this.#required = false;
        this.#singleSelect = false;
        this.#title = null;
        this.#type = null;
    }

    equals(other: Partial<GuildOnboardingPrompt>): boolean {
        return Boolean(
            this.#id === other.id &&
                this.#inOnboarding === other.inOnboarding &&
                this.#options.length === other.options?.length &&
                this.#options.every((option, index) => option.equals(other.options?.[index] ?? {})) &&
                this.#required === other.required &&
                this.#singleSelect === other.singleSelect &&
                this.#title === other.title &&
                this.#type === other.type,
        );
    }
}

export interface GuildOnboardingSchema {
    readonly defaultChannelIds: Snowflake[];
    readonly enabled: boolean;
    readonly guildId: Snowflake | null;
    readonly mode: GuildOnboardingModes | null;
    readonly prompts: GuildOnboardingPrompt[];
}

export class GuildOnboarding extends Base<GuildOnboardingStructure, GuildOnboardingSchema> {
    #defaultChannelIds: Snowflake[] = [];
    #enabled = false;
    #guildId: Snowflake | null = null;
    #mode: GuildOnboardingModes | null = null;
    #prompts: GuildOnboardingPrompt[] = [];

    constructor(data: Partial<GuildOnboardingStructure>) {
        super();
        this.patch(data);
    }

    get defaultChannelIds(): Snowflake[] {
        return [...this.#defaultChannelIds];
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get mode(): GuildOnboardingModes | null {
        return this.#mode;
    }

    get prompts(): GuildOnboardingPrompt[] {
        return [...this.#prompts];
    }

    static from(data: Partial<GuildOnboardingStructure>): GuildOnboarding {
        return new GuildOnboarding(data);
    }

    patch(data: Partial<GuildOnboardingStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (Array.isArray(data.default_channel_ids)) {
            this.#defaultChannelIds = [...data.default_channel_ids];
        }

        this.#enabled = Boolean(data.enabled ?? this.#enabled);
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#mode = data.mode ?? this.#mode;

        if (Array.isArray(data.prompts)) {
            this.#prompts = data.prompts.map((prompt) => GuildOnboardingPrompt.from(prompt));
        }
    }

    toJson(): Partial<GuildOnboardingStructure> {
        return {
            default_channel_ids: [...this.#defaultChannelIds],
            enabled: this.#enabled,
            guild_id: this.#guildId ?? undefined,
            mode: this.#mode ?? undefined,
            prompts: this.#prompts.map((prompt) => prompt.toJson()) as GuildOnboardingPromptStructure[],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildOnboardingSchema {
        return {
            defaultChannelIds: [...this.#defaultChannelIds],
            enabled: this.#enabled,
            guildId: this.#guildId,
            mode: this.#mode,
            prompts: [...this.#prompts],
        };
    }

    clone(): GuildOnboarding {
        return new GuildOnboarding(this.toJson());
    }

    reset(): void {
        this.#defaultChannelIds = [];
        this.#enabled = false;
        this.#guildId = null;
        this.#mode = null;
        this.#prompts = [];
    }

    equals(other: Partial<GuildOnboarding>): boolean {
        return Boolean(
            JSON.stringify(this.#defaultChannelIds) === JSON.stringify(other.defaultChannelIds) &&
                this.#enabled === other.enabled &&
                this.#guildId === other.guildId &&
                this.#mode === other.mode &&
                this.#prompts.length === other.prompts?.length &&
                this.#prompts.every((prompt, index) => prompt.equals(other.prompts?.[index] ?? {})),
        );
    }
}

export interface WelcomeScreenChannelSchema {
    readonly channelId: Snowflake | null;
    readonly description: string | null;
    readonly emojiId: Snowflake | null;
    readonly emojiName: string | null;
}

export class WelcomeScreenChannel extends Base<WelcomeScreenChannelStructure, WelcomeScreenChannelSchema> {
    #channelId: Snowflake | null = null;
    #description: string | null = null;
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;

    constructor(data: Partial<WelcomeScreenChannelStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get description(): string | null {
        return this.#description;
    }

    get emojiId(): Snowflake | null {
        return this.#emojiId;
    }

    get emojiName(): string | null {
        return this.#emojiName;
    }

    static from(data: Partial<WelcomeScreenChannelStructure>): WelcomeScreenChannel {
        return new WelcomeScreenChannel(data);
    }

    patch(data: Partial<WelcomeScreenChannelStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#description = data.description ?? this.#description;
        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
    }

    toJson(): Partial<WelcomeScreenChannelStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            description: this.#description ?? undefined,
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): WelcomeScreenChannelSchema {
        return {
            channelId: this.#channelId,
            description: this.#description,
            emojiId: this.#emojiId,
            emojiName: this.#emojiName,
        };
    }

    clone(): WelcomeScreenChannel {
        return new WelcomeScreenChannel(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#description = null;
        this.#emojiId = null;
        this.#emojiName = null;
    }

    equals(other: Partial<WelcomeScreenChannel>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#description === other.description &&
                this.#emojiId === other.emojiId &&
                this.#emojiName === other.emojiName,
        );
    }
}

export interface WelcomeScreenSchema {
    readonly description: string | null;
    readonly welcomeChannels: WelcomeScreenChannel[];
}

export class WelcomeScreen extends Base<WelcomeScreenStructure, WelcomeScreenSchema> {
    #description: string | null = null;
    #welcomeChannels: WelcomeScreenChannel[] = [];

    constructor(data: Partial<WelcomeScreenStructure>) {
        super();
        this.patch(data);
    }

    get description(): string | null {
        return this.#description;
    }

    get welcomeChannels(): WelcomeScreenChannel[] {
        return [...this.#welcomeChannels];
    }

    static from(data: Partial<WelcomeScreenStructure>): WelcomeScreen {
        return new WelcomeScreen(data);
    }

    patch(data: Partial<WelcomeScreenStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#description = data.description ?? this.#description;

        if (Array.isArray(data.welcome_channels)) {
            this.#welcomeChannels = data.welcome_channels.map((channel) => WelcomeScreenChannel.from(channel));
        }
    }

    toJson(): Partial<WelcomeScreenStructure> {
        return {
            description: this.#description ?? undefined,
            welcome_channels: this.#welcomeChannels.map((channel) =>
                channel.toJson(),
            ) as WelcomeScreenChannelStructure[],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): WelcomeScreenSchema {
        return {
            description: this.#description,
            welcomeChannels: [...this.#welcomeChannels],
        };
    }

    clone(): WelcomeScreen {
        return new WelcomeScreen(this.toJson());
    }

    reset(): void {
        this.#description = null;
        this.#welcomeChannels = [];
    }

    equals(other: Partial<WelcomeScreen>): boolean {
        return Boolean(
            this.#description === other.description &&
                this.#welcomeChannels.length === other.welcomeChannels?.length &&
                this.#welcomeChannels.every((channel, index) => channel.equals(other.welcomeChannels?.[index] ?? {})),
        );
    }
}

export interface BanSchema {
    readonly reason: string | null;
    readonly user: User | null;
}

export class Ban extends Base<BanStructure, BanSchema> {
    #reason: string | null = null;
    #user: User | null = null;

    constructor(data: Partial<BanStructure>) {
        super();
        this.patch(data);
    }

    get reason(): string | null {
        return this.#reason;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<BanStructure>): Ban {
        return new Ban(data);
    }

    patch(data: Partial<BanStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#reason = data.reason ?? this.#reason;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<BanStructure> {
        return {
            reason: this.#reason ?? undefined,
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): BanSchema {
        return {
            reason: this.#reason,
            user: this.#user,
        };
    }

    clone(): Ban {
        return new Ban(this.toJson());
    }

    reset(): void {
        this.#reason = null;
        this.#user = null;
    }

    equals(other: Partial<Ban>): boolean {
        return Boolean(this.#reason === other.reason && this.#user?.equals(other.user ?? {}));
    }
}

export interface IntegrationApplicationSchema {
    readonly bot: User | null;
    readonly description: string | null;
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
}

export class IntegrationApplication extends Base<IntegrationApplicationStructure, IntegrationApplicationSchema> {
    #bot: User | null = null;
    #description: string | null = null;
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;

    constructor(data: Partial<IntegrationApplicationStructure>) {
        super();
        this.patch(data);
    }

    get bot(): User | null {
        return this.#bot;
    }

    get description(): string | null {
        return this.#description;
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    static from(data: Partial<IntegrationApplicationStructure>): IntegrationApplication {
        return new IntegrationApplication(data);
    }

    patch(data: Partial<IntegrationApplicationStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#bot = data.bot ? User.from(data.bot) : this.#bot;
        this.#description = data.description ?? this.#description;
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJson(): Partial<IntegrationApplicationStructure> {
        return {
            bot: this.#bot?.toJson() as UserStructure,
            description: this.#description ?? undefined,
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): IntegrationApplicationSchema {
        return {
            bot: this.#bot,
            description: this.#description,
            icon: this.#icon,
            id: this.#id,
            name: this.#name,
        };
    }

    clone(): IntegrationApplication {
        return new IntegrationApplication(this.toJson());
    }

    reset(): void {
        this.#bot = null;
        this.#description = null;
        this.#icon = null;
        this.#id = null;
        this.#name = null;
    }

    equals(other: Partial<IntegrationApplication>): boolean {
        return Boolean(
            this.#bot?.equals(other.bot ?? {}) &&
                this.#description === other.description &&
                this.#icon === other.icon &&
                this.#id === other.id &&
                this.#name === other.name,
        );
    }
}

export interface IntegrationAccountSchema {
    readonly id: string | null;
    readonly name: string | null;
}

export class IntegrationAccount extends Base<IntegrationAccountStructure, IntegrationAccountSchema> {
    #id: string | null = null;
    #name: string | null = null;

    constructor(data: Partial<IntegrationAccountStructure>) {
        super();
        this.patch(data);
    }

    get id(): string | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    static from(data: Partial<IntegrationAccountStructure>): IntegrationAccount {
        return new IntegrationAccount(data);
    }

    patch(data: Partial<IntegrationAccountStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
    }

    toJson(): Partial<IntegrationAccountStructure> {
        return {
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): IntegrationAccountSchema {
        return {
            id: this.#id,
            name: this.#name,
        };
    }

    clone(): IntegrationAccount {
        return new IntegrationAccount(this.toJson());
    }

    reset(): void {
        this.#id = null;
        this.#name = null;
    }

    equals(other: Partial<IntegrationAccount>): boolean {
        return Boolean(this.#id === other.id && this.#name === other.name);
    }
}

export interface IntegrationSchema {
    readonly account: IntegrationAccount | null;
    readonly application: IntegrationApplication | null;
    readonly enableEmoticons: boolean;
    readonly enabled: boolean;
    readonly expireBehavior: IntegrationExpireBehaviors | null;
    readonly expireGracePeriod: Integer | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly revoked: boolean;
    readonly roleId: Snowflake | null;
    readonly scopes: OAuth2Scopes[];
    readonly subscriberCount: Integer | null;
    readonly syncedAt: Iso8601Timestamp | null;
    readonly syncing: boolean;
    readonly type: IntegrationTypes | null;
    readonly user: User | null;
}

export class Integration extends Base<IntegrationStructure, IntegrationSchema> {
    #account: IntegrationAccount | null = null;
    #application: IntegrationApplication | null = null;
    #enableEmoticons = false;
    #enabled = false;
    #expireBehavior: IntegrationExpireBehaviors | null = null;
    #expireGracePeriod: Integer | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #revoked = false;
    #roleId: Snowflake | null = null;
    #scopes: OAuth2Scopes[] = [];
    #subscriberCount: Integer | null = null;
    #syncedAt: Iso8601Timestamp | null = null;
    #syncing = false;
    #type: IntegrationTypes | null = null;
    #user: User | null = null;

    constructor(data: Partial<IntegrationStructure>) {
        super();
        this.patch(data);
    }

    get account(): IntegrationAccount | null {
        return this.#account;
    }

    get application(): IntegrationApplication | null {
        return this.#application;
    }

    get enableEmoticons(): boolean {
        return this.#enableEmoticons;
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    get expireBehavior(): IntegrationExpireBehaviors | null {
        return this.#expireBehavior;
    }

    get expireGracePeriod(): Integer | null {
        return this.#expireGracePeriod;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get revoked(): boolean {
        return this.#revoked;
    }

    get roleId(): Snowflake | null {
        return this.#roleId;
    }

    get scopes(): OAuth2Scopes[] {
        return [...this.#scopes];
    }

    get subscriberCount(): Integer | null {
        return this.#subscriberCount;
    }

    get syncedAt(): Iso8601Timestamp | null {
        return this.#syncedAt;
    }

    get syncing(): boolean {
        return this.#syncing;
    }

    get type(): IntegrationTypes | null {
        return this.#type;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<IntegrationStructure>): Integration {
        return new Integration(data);
    }

    patch(data: Partial<IntegrationStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#account = data.account ? IntegrationAccount.from(data.account) : this.#account;
        this.#application = data.application ? IntegrationApplication.from(data.application) : this.#application;
        this.#enableEmoticons = Boolean(data.enable_emoticons ?? this.#enableEmoticons);
        this.#enabled = Boolean(data.enabled ?? this.#enabled);
        this.#expireBehavior = data.expire_behavior ?? this.#expireBehavior;
        this.#expireGracePeriod = data.expire_grace_period ?? this.#expireGracePeriod;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#revoked = Boolean(data.revoked ?? this.#revoked);
        this.#roleId = data.role_id ?? this.#roleId;

        if (Array.isArray(data.scopes)) {
            this.#scopes = [...data.scopes];
        }

        this.#subscriberCount = data.subscriber_count ?? this.#subscriberCount;
        this.#syncedAt = data.synced_at ?? this.#syncedAt;
        this.#syncing = Boolean(data.syncing ?? this.#syncing);
        this.#type = data.type ?? this.#type;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<IntegrationStructure> {
        return {
            account: this.#account?.toJson() as IntegrationAccountStructure,
            application: this.#application?.toJson() as IntegrationApplicationStructure,
            enable_emoticons: this.#enableEmoticons,
            enabled: this.#enabled,
            expire_behavior: this.#expireBehavior ?? undefined,
            expire_grace_period: this.#expireGracePeriod ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            revoked: this.#revoked,
            role_id: this.#roleId ?? undefined,
            scopes: [...this.#scopes],
            subscriber_count: this.#subscriberCount ?? undefined,
            synced_at: this.#syncedAt ?? undefined,
            syncing: this.#syncing,
            type: this.#type ?? undefined,
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): IntegrationSchema {
        return {
            account: this.#account,
            application: this.#application,
            enableEmoticons: this.#enableEmoticons,
            enabled: this.#enabled,
            expireBehavior: this.#expireBehavior,
            expireGracePeriod: this.#expireGracePeriod,
            id: this.#id,
            name: this.#name,
            revoked: this.#revoked,
            roleId: this.#roleId,
            scopes: [...this.#scopes],
            subscriberCount: this.#subscriberCount,
            syncedAt: this.#syncedAt,
            syncing: this.#syncing,
            type: this.#type,
            user: this.#user,
        };
    }

    clone(): Integration {
        return new Integration(this.toJson());
    }

    reset(): void {
        this.#account = null;
        this.#application = null;
        this.#enableEmoticons = false;
        this.#enabled = false;
        this.#expireBehavior = null;
        this.#expireGracePeriod = null;
        this.#id = null;
        this.#name = null;
        this.#revoked = false;
        this.#roleId = null;
        this.#scopes = [];
        this.#subscriberCount = null;
        this.#syncedAt = null;
        this.#syncing = false;
        this.#type = null;
        this.#user = null;
    }

    equals(other: Partial<Integration>): boolean {
        return Boolean(
            this.#account?.equals(other.account ?? {}) &&
                this.#application?.equals(other.application ?? {}) &&
                this.#enableEmoticons === other.enableEmoticons &&
                this.#enabled === other.enabled &&
                this.#expireBehavior === other.expireBehavior &&
                this.#expireGracePeriod === other.expireGracePeriod &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#revoked === other.revoked &&
                this.#roleId === other.roleId &&
                JSON.stringify(this.#scopes) === JSON.stringify(other.scopes) &&
                this.#subscriberCount === other.subscriberCount &&
                this.#syncedAt === other.syncedAt &&
                this.#syncing === other.syncing &&
                this.#type === other.type &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}

export interface GuildMemberSchema {
    readonly avatar: string | null;
    readonly avatarDecorationData: AvatarDecorationData | null;
    readonly communicationDisabledUntil: Iso8601Timestamp | null;
    readonly deaf: boolean;
    readonly flags: BitfieldResolvable<GuildMemberFlags>;
    readonly joinedAt: Iso8601Timestamp | null;
    readonly mute: boolean;
    readonly nick: string | null;
    readonly pending: boolean;
    readonly permissions: string | null;
    readonly premiumSince: Iso8601Timestamp | null;
    readonly roles: Snowflake[];
    readonly user: User | null;
}

export class GuildMember extends Base<GuildMemberStructure, GuildMemberSchema> {
    #avatar: string | null = null;
    #avatarDecorationData: AvatarDecorationData | null = null;
    #communicationDisabledUntil: Iso8601Timestamp | null = null;
    #deaf = false;
    #flags: BitfieldResolvable<GuildMemberFlags> = 0n;
    #joinedAt: Iso8601Timestamp | null = null;
    #mute = false;
    #nick: string | null = null;
    #pending = false;
    #permissions: string | null = null;
    #premiumSince: Iso8601Timestamp | null = null;
    #roles: Snowflake[] = [];
    #user: User | null = null;

    constructor(data: Partial<GuildMemberStructure>) {
        super();
        this.patch(data);
    }

    get avatar(): string | null {
        return this.#avatar;
    }

    get avatarDecorationData(): AvatarDecorationData | null {
        return this.#avatarDecorationData;
    }

    get communicationDisabledUntil(): Iso8601Timestamp | null {
        return this.#communicationDisabledUntil;
    }

    get deaf(): boolean {
        return this.#deaf;
    }

    get flags(): BitfieldResolvable<GuildMemberFlags> {
        return this.#flags;
    }

    get joinedAt(): Iso8601Timestamp | null {
        return this.#joinedAt;
    }

    get mute(): boolean {
        return this.#mute;
    }

    get nick(): string | null {
        return this.#nick;
    }

    get pending(): boolean {
        return this.#pending;
    }

    get permissions(): string | null {
        return this.#permissions;
    }

    get premiumSince(): Iso8601Timestamp | null {
        return this.#premiumSince;
    }

    get roles(): Snowflake[] {
        return [...this.#roles];
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<GuildMemberStructure>): GuildMember {
        return new GuildMember(data);
    }

    patch(data: Partial<GuildMemberStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#avatar = data.avatar ?? this.#avatar;
        this.#avatarDecorationData = data.avatar_decoration_data
            ? AvatarDecorationData.from(data.avatar_decoration_data)
            : this.#avatarDecorationData;
        this.#communicationDisabledUntil = data.communication_disabled_until ?? this.#communicationDisabledUntil;
        this.#deaf = Boolean(data.deaf ?? this.#deaf);
        this.#flags = data.flags ?? this.#flags;
        this.#joinedAt = data.joined_at ?? this.#joinedAt;
        this.#mute = Boolean(data.mute ?? this.#mute);
        this.#nick = data.nick ?? this.#nick;
        this.#pending = Boolean(data.pending ?? this.#pending);
        this.#permissions = data.permissions ?? this.#permissions;
        this.#premiumSince = data.premium_since ?? this.#premiumSince;

        if (Array.isArray(data.roles)) {
            this.#roles = [...data.roles];
        }

        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<GuildMemberStructure> {
        return {
            avatar: this.#avatar ?? undefined,
            avatar_decoration_data: this.#avatarDecorationData?.toJson() as AvatarDecorationDataStructure,
            communication_disabled_until: this.#communicationDisabledUntil ?? undefined,
            deaf: this.#deaf,
            flags: this.#flags,
            joined_at: this.#joinedAt ?? undefined,
            mute: this.#mute,
            nick: this.#nick ?? undefined,
            pending: this.#pending,
            permissions: this.#permissions ?? undefined,
            premium_since: this.#premiumSince ?? undefined,
            roles: [...this.#roles],
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildMemberSchema {
        return {
            avatar: this.#avatar,
            avatarDecorationData: this.#avatarDecorationData,
            communicationDisabledUntil: this.#communicationDisabledUntil,
            deaf: this.#deaf,
            flags: this.#flags,
            joinedAt: this.#joinedAt,
            mute: this.#mute,
            nick: this.#nick,
            pending: this.#pending,
            permissions: this.#permissions,
            premiumSince: this.#premiumSince,
            roles: [...this.#roles],
            user: this.#user,
        };
    }

    clone(): GuildMember {
        return new GuildMember(this.toJson());
    }

    reset(): void {
        this.#avatar = null;
        this.#avatarDecorationData = null;
        this.#communicationDisabledUntil = null;
        this.#deaf = false;
        this.#flags = 0n;
        this.#joinedAt = null;
        this.#mute = false;
        this.#nick = null;
        this.#pending = false;
        this.#permissions = null;
        this.#premiumSince = null;
        this.#roles = [];
        this.#user = null;
    }

    equals(other: Partial<GuildMember>): boolean {
        return Boolean(
            this.#avatar === other.avatar &&
                this.#avatarDecorationData?.equals(other.avatarDecorationData ?? {}) &&
                this.#communicationDisabledUntil === other.communicationDisabledUntil &&
                this.#deaf === other.deaf &&
                this.#flags === other.flags &&
                this.#joinedAt === other.joinedAt &&
                this.#mute === other.mute &&
                this.#nick === other.nick &&
                this.#pending === other.pending &&
                this.#permissions === other.permissions &&
                this.#premiumSince === other.premiumSince &&
                JSON.stringify(this.#roles) === JSON.stringify(other.roles) &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}

export interface GuildWidgetSchema {
    readonly channels: Pick<ChannelStructure, "id" | "name" | "position">[];
    readonly id: Snowflake | null;
    readonly instantInvite: string | null;
    readonly members: PickWithMethods<User, "discriminator" | "id" | "username">[];
    readonly name: string | null;
    readonly presenceCount: Integer | null;
}

export class GuildWidget extends Base<GuildWidgetStructure, GuildWidgetSchema> {
    /**
     * @todo Implement Channel Class
     */
    #channels: Pick<ChannelStructure, "id" | "name" | "position">[] = [];
    #id: Snowflake | null = null;
    #instantInvite: string | null = null;
    #members: PickWithMethods<User, "discriminator" | "id" | "username">[] = [];
    #name: string | null = null;
    #presenceCount: Integer | null = null;

    constructor(data: Partial<GuildWidgetStructure>) {
        super();
        this.patch(data);
    }

    get channels(): Pick<ChannelStructure, "id" | "name" | "position">[] {
        return [...this.#channels];
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get instantInvite(): string | null {
        return this.#instantInvite;
    }

    get members(): PickWithMethods<User, "discriminator" | "id" | "username">[] {
        return [...this.#members];
    }

    get name(): string | null {
        return this.#name;
    }

    get presenceCount(): Integer | null {
        return this.#presenceCount;
    }

    static from(data: Partial<GuildWidgetStructure>): GuildWidget {
        return new GuildWidget(data);
    }

    patch(data: Partial<GuildWidgetStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (Array.isArray(data.channels)) {
            this.#channels = [...data.channels];
        }

        this.#id = data.id ?? this.#id;
        this.#instantInvite = data.instant_invite ?? this.#instantInvite;

        if (Array.isArray(data.members)) {
            this.#members = data.members.map((member) => User.from(member));
        }

        this.#name = data.name ?? this.#name;
        this.#presenceCount = data.presence_count ?? this.#presenceCount;
    }

    toJson(): Partial<GuildWidgetStructure> {
        return {
            channels: [...this.#channels],
            id: this.#id ?? undefined,
            instant_invite: this.#instantInvite ?? undefined,
            members: this.#members.map((member) => member.toJson()) as UserStructure[],
            name: this.#name ?? undefined,
            presence_count: this.#presenceCount ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildWidgetSchema {
        return {
            channels: [...this.#channels],
            id: this.#id,
            instantInvite: this.#instantInvite,
            members: [...this.#members],
            name: this.#name,
            presenceCount: this.#presenceCount,
        };
    }

    clone(): GuildWidget {
        return new GuildWidget(this.toJson());
    }

    reset(): void {
        this.#channels = [];
        this.#id = null;
        this.#instantInvite = null;
        this.#members = [];
        this.#name = null;
        this.#presenceCount = null;
    }

    equals(other: Partial<GuildWidget>): boolean {
        return Boolean(
            JSON.stringify(this.#channels) === JSON.stringify(other.channels) &&
                this.#id === other.id &&
                this.#instantInvite === other.instantInvite &&
                this.#members.length === other.members?.length &&
                this.#members.every((member, index) => member.equals(other.members?.[index] ?? {})) &&
                this.#name === other.name &&
                this.#presenceCount === other.presenceCount,
        );
    }
}

export interface GuildWidgetSettingsSchema {
    readonly channelId: Snowflake | null;
    readonly enabled: boolean;
}

export class GuildWidgetSettings extends Base<GuildWidgetSettingsStructure, GuildWidgetSettingsSchema> {
    #channelId: Snowflake | null = null;
    #enabled = false;

    constructor(data: Partial<GuildWidgetSettingsStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    static from(data: Partial<GuildWidgetSettingsStructure>): GuildWidgetSettings {
        return new GuildWidgetSettings(data);
    }

    patch(data: Partial<GuildWidgetSettingsStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#enabled = Boolean(data.enabled ?? this.#enabled);
    }

    toJson(): Partial<GuildWidgetSettingsStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            enabled: this.#enabled,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildWidgetSettingsSchema {
        return {
            channelId: this.#channelId,
            enabled: this.#enabled,
        };
    }

    clone(): GuildWidgetSettings {
        return new GuildWidgetSettings(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#enabled = false;
    }

    equals(other: Partial<GuildWidgetSettings>): boolean {
        return Boolean(this.#channelId === other.channelId && this.#enabled === other.enabled);
    }
}

export interface GuildPreviewSchema {
    readonly approximateMemberCount: Integer | null;
    readonly approximatePresenceCount: Integer | null;
    readonly description: string | null;
    readonly discoverySplash: string | null;
    readonly emojis: Emoji[];
    readonly features: GuildFeatures[];
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly splash: string | null;
    readonly stickers: Sticker[];
}

export class GuildPreview extends Base<GuildPreviewStructure, GuildPreviewSchema> {
    #approximateMemberCount: Integer | null = null;
    #approximatePresenceCount: Integer | null = null;
    #description: string | null = null;
    #discoverySplash: string | null = null;
    #emojis: Emoji[] = [];
    #features: GuildFeatures[] = [];
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #splash: string | null = null;
    #stickers: Sticker[] = [];

    constructor(data: Partial<GuildPreviewStructure>) {
        super();
        this.patch(data);
    }

    get approximateMemberCount(): Integer | null {
        return this.#approximateMemberCount;
    }

    get approximatePresenceCount(): Integer | null {
        return this.#approximatePresenceCount;
    }

    get description(): string | null {
        return this.#description;
    }

    get discoverySplash(): string | null {
        return this.#discoverySplash;
    }

    get emojis(): Emoji[] {
        return [...this.#emojis];
    }

    get features(): GuildFeatures[] {
        return [...this.#features];
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get splash(): string | null {
        return this.#splash;
    }

    get stickers(): Sticker[] {
        return [...this.#stickers];
    }

    static from(data: Partial<GuildPreviewStructure>): GuildPreview {
        return new GuildPreview(data);
    }

    patch(data: Partial<GuildPreviewStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#approximateMemberCount = data.approximate_member_count ?? this.#approximateMemberCount;
        this.#approximatePresenceCount = data.approximate_presence_count ?? this.#approximatePresenceCount;
        this.#description = data.description ?? this.#description;
        this.#discoverySplash = data.discovery_splash ?? this.#discoverySplash;

        if (Array.isArray(data.emojis)) {
            this.#emojis = data.emojis.map((emoji) => Emoji.from(emoji));
        }

        if (Array.isArray(data.features)) {
            this.#features = [...data.features];
        }

        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#splash = data.splash ?? this.#splash;

        if (Array.isArray(data.stickers)) {
            this.#stickers = data.stickers.map((sticker) => Sticker.from(sticker));
        }
    }

    toJson(): Partial<GuildPreviewStructure> {
        return {
            approximate_member_count: this.#approximateMemberCount ?? undefined,
            approximate_presence_count: this.#approximatePresenceCount ?? undefined,
            description: this.#description ?? undefined,
            discovery_splash: this.#discoverySplash ?? undefined,
            emojis: this.#emojis.map((emoji) => emoji.toJson()) as EmojiStructure[],
            features: [...this.#features],
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            splash: this.#splash ?? undefined,
            stickers: this.#stickers.map((sticker) => sticker.toJson()) as StickerStructure[],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildPreviewSchema {
        return {
            approximateMemberCount: this.#approximateMemberCount,
            approximatePresenceCount: this.#approximatePresenceCount,
            description: this.#description,
            discoverySplash: this.#discoverySplash,
            emojis: [...this.#emojis],
            features: [...this.#features],
            icon: this.#icon,
            id: this.#id,
            name: this.#name,
            splash: this.#splash,
            stickers: [...this.#stickers],
        };
    }

    clone(): GuildPreview {
        return new GuildPreview(this.toJson());
    }

    reset(): void {
        this.#approximateMemberCount = null;
        this.#approximatePresenceCount = null;
        this.#description = null;
        this.#discoverySplash = null;
        this.#emojis = [];
        this.#features = [];
        this.#icon = null;
        this.#id = null;
        this.#name = null;
        this.#splash = null;
        this.#stickers = [];
    }

    equals(other: Partial<GuildPreview>): boolean {
        return Boolean(
            this.#approximateMemberCount === other.approximateMemberCount &&
                this.#approximatePresenceCount === other.approximatePresenceCount &&
                this.#description === other.description &&
                this.#discoverySplash === other.discoverySplash &&
                this.#emojis.length === other.emojis?.length &&
                this.#emojis.every((emoji, index) => emoji.equals(other.emojis?.[index] ?? {})) &&
                JSON.stringify(this.#features) === JSON.stringify(other.features) &&
                this.#icon === other.icon &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#splash === other.splash &&
                this.#stickers.length === other.stickers?.length &&
                this.#stickers.every((sticker, index) => sticker.equals(other.stickers?.[index] ?? {})),
        );
    }
}

export interface UnavailableGuildSchema {
    readonly id: Snowflake | null;
    readonly unavailable: boolean;
}

export class UnavailableGuild extends Base<UnavailableGuildStructure, UnavailableGuildSchema> {
    #id: Snowflake | null = null;
    #unavailable = false;

    constructor(data: Partial<UnavailableGuildStructure>) {
        super();
        this.patch(data);
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get unavailable(): boolean {
        return this.#unavailable;
    }

    static from(data: Partial<UnavailableGuildStructure>): UnavailableGuild {
        return new UnavailableGuild(data);
    }

    patch(data: Partial<UnavailableGuildStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#id = data.id ?? this.#id;
        this.#unavailable = Boolean(data.unavailable ?? this.#unavailable);
    }

    toJson(): Partial<UnavailableGuildStructure> {
        return {
            id: this.#id ?? undefined,
            unavailable: this.#unavailable,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): UnavailableGuildSchema {
        return {
            id: this.#id,
            unavailable: this.#unavailable,
        };
    }

    clone(): UnavailableGuild {
        return new UnavailableGuild(this.toJson());
    }

    reset(): void {
        this.#id = null;
        this.#unavailable = false;
    }

    equals(other: Partial<UnavailableGuild>): boolean {
        return Boolean(this.#id === other.id && this.#unavailable === other.unavailable);
    }
}

export interface GuildSchema {
    readonly afkChannelId: Snowflake | null;
    readonly afkTimeout: Integer | null;
    readonly applicationId: Snowflake | null;
    readonly approximateMemberCount: Integer | null;
    readonly approximatePresenceCount: Integer | null;
    readonly banner: string | null;
    readonly defaultMessageNotifications: GuildDefaultMessageNotificationLevel | null;
    readonly description: string | null;
    readonly discoverySplash: string | null;
    readonly emojis: Emoji[];
    readonly explicitContentFilter: GuildExplicitContentFilterLevel | null;
    readonly features: GuildFeatures[];
    readonly icon: string | null;
    readonly iconHash: string | null;
    readonly id: Snowflake | null;
    readonly maxMembers: Integer | null;
    readonly maxPresences: Integer | null;
    readonly maxStageVideoChannelUsers: Integer | null;
    readonly maxVideoChannelUsers: Integer | null;
    readonly mfaLevel: GuildMfaLevel | null;
    readonly name: string | null;
    readonly nsfwLevel: GuildNsfwLevel | null;
    readonly owner: boolean;
    readonly ownerId: Snowflake | null;
    readonly permissions: string | null;
    readonly preferredLocale: LocaleKeys | null;
    readonly premiumProgressBarEnabled: boolean;
    readonly premiumSubscriptionCount: Integer | null;
    readonly premiumTier: PremiumTier | null;
    readonly publicUpdatesChannelId: Snowflake | null;
    /** @deprecated This field is deprecated */
    readonly region: string | null;
    readonly roles: Role[];
    readonly rulesChannelId: Snowflake | null;
    readonly safetyAlertsChannelId: Snowflake | null;
    readonly splash: string | null;
    readonly stickers: Sticker[];
    readonly systemChannelFlags: SystemChannelFlags | null;
    readonly systemChannelId: Snowflake | null;
    readonly vanityUrlCode: string | null;
    readonly verificationLevel: GuildVerificationLevel | null;
    readonly welcomeScreen: WelcomeScreen | null;
    readonly widgetChannelId: Snowflake | null;
    readonly widgetEnabled: boolean;
    readonly channels: ChannelStructure[];
    readonly guildScheduledEvents: GuildScheduledEventStructure[];
    readonly joinedAt: Iso8601Timestamp | null;
    readonly large: boolean;
    readonly memberCount: Integer | null;
    readonly members: GuildMember[];
    readonly presences: Partial<PresenceUpdateEventFields>[];
    readonly stageInstances: StageInstance[];
    readonly threads: ChannelStructure[];
    readonly unavailable: boolean;
    readonly voiceStates: Partial<VoiceStateStructure>[];
}

export class Guild extends Base<GuildStructure & GuildCreateExtraFields, GuildSchema> {
    #afkChannelId: Snowflake | null = null;
    #afkTimeout: Integer | null = null;
    #applicationId: Snowflake | null = null;
    #approximateMemberCount: Integer | null = null;
    #approximatePresenceCount: Integer | null = null;
    #banner: string | null = null;
    #defaultMessageNotifications: GuildDefaultMessageNotificationLevel | null = null;
    #description: string | null = null;
    #discoverySplash: string | null = null;
    #emojis: Emoji[] = [];
    #explicitContentFilter: GuildExplicitContentFilterLevel | null = null;
    #features: GuildFeatures[] = [];
    #icon: string | null = null;
    #iconHash: string | null = null;
    #id: Snowflake | null = null;
    #maxMembers: Integer | null = null;
    #maxPresences: Integer | null = null;
    #maxStageVideoChannelUsers: Integer | null = null;
    #maxVideoChannelUsers: Integer | null = null;
    #mfaLevel: GuildMfaLevel | null = null;
    #name: string | null = null;
    #nsfwLevel: GuildNsfwLevel | null = null;
    #owner = false;
    #ownerId: Snowflake | null = null;
    #permissions: string | null = null;
    #preferredLocale: LocaleKeys | null = null;
    #premiumProgressBarEnabled = false;
    #premiumSubscriptionCount: Integer | null = null;
    #premiumTier: PremiumTier | null = null;
    #publicUpdatesChannelId: Snowflake | null = null;
    /** @deprecated This field is deprecated and will be removed */
    #region: string | null = null;
    #roles: Role[] = [];
    #rulesChannelId: Snowflake | null = null;
    #safetyAlertsChannelId: Snowflake | null = null;
    #splash: string | null = null;
    #stickers: Sticker[] = [];
    #systemChannelFlags: SystemChannelFlags | null = null;
    #systemChannelId: Snowflake | null = null;
    #vanityUrlCode: string | null = null;
    #verificationLevel: GuildVerificationLevel | null = null;
    #welcomeScreen: WelcomeScreen | null = null;
    #widgetChannelId: Snowflake | null = null;
    #widgetEnabled = false;
    /** @todo Implement Channel Class */
    #channels: ChannelStructure[] = [];
    /** @todo Implement GuildScheduledEvent Class */
    #guildScheduledEvents: GuildScheduledEventStructure[] = [];
    #joinedAt: Iso8601Timestamp | null = null;
    #large = false;
    #memberCount: Integer | null = null;
    #members: GuildMember[] = [];
    #presences: Partial<PresenceUpdateEventFields>[] = [];
    #stageInstances: StageInstance[] = [];
    /** @todo Implement Channel Class */
    #threads: ChannelStructure[] = [];
    #unavailable = false;
    /** @todo Implement VoiceState Class */
    #voiceStates: Partial<VoiceStateStructure>[] = [];

    constructor(data: Partial<GuildStructure & GuildCreateExtraFields>) {
        super();
        this.patch(data);
    }

    get afkChannelId(): Snowflake | null {
        return this.#afkChannelId;
    }

    get afkTimeout(): Integer | null {
        return this.#afkTimeout;
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get approximateMemberCount(): Integer | null {
        return this.#approximateMemberCount;
    }

    get approximatePresenceCount(): Integer | null {
        return this.#approximatePresenceCount;
    }

    get banner(): string | null {
        return this.#banner;
    }

    get defaultMessageNotifications(): GuildDefaultMessageNotificationLevel | null {
        return this.#defaultMessageNotifications;
    }

    get description(): string | null {
        return this.#description;
    }

    get discoverySplash(): string | null {
        return this.#discoverySplash;
    }

    get emojis(): Emoji[] {
        return [...this.#emojis];
    }

    get explicitContentFilter(): GuildExplicitContentFilterLevel | null {
        return this.#explicitContentFilter;
    }

    get features(): GuildFeatures[] {
        return [...this.#features];
    }

    get icon(): string | null {
        return this.#icon;
    }

    get iconHash(): string | null {
        return this.#iconHash;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get maxMembers(): Integer | null {
        return this.#maxMembers;
    }

    get maxPresences(): Integer | null {
        return this.#maxPresences;
    }

    get maxStageVideoChannelUsers(): Integer | null {
        return this.#maxStageVideoChannelUsers;
    }

    get maxVideoChannelUsers(): Integer | null {
        return this.#maxVideoChannelUsers;
    }

    get mfaLevel(): GuildMfaLevel | null {
        return this.#mfaLevel;
    }

    get name(): string | null {
        return this.#name;
    }

    get nsfwLevel(): GuildNsfwLevel | null {
        return this.#nsfwLevel;
    }

    get owner(): boolean {
        return this.#owner;
    }

    get ownerId(): Snowflake | null {
        return this.#ownerId;
    }

    get permissions(): string | null {
        return this.#permissions;
    }

    get preferredLocale(): LocaleKeys | null {
        return this.#preferredLocale;
    }

    get premiumProgressBarEnabled(): boolean {
        return this.#premiumProgressBarEnabled;
    }

    get premiumSubscriptionCount(): Integer | null {
        return this.#premiumSubscriptionCount;
    }

    get premiumTier(): PremiumTier | null {
        return this.#premiumTier;
    }

    get publicUpdatesChannelId(): Snowflake | null {
        return this.#publicUpdatesChannelId;
    }

    get region(): string | null | undefined {
        return this.#region;
    }

    get roles(): Role[] {
        return [...this.#roles];
    }

    get rulesChannelId(): Snowflake | null {
        return this.#rulesChannelId;
    }

    get safetyAlertsChannelId(): Snowflake | null {
        return this.#safetyAlertsChannelId;
    }

    get splash(): string | null {
        return this.#splash;
    }

    get stickers(): Sticker[] {
        return [...this.#stickers];
    }

    get systemChannelFlags(): SystemChannelFlags | null {
        return this.#systemChannelFlags;
    }

    get systemChannelId(): Snowflake | null {
        return this.#systemChannelId;
    }

    get vanityUrlCode(): string | null {
        return this.#vanityUrlCode;
    }

    get verificationLevel(): GuildVerificationLevel | null {
        return this.#verificationLevel;
    }

    get welcomeScreen(): WelcomeScreen | null {
        return this.#welcomeScreen;
    }

    get widgetChannelId(): Snowflake | null {
        return this.#widgetChannelId;
    }

    get widgetEnabled(): boolean {
        return this.#widgetEnabled;
    }

    get channels(): ChannelStructure[] {
        return [...this.#channels];
    }

    get guildScheduledEvents(): GuildScheduledEventStructure[] {
        return [...this.#guildScheduledEvents];
    }

    get joinedAt(): Iso8601Timestamp | null {
        return this.#joinedAt;
    }

    get large(): boolean {
        return this.#large;
    }

    get memberCount(): Integer | null {
        return this.#memberCount;
    }

    get members(): GuildMember[] {
        return [...this.#members];
    }

    get presences(): Partial<PresenceUpdateEventFields>[] {
        return [...this.#presences];
    }

    get stageInstances(): StageInstance[] {
        return [...this.#stageInstances];
    }

    get threads(): ChannelStructure[] {
        return [...this.#threads];
    }

    get unavailable(): boolean {
        return this.#unavailable;
    }

    get voiceStates(): Partial<VoiceStateStructure>[] {
        return [...this.#voiceStates];
    }

    static from(data: Partial<GuildStructure & GuildCreateExtraFields>): Guild {
        return new Guild(data);
    }

    patch(data: Partial<GuildStructure & GuildCreateExtraFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#afkChannelId = data.afk_channel_id ?? this.#afkChannelId;
        this.#afkTimeout = data.afk_timeout ?? this.#afkTimeout;
        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#approximateMemberCount = data.approximate_member_count ?? this.#approximateMemberCount;
        this.#approximatePresenceCount = data.approximate_presence_count ?? this.#approximatePresenceCount;
        this.#banner = data.banner ?? this.#banner;
        this.#defaultMessageNotifications = data.default_message_notifications ?? this.#defaultMessageNotifications;
        this.#description = data.description ?? this.#description;
        this.#discoverySplash = data.discovery_splash ?? this.#discoverySplash;

        if (Array.isArray(data.emojis)) {
            this.#emojis = data.emojis.map((emoji) => Emoji.from(emoji));
        }

        this.#explicitContentFilter = data.explicit_content_filter ?? this.#explicitContentFilter;

        if (Array.isArray(data.features)) {
            this.#features = [...data.features];
        }

        this.#icon = data.icon ?? this.#icon;
        this.#iconHash = data.icon_hash ?? this.#iconHash;
        this.#id = data.id ?? this.#id;
        this.#maxMembers = data.max_members ?? this.#maxMembers;
        this.#maxPresences = data.max_presences ?? this.#maxPresences;
        this.#maxStageVideoChannelUsers = data.max_stage_video_channel_users ?? this.#maxStageVideoChannelUsers;
        this.#maxVideoChannelUsers = data.max_video_channel_users ?? this.#maxVideoChannelUsers;
        this.#mfaLevel = data.mfa_level ?? this.#mfaLevel;
        this.#name = data.name ?? this.#name;
        this.#nsfwLevel = data.nsfw_level ?? this.#nsfwLevel;
        this.#owner = Boolean(data.owner ?? this.#owner);
        this.#ownerId = data.owner_id ?? this.#ownerId;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#preferredLocale = data.preferred_locale ?? this.#preferredLocale;
        this.#premiumProgressBarEnabled = Boolean(data.premium_progress_bar_enabled ?? this.#premiumProgressBarEnabled);
        this.#premiumSubscriptionCount = data.premium_subscription_count ?? this.#premiumSubscriptionCount;
        this.#premiumTier = data.premium_tier ?? this.#premiumTier;
        this.#publicUpdatesChannelId = data.public_updates_channel_id ?? this.#publicUpdatesChannelId;
        this.#region = data.region ?? this.#region;

        if (Array.isArray(data.roles)) {
            this.#roles = data.roles.map((role) => Role.from(role));
        }

        this.#rulesChannelId = data.rules_channel_id ?? this.#rulesChannelId;
        this.#safetyAlertsChannelId = data.safety_alerts_channel_id ?? this.#safetyAlertsChannelId;
        this.#splash = data.splash ?? this.#splash;

        if (Array.isArray(data.stickers)) {
            this.#stickers = data.stickers.map((sticker) => Sticker.from(sticker));
        }

        this.#systemChannelFlags = data.system_channel_flags ?? this.#systemChannelFlags;
        this.#systemChannelId = data.system_channel_id ?? this.#systemChannelId;
        this.#vanityUrlCode = data.vanity_url_code ?? this.#vanityUrlCode;
        this.#verificationLevel = data.verification_level ?? this.#verificationLevel;

        if (data.welcome_screen) {
            this.#welcomeScreen = WelcomeScreen.from(data.welcome_screen);
        }

        this.#widgetChannelId = data.widget_channel_id ?? this.#widgetChannelId;
        this.#widgetEnabled = Boolean(data.widget_enabled ?? this.#widgetEnabled);

        // Extra fields
        this.#channels = data.channels ?? this.#channels;
        this.#guildScheduledEvents = data.guild_scheduled_events ?? this.#guildScheduledEvents;
        this.#joinedAt = data.joined_at ?? this.#joinedAt;
        this.#large = Boolean(data.large ?? this.#large);
        this.#memberCount = data.member_count ?? this.#memberCount;

        if (Array.isArray(data.members)) {
            this.#members = data.members.map((member) => GuildMember.from(member));
        }

        this.#presences = data.presences ?? this.#presences;

        if (Array.isArray(data.stage_instances)) {
            this.#stageInstances = data.stage_instances.map((instance) => StageInstance.from(instance));
        }

        this.#threads = data.threads ?? this.#threads;
        this.#unavailable = Boolean(data.unavailable ?? this.#unavailable);
        this.#voiceStates = data.voice_states ?? this.#voiceStates;
    }

    toJson(): Partial<GuildStructure & GuildCreateExtraFields> {
        return {
            afk_channel_id: this.#afkChannelId ?? undefined,
            afk_timeout: this.#afkTimeout ?? undefined,
            application_id: this.#applicationId ?? undefined,
            approximate_member_count: this.#approximateMemberCount ?? undefined,
            approximate_presence_count: this.#approximatePresenceCount ?? undefined,
            banner: this.#banner ?? undefined,
            default_message_notifications: this.#defaultMessageNotifications ?? undefined,
            description: this.#description ?? undefined,
            discovery_splash: this.#discoverySplash ?? undefined,
            emojis: this.#emojis.map((emoji) => emoji.toJson()) as EmojiStructure[],
            explicit_content_filter: this.#explicitContentFilter ?? undefined,
            features: [...this.#features],
            icon: this.#icon ?? undefined,
            icon_hash: this.#iconHash ?? undefined,
            id: this.#id ?? undefined,
            max_members: this.#maxMembers ?? undefined,
            max_presences: this.#maxPresences ?? undefined,
            max_stage_video_channel_users: this.#maxStageVideoChannelUsers ?? undefined,
            max_video_channel_users: this.#maxVideoChannelUsers ?? undefined,
            mfa_level: this.#mfaLevel ?? undefined,
            name: this.#name ?? undefined,
            nsfw_level: this.#nsfwLevel ?? undefined,
            owner: this.#owner,
            owner_id: this.#ownerId ?? undefined,
            permissions: this.#permissions ?? undefined,
            preferred_locale: this.#preferredLocale ?? undefined,
            premium_progress_bar_enabled: this.#premiumProgressBarEnabled,
            premium_subscription_count: this.#premiumSubscriptionCount ?? undefined,
            premium_tier: this.#premiumTier ?? undefined,
            public_updates_channel_id: this.#publicUpdatesChannelId ?? undefined,
            region: this.#region ?? undefined,
            roles: this.#roles.map((role) => role.toJson()) as RoleStructure[],
            rules_channel_id: this.#rulesChannelId ?? undefined,
            safety_alerts_channel_id: this.#safetyAlertsChannelId ?? undefined,
            splash: this.#splash ?? undefined,
            stickers: this.#stickers.map((sticker) => sticker.toJson()) as StickerStructure[],
            system_channel_flags: this.#systemChannelFlags ?? undefined,
            system_channel_id: this.#systemChannelId ?? undefined,
            vanity_url_code: this.#vanityUrlCode ?? undefined,
            verification_level: this.#verificationLevel ?? undefined,
            welcome_screen: this.#welcomeScreen?.toJson() as WelcomeScreenStructure,
            widget_channel_id: this.#widgetChannelId ?? undefined,
            widget_enabled: this.#widgetEnabled,
            channels: this.#channels,
            guild_scheduled_events: this.#guildScheduledEvents,
            joined_at: this.#joinedAt ?? undefined,
            large: this.#large,
            member_count: this.#memberCount ?? undefined,
            members: this.#members.map((member) => member.toJson()) as GuildMemberStructure[],
            presences: this.#presences,
            stage_instances: this.#stageInstances.map((instance) => instance.toJson()) as StageInstanceStructure[],
            threads: this.#threads,
            unavailable: this.#unavailable,
            voice_states: this.#voiceStates,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): GuildSchema {
        return {
            afkChannelId: this.#afkChannelId,
            afkTimeout: this.#afkTimeout,
            applicationId: this.#applicationId,
            approximateMemberCount: this.#approximateMemberCount,
            approximatePresenceCount: this.#approximatePresenceCount,
            banner: this.#banner,
            defaultMessageNotifications: this.#defaultMessageNotifications,
            description: this.#description,
            discoverySplash: this.#discoverySplash,
            emojis: [...this.#emojis],
            explicitContentFilter: this.#explicitContentFilter,
            features: [...this.#features],
            icon: this.#icon,
            iconHash: this.#iconHash,
            id: this.#id,
            maxMembers: this.#maxMembers,
            maxPresences: this.#maxPresences,
            maxStageVideoChannelUsers: this.#maxStageVideoChannelUsers,
            maxVideoChannelUsers: this.#maxVideoChannelUsers,
            mfaLevel: this.#mfaLevel,
            name: this.#name,
            nsfwLevel: this.#nsfwLevel,
            owner: this.#owner,
            ownerId: this.#ownerId,
            permissions: this.#permissions,
            preferredLocale: this.#preferredLocale,
            premiumProgressBarEnabled: this.#premiumProgressBarEnabled,
            premiumSubscriptionCount: this.#premiumSubscriptionCount,
            premiumTier: this.#premiumTier,
            publicUpdatesChannelId: this.#publicUpdatesChannelId,
            region: this.#region,
            roles: [...this.#roles],
            rulesChannelId: this.#rulesChannelId,
            safetyAlertsChannelId: this.#safetyAlertsChannelId,
            splash: this.#splash,
            stickers: [...this.#stickers],
            systemChannelFlags: this.#systemChannelFlags,
            systemChannelId: this.#systemChannelId,
            vanityUrlCode: this.#vanityUrlCode,
            verificationLevel: this.#verificationLevel,
            welcomeScreen: this.#welcomeScreen,
            widgetChannelId: this.#widgetChannelId,
            widgetEnabled: this.#widgetEnabled,
            channels: [...this.#channels],
            guildScheduledEvents: [...this.#guildScheduledEvents],
            joinedAt: this.#joinedAt,
            large: this.#large,
            memberCount: this.#memberCount,
            members: [...this.#members],
            presences: [...this.#presences],
            stageInstances: [...this.#stageInstances],
            threads: [...this.#threads],
            unavailable: this.#unavailable,
            voiceStates: [...this.#voiceStates],
        };
    }

    clone(): Guild {
        return new Guild(this.toJson());
    }

    reset(): void {
        this.#afkChannelId = null;
        this.#afkTimeout = null;
        this.#applicationId = null;
        this.#approximateMemberCount = null;
        this.#approximatePresenceCount = null;
        this.#banner = null;
        this.#defaultMessageNotifications = null;
        this.#description = null;
        this.#discoverySplash = null;
        this.#emojis = [];
        this.#explicitContentFilter = null;
        this.#features = [];
        this.#icon = null;
        this.#iconHash = null;
        this.#id = null;
        this.#maxMembers = null;
        this.#maxPresences = null;
        this.#maxStageVideoChannelUsers = null;
        this.#maxVideoChannelUsers = null;
        this.#mfaLevel = null;
        this.#name = null;
        this.#nsfwLevel = null;
        this.#owner = false;
        this.#ownerId = null;
        this.#permissions = null;
        this.#preferredLocale = null;
        this.#premiumProgressBarEnabled = false;
        this.#premiumSubscriptionCount = null;
        this.#premiumTier = null;
        this.#publicUpdatesChannelId = null;
        this.#region = null;
        this.#roles = [];
        this.#rulesChannelId = null;
        this.#safetyAlertsChannelId = null;
        this.#splash = null;
        this.#stickers = [];
        this.#systemChannelFlags = null;
        this.#systemChannelId = null;
        this.#vanityUrlCode = null;
        this.#verificationLevel = null;
        this.#welcomeScreen = null;
        this.#widgetChannelId = null;
        this.#widgetEnabled = false;
        this.#channels = [];
        this.#guildScheduledEvents = [];
        this.#joinedAt = null;
        this.#large = false;
        this.#memberCount = null;
        this.#members = [];
        this.#presences = [];
        this.#stageInstances = [];
        this.#threads = [];
        this.#unavailable = false;
        this.#voiceStates = [];
    }

    equals(other: Partial<Guild>): boolean {
        return Boolean(
            this.#afkChannelId === other.afkChannelId &&
                this.#afkTimeout === other.afkTimeout &&
                this.#applicationId === other.applicationId &&
                this.#approximateMemberCount === other.approximateMemberCount &&
                this.#approximatePresenceCount === other.approximatePresenceCount &&
                this.#banner === other.banner &&
                this.#defaultMessageNotifications === other.defaultMessageNotifications &&
                this.#description === other.description &&
                this.#discoverySplash === other.discoverySplash &&
                this.#emojis.length === other.emojis?.length &&
                this.#emojis.every((emoji, index) => emoji.equals(other.emojis?.[index] ?? {})) &&
                this.#explicitContentFilter === other.explicitContentFilter &&
                JSON.stringify(this.#features) === JSON.stringify(other.features) &&
                this.#icon === other.icon &&
                this.#iconHash === other.iconHash &&
                this.#id === other.id &&
                this.#maxMembers === other.maxMembers &&
                this.#maxPresences === other.maxPresences &&
                this.#maxStageVideoChannelUsers === other.maxStageVideoChannelUsers &&
                this.#maxVideoChannelUsers === other.maxVideoChannelUsers &&
                this.#mfaLevel === other.mfaLevel &&
                this.#name === other.name &&
                this.#nsfwLevel === other.nsfwLevel &&
                this.#owner === other.owner &&
                this.#ownerId === other.ownerId &&
                this.#permissions === other.permissions &&
                this.#preferredLocale === other.preferredLocale &&
                this.#premiumProgressBarEnabled === other.premiumProgressBarEnabled &&
                this.#premiumSubscriptionCount === other.premiumSubscriptionCount &&
                this.#premiumTier === other.premiumTier &&
                this.#publicUpdatesChannelId === other.publicUpdatesChannelId &&
                this.#region === other.region &&
                this.#roles.length === other.roles?.length &&
                this.#roles.every((role, index) => role.equals(other.roles?.[index] ?? {})) &&
                this.#rulesChannelId === other.rulesChannelId &&
                this.#safetyAlertsChannelId === other.safetyAlertsChannelId &&
                this.#splash === other.splash &&
                this.#stickers.length === other.stickers?.length &&
                this.#stickers.every((sticker, index) => sticker.equals(other.stickers?.[index] ?? {})) &&
                this.#systemChannelFlags === other.systemChannelFlags &&
                this.#systemChannelId === other.systemChannelId &&
                this.#vanityUrlCode === other.vanityUrlCode &&
                this.#verificationLevel === other.verificationLevel &&
                this.#welcomeScreen?.equals(other.welcomeScreen ?? {}) &&
                this.#widgetChannelId === other.widgetChannelId &&
                this.#widgetEnabled === other.widgetEnabled &&
                // Extra fields
                JSON.stringify(this.#channels) === JSON.stringify(other.channels) &&
                JSON.stringify(this.#guildScheduledEvents) === JSON.stringify(other.guildScheduledEvents) &&
                this.#joinedAt === other.joinedAt &&
                this.#large === other.large &&
                this.#memberCount === other.memberCount &&
                this.#members.length === other.members?.length &&
                this.#members.every((member, index) => member.equals(other.members?.[index] ?? {})) &&
                JSON.stringify(this.#presences) === JSON.stringify(other.presences) &&
                this.#stageInstances.length === other.stageInstances?.length &&
                this.#stageInstances.every((instance, index) => instance.equals(other.stageInstances?.[index] ?? {})) &&
                JSON.stringify(this.#threads) === JSON.stringify(other.threads) &&
                this.#unavailable === other.unavailable &&
                JSON.stringify(this.#voiceStates) === JSON.stringify(other.voiceStates),
        );
    }
}
