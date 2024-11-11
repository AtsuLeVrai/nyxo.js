import type {
    ActionRowStructure,
    AllowedMentionStructure,
    AllowedMentionTypes,
    ApplicationIntegrationTypes,
    AttachmentFlags,
    AttachmentStructure,
    BitfieldResolvable,
    ChannelMentionStructure,
    ChannelStructure,
    ChannelTypes,
    EmbedStructure,
    Float,
    Integer,
    InteractionTypes,
    Iso8601Timestamp,
    MessageActivityStructure,
    MessageActivityTypes,
    MessageCallStructure,
    MessageFlags,
    MessageInteractionMetadataStructure,
    MessageInteractionStructure,
    MessageReferenceStructure,
    MessageReferenceTypes,
    MessageSnapshotStructure,
    MessageStructure,
    MessageTypes,
    MimeTypes,
    ReactionCountDetailStructure,
    ReactionStructure,
    RoleSubscriptionDataStructure,
    Snowflake,
    StickerItemStructure,
    UserStructure,
} from "@nyxjs/core";
import { Application } from "./Applications.js";
import { Base } from "./Base.js";
import { Channel } from "./Channels.js";
import { Emoji } from "./Emojis.js";
import { User } from "./Users.js";

export interface RoleSubscriptionDataSchema {
    readonly isRenewal: boolean;
    readonly roleSubscriptionListingId: Snowflake | null;
    readonly tierName: string | null;
    readonly totalMonthsSubscribed: Integer;
}

export class RoleSubscriptionData
    extends Base<RoleSubscriptionDataStructure, RoleSubscriptionDataSchema>
    implements RoleSubscriptionDataSchema
{
    #isRenewal = false;
    #roleSubscriptionListingId: Snowflake | null = null;
    #tierName: string | null = null;
    #totalMonthsSubscribed = 0;

    constructor(data: Partial<RoleSubscriptionDataStructure>) {
        super();
        this.patch(data);
    }

    get isRenewal(): boolean {
        return this.#isRenewal;
    }

    get roleSubscriptionListingId(): Snowflake | null {
        return this.#roleSubscriptionListingId;
    }

    get tierName(): string | null {
        return this.#tierName;
    }

    get totalMonthsSubscribed(): Integer {
        return this.#totalMonthsSubscribed;
    }

    static from(data: Partial<RoleSubscriptionDataStructure>): RoleSubscriptionData {
        return new RoleSubscriptionData(data);
    }

    patch(data: Partial<RoleSubscriptionDataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#isRenewal = Boolean(data.is_renewal ?? this.#isRenewal);
        this.#roleSubscriptionListingId = data.role_subscription_listing_id ?? this.#roleSubscriptionListingId;
        this.#tierName = data.tier_name ?? this.#tierName;
        this.#totalMonthsSubscribed = data.total_months_subscribed ?? this.#totalMonthsSubscribed;
    }

    toJson(): Partial<RoleSubscriptionDataStructure> {
        return {
            is_renewal: this.#isRenewal,
            role_subscription_listing_id: this.#roleSubscriptionListingId ?? undefined,
            tier_name: this.#tierName ?? undefined,
            total_months_subscribed: this.#totalMonthsSubscribed,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): RoleSubscriptionDataSchema {
        return {
            isRenewal: this.#isRenewal,
            roleSubscriptionListingId: this.#roleSubscriptionListingId,
            tierName: this.#tierName,
            totalMonthsSubscribed: this.#totalMonthsSubscribed,
        };
    }

    clone(): RoleSubscriptionData {
        return new RoleSubscriptionData(this.toJson());
    }

    reset(): void {
        this.#isRenewal = false;
        this.#roleSubscriptionListingId = null;
        this.#tierName = null;
        this.#totalMonthsSubscribed = 0;
    }

    equals(other: Partial<RoleSubscriptionData>): boolean {
        return Boolean(
            this.#isRenewal === other.isRenewal &&
                this.#roleSubscriptionListingId === other.roleSubscriptionListingId &&
                this.#tierName === other.tierName &&
                this.#totalMonthsSubscribed === other.totalMonthsSubscribed,
        );
    }
}

export interface AllowedMentionSchema {
    readonly parse: AllowedMentionTypes[];
    readonly repliedUser: boolean;
    readonly roles: Snowflake[];
    readonly users: Snowflake[];
}

export class AllowedMention
    extends Base<AllowedMentionStructure, AllowedMentionSchema>
    implements AllowedMentionSchema
{
    #parse: AllowedMentionTypes[] = [];
    #repliedUser = false;
    #roles: Snowflake[] = [];
    #users: Snowflake[] = [];

    constructor(data: Partial<AllowedMentionStructure>) {
        super();
        this.patch(data);
    }

    get parse(): AllowedMentionTypes[] {
        return [...this.#parse];
    }

    get repliedUser(): boolean {
        return this.#repliedUser;
    }

    get roles(): Snowflake[] {
        return [...this.#roles];
    }

    get users(): Snowflake[] {
        return [...this.#users];
    }

    static from(data: Partial<AllowedMentionStructure>): AllowedMention {
        return new AllowedMention(data);
    }

    patch(data: Partial<AllowedMentionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#parse = data.parse ? [...data.parse] : this.#parse;
        this.#repliedUser = Boolean(data.replied_user ?? this.#repliedUser);

        if (data.roles) {
            if (data.roles.length > 100) {
                throw new RangeError("roles array cannot exceed 100 elements");
            }
            this.#roles = [...data.roles];
        }

        if (data.users) {
            if (data.users.length > 100) {
                throw new RangeError("users array cannot exceed 100 elements");
            }
            this.#users = [...data.users];
        }
    }

    toJson(): Partial<AllowedMentionStructure> {
        return {
            parse: this.#parse.length > 0 ? [...this.#parse] : undefined,
            replied_user: this.#repliedUser,
            roles: this.#roles.length > 0 ? [...this.#roles] : undefined,
            users: this.#users.length > 0 ? [...this.#users] : undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AllowedMentionSchema {
        return {
            parse: [...this.#parse],
            repliedUser: this.#repliedUser,
            roles: [...this.#roles],
            users: [...this.#users],
        };
    }

    clone(): AllowedMention {
        return new AllowedMention(this.toJson());
    }

    reset(): void {
        this.#parse = [];
        this.#repliedUser = false;
        this.#roles = [];
        this.#users = [];
    }

    equals(other: Partial<AllowedMention>): boolean {
        return Boolean(
            JSON.stringify(this.#parse) === JSON.stringify(other.parse) &&
                this.#repliedUser === other.repliedUser &&
                JSON.stringify(this.#roles) === JSON.stringify(other.roles) &&
                JSON.stringify(this.#users) === JSON.stringify(other.users),
        );
    }
}

export interface ChannelMentionSchema {
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly name: string | null;
    readonly type: ChannelTypes | null;
}

export class ChannelMention
    extends Base<ChannelMentionStructure, ChannelMentionSchema>
    implements ChannelMentionSchema
{
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #name: string | null = null;
    #type: ChannelTypes | null = null;

    constructor(data: Partial<ChannelMentionStructure>) {
        super();
        this.patch(data);
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get type(): ChannelTypes | null {
        return this.#type;
    }

    static from(data: Partial<ChannelMentionStructure>): ChannelMention {
        return new ChannelMention(data);
    }

    patch(data: Partial<ChannelMentionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<ChannelMentionStructure> {
        return {
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ChannelMentionSchema {
        return {
            guildId: this.#guildId,
            id: this.#id,
            name: this.#name,
            type: this.#type,
        };
    }

    clone(): ChannelMention {
        return new ChannelMention(this.toJson());
    }

    reset(): void {
        this.#guildId = null;
        this.#id = null;
        this.#name = null;
        this.#type = null;
    }

    equals(other: Partial<ChannelMention>): boolean {
        return Boolean(
            this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#name === other.name &&
                this.#type === other.type,
        );
    }
}

export interface AttachmentSchema {
    readonly contentType: MimeTypes | null;
    readonly description: string | null;
    readonly durationSecs: Float | null;
    readonly ephemeral: boolean;
    readonly filename: string | null;
    readonly flags: BitfieldResolvable<AttachmentFlags>;
    readonly height: Integer | null;
    readonly id: Snowflake | null;
    readonly proxyUrl: string | null;
    readonly size: Integer;
    readonly title: string | null;
    readonly url: string | null;
    readonly waveform: string | null;
    readonly width: Integer | null;
}

export class Attachment extends Base<AttachmentStructure, AttachmentSchema> implements AttachmentSchema {
    #contentType: MimeTypes | null = null;
    #description: string | null = null;
    #durationSecs: Float | null = null;
    #ephemeral = false;
    #filename: string | null = null;
    #flags: BitfieldResolvable<AttachmentFlags> = 0n;
    #height: Integer | null = null;
    #id: Snowflake | null = null;
    #proxyUrl: string | null = null;
    #size = 0;
    #title: string | null = null;
    #url: string | null = null;
    #waveform: string | null = null;
    #width: Integer | null = null;

    constructor(data: Partial<AttachmentStructure>) {
        super();
        this.patch(data);
    }

    get contentType(): MimeTypes | null {
        return this.#contentType;
    }

    get description(): string | null {
        return this.#description;
    }

    get durationSecs(): Float | null {
        return this.#durationSecs;
    }

    get ephemeral(): boolean {
        return this.#ephemeral;
    }

    get filename(): string | null {
        return this.#filename;
    }

    get flags(): BitfieldResolvable<AttachmentFlags> {
        return this.#flags;
    }

    get height(): Integer | null {
        return this.#height;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get proxyUrl(): string | null {
        return this.#proxyUrl;
    }

    get size(): Integer {
        return this.#size;
    }

    get title(): string | null {
        return this.#title;
    }

    get url(): string | null {
        return this.#url;
    }

    get waveform(): string | null {
        return this.#waveform;
    }

    get width(): Integer | null {
        return this.#width;
    }

    static from(data: Partial<AttachmentStructure>): Attachment {
        return new Attachment(data);
    }

    patch(data: Partial<AttachmentStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#contentType = data.content_type ?? this.#contentType;

        if (data.description !== undefined) {
            if (typeof data.description === "string" && data.description.length > 1024) {
                throw new RangeError("Description cannot exceed 1024 characters");
            }
            this.#description = data.description;
        }

        this.#durationSecs = data.duration_secs ?? this.#durationSecs;
        this.#ephemeral = Boolean(data.ephemeral ?? this.#ephemeral);
        this.#filename = data.filename ?? this.#filename;
        this.#flags = data.flags ?? this.#flags;
        this.#height = data.height ?? this.#height;
        this.#id = data.id ?? this.#id;
        this.#proxyUrl = data.proxy_url ?? this.#proxyUrl;
        this.#size = data.size ?? this.#size;
        this.#title = data.title ?? this.#title;
        this.#url = data.url ?? this.#url;
        this.#waveform = data.waveform ?? this.#waveform;
        this.#width = data.width ?? this.#width;
    }

    toJson(): Partial<AttachmentStructure> {
        return {
            content_type: this.#contentType ?? undefined,
            description: this.#description ?? undefined,
            duration_secs: this.#durationSecs ?? undefined,
            ephemeral: this.#ephemeral,
            filename: this.#filename ?? undefined,
            flags: this.#flags,
            height: this.#height ?? undefined,
            id: this.#id ?? undefined,
            proxy_url: this.#proxyUrl ?? undefined,
            size: this.#size,
            title: this.#title ?? undefined,
            url: this.#url ?? undefined,
            waveform: this.#waveform ?? undefined,
            width: this.#width ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): AttachmentSchema {
        return {
            contentType: this.#contentType,
            description: this.#description,
            durationSecs: this.#durationSecs,
            ephemeral: this.#ephemeral,
            filename: this.#filename,
            flags: this.#flags,
            height: this.#height,
            id: this.#id,
            proxyUrl: this.#proxyUrl,
            size: this.#size,
            title: this.#title,
            url: this.#url,
            waveform: this.#waveform,
            width: this.#width,
        };
    }

    clone(): Attachment {
        return new Attachment(this.toJson());
    }

    reset(): void {
        this.#contentType = null;
        this.#description = null;
        this.#durationSecs = null;
        this.#ephemeral = false;
        this.#filename = null;
        this.#flags = 0n;
        this.#height = null;
        this.#id = null;
        this.#proxyUrl = null;
        this.#size = 0;
        this.#title = null;
        this.#url = null;
        this.#waveform = null;
        this.#width = null;
    }

    equals(other: Partial<Attachment>): boolean {
        return Boolean(
            this.#contentType === other.contentType &&
                this.#description === other.description &&
                this.#durationSecs === other.durationSecs &&
                this.#ephemeral === other.ephemeral &&
                this.#filename === other.filename &&
                this.#flags === other.flags &&
                this.#height === other.height &&
                this.#id === other.id &&
                this.#proxyUrl === other.proxyUrl &&
                this.#size === other.size &&
                this.#title === other.title &&
                this.#url === other.url &&
                this.#waveform === other.waveform &&
                this.#width === other.width,
        );
    }
}

export interface ReactionCountDetailSchema {
    readonly burst: Integer;
    readonly normal: Integer;
}

export class ReactionCountDetail
    extends Base<ReactionCountDetailStructure, ReactionCountDetailSchema>
    implements ReactionCountDetailSchema
{
    #burst = 0;
    #normal = 0;

    constructor(data: Partial<ReactionCountDetailStructure>) {
        super();
        this.patch(data);
    }

    get burst(): Integer {
        return this.#burst;
    }

    get normal(): Integer {
        return this.#normal;
    }

    static from(data: Partial<ReactionCountDetailStructure>): ReactionCountDetail {
        return new ReactionCountDetail(data);
    }

    patch(data: Partial<ReactionCountDetailStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#burst = data.burst ?? this.#burst;
        this.#normal = data.normal ?? this.#normal;
    }

    toJson(): Partial<ReactionCountDetailStructure> {
        return {
            burst: this.#burst,
            normal: this.#normal,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ReactionCountDetailSchema {
        return {
            burst: this.#burst,
            normal: this.#normal,
        };
    }

    clone(): ReactionCountDetail {
        return new ReactionCountDetail(this.toJson());
    }

    reset(): void {
        this.#burst = 0;
        this.#normal = 0;
    }

    equals(other: Partial<ReactionCountDetail>): boolean {
        return Boolean(this.#burst === other.burst && this.#normal === other.normal);
    }
}

export interface ReactionSchema {
    readonly burstColors: string[];
    readonly count: Integer;
    readonly countDetails: ReactionCountDetail | null;
    readonly emoji: Emoji | null;
    readonly me: boolean;
    readonly meBurst: boolean;
}

export class Reaction extends Base<ReactionStructure, ReactionSchema> implements ReactionSchema {
    #burstColors: string[] = [];
    #count = 0;
    #countDetails: ReactionCountDetail | null = null;
    #emoji: Emoji | null = null;
    #me = false;
    #meBurst = false;

    constructor(data: Partial<ReactionStructure>) {
        super();
        this.patch(data);
    }

    get burstColors(): string[] {
        return [...this.#burstColors];
    }

    get count(): Integer {
        return this.#count;
    }

    get countDetails(): ReactionCountDetail | null {
        return this.#countDetails;
    }

    get emoji(): Emoji | null {
        return this.#emoji;
    }

    get me(): boolean {
        return this.#me;
    }

    get meBurst(): boolean {
        return this.#meBurst;
    }

    static from(data: Partial<ReactionStructure>): Reaction {
        return new Reaction(data);
    }

    patch(data: Partial<ReactionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#burstColors = data.burst_colors ? [...data.burst_colors] : this.#burstColors;
        this.#count = data.count ?? this.#count;
        this.#countDetails = data.count_details ? ReactionCountDetail.from(data.count_details) : this.#countDetails;
        this.#emoji = data.emoji ? Emoji.from(data.emoji) : this.#emoji;
        this.#me = Boolean(data.me ?? this.#me);
        this.#meBurst = Boolean(data.me_burst ?? this.#meBurst);
    }

    toJson(): Partial<ReactionStructure> {
        return {
            burst_colors: this.#burstColors.length > 0 ? [...this.#burstColors] : undefined,
            count: this.#count,
            count_details: (this.#countDetails?.toJson() as ReactionCountDetailStructure) ?? undefined,
            emoji: this.#emoji?.toJson(),
            me: this.#me,
            me_burst: this.#meBurst,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ReactionSchema {
        return {
            burstColors: [...this.#burstColors],
            count: this.#count,
            countDetails: this.#countDetails,
            emoji: this.#emoji,
            me: this.#me,
            meBurst: this.#meBurst,
        };
    }

    clone(): Reaction {
        return new Reaction(this.toJson());
    }

    reset(): void {
        this.#burstColors = [];
        this.#count = 0;
        this.#countDetails = null;
        this.#emoji = null;
        this.#me = false;
        this.#meBurst = false;
    }

    equals(other: Partial<Reaction>): boolean {
        return Boolean(
            JSON.stringify(this.#burstColors) === JSON.stringify(other.burstColors) &&
                this.#count === other.count &&
                this.#countDetails?.equals(other.countDetails ?? {}) &&
                this.#emoji?.equals(other.emoji ?? {}) &&
                this.#me === other.me &&
                this.#meBurst === other.meBurst,
        );
    }
}

export interface MessageReferenceSchema {
    readonly channelId: Snowflake | null;
    readonly failIfNotExists: boolean;
    readonly guildId: Snowflake | null;
    readonly messageId: Snowflake | null;
    readonly type: MessageReferenceTypes | null;
}

export class MessageReference
    extends Base<MessageReferenceStructure, MessageReferenceSchema>
    implements MessageReferenceSchema
{
    #channelId: Snowflake | null = null;
    #failIfNotExists = true;
    #guildId: Snowflake | null = null;
    #messageId: Snowflake | null = null;
    #type: MessageReferenceTypes | null = null;

    constructor(data: Partial<MessageReferenceStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get failIfNotExists(): boolean {
        return this.#failIfNotExists;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get messageId(): Snowflake | null {
        return this.#messageId;
    }

    get type(): MessageReferenceTypes | null {
        return this.#type;
    }

    static from(data: Partial<MessageReferenceStructure>): MessageReference {
        return new MessageReference(data);
    }

    patch(data: Partial<MessageReferenceStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#failIfNotExists = Boolean(data.fail_if_not_exists ?? this.#failIfNotExists);
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#messageId = data.message_id ?? this.#messageId;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<MessageReferenceStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            fail_if_not_exists: this.#failIfNotExists,
            guild_id: this.#guildId ?? undefined,
            message_id: this.#messageId ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageReferenceSchema {
        return {
            channelId: this.#channelId,
            failIfNotExists: this.#failIfNotExists,
            guildId: this.#guildId,
            messageId: this.#messageId,
            type: this.#type,
        };
    }

    clone(): MessageReference {
        return new MessageReference(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#failIfNotExists = true;
        this.#guildId = null;
        this.#messageId = null;
        this.#type = null;
    }

    equals(other: Partial<MessageReference>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#failIfNotExists === other.failIfNotExists &&
                this.#guildId === other.guildId &&
                this.#messageId === other.messageId &&
                this.#type === other.type,
        );
    }
}

export interface MessageCallSchema {
    readonly endedTimestamp: Iso8601Timestamp | null;
    readonly participants: Snowflake[];
}

export class MessageCall extends Base<MessageCallStructure, MessageCallSchema> implements MessageCallSchema {
    #endedTimestamp: Iso8601Timestamp | null = null;
    #participants: Snowflake[] = [];

    constructor(data: Partial<MessageCallStructure>) {
        super();
        this.patch(data);
    }

    get endedTimestamp(): Iso8601Timestamp | null {
        return this.#endedTimestamp;
    }

    get participants(): Snowflake[] {
        return [...this.#participants];
    }

    static from(data: Partial<MessageCallStructure>): MessageCall {
        return new MessageCall(data);
    }

    patch(data: Partial<MessageCallStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#endedTimestamp = data.ended_timestamp ?? this.#endedTimestamp;
        this.#participants = data.participants ? [...data.participants] : this.#participants;
    }

    toJson(): Partial<MessageCallStructure> {
        return {
            ended_timestamp: this.#endedTimestamp ?? undefined,
            participants: [...this.#participants],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageCallSchema {
        return {
            endedTimestamp: this.#endedTimestamp,
            participants: [...this.#participants],
        };
    }

    clone(): MessageCall {
        return new MessageCall(this.toJson());
    }

    reset(): void {
        this.#endedTimestamp = null;
        this.#participants = [];
    }

    equals(other: Partial<MessageCall>): boolean {
        return Boolean(
            this.#endedTimestamp === other.endedTimestamp &&
                JSON.stringify(this.#participants) === JSON.stringify(other.participants),
        );
    }
}

export interface MessageInteractionMetadataSchema {
    readonly authorizingIntegrationOwners: Record<ApplicationIntegrationTypes, Snowflake>;
    readonly id: Snowflake | null;
    readonly interactedMessageId: Snowflake | null;
    readonly originalResponseMessageId: Snowflake | null;
    readonly triggeringInteractionMetadata: MessageInteractionMetadata | null;
    readonly type: InteractionTypes | null;
    readonly user: User | null;
}

export class MessageInteractionMetadata
    extends Base<MessageInteractionMetadataStructure, MessageInteractionMetadataSchema>
    implements MessageInteractionMetadataSchema
{
    #authorizingIntegrationOwners: Record<ApplicationIntegrationTypes, Snowflake> = {} as Record<
        ApplicationIntegrationTypes,
        Snowflake
    >;
    #id: Snowflake | null = null;
    #interactedMessageId: Snowflake | null = null;
    #originalResponseMessageId: Snowflake | null = null;
    #triggeringInteractionMetadata: MessageInteractionMetadata | null = null;
    #type: InteractionTypes | null = null;
    #user: User | null = null;

    constructor(data: Partial<MessageInteractionMetadataStructure>) {
        super();
        this.patch(data);
    }

    get authorizingIntegrationOwners(): Record<ApplicationIntegrationTypes, Snowflake> {
        return { ...this.#authorizingIntegrationOwners };
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get interactedMessageId(): Snowflake | null {
        return this.#interactedMessageId;
    }

    get originalResponseMessageId(): Snowflake | null {
        return this.#originalResponseMessageId;
    }

    get triggeringInteractionMetadata(): MessageInteractionMetadata | null {
        return this.#triggeringInteractionMetadata;
    }

    get type(): InteractionTypes | null {
        return this.#type;
    }

    get user(): User | null {
        return this.#user;
    }

    static from(data: Partial<MessageInteractionMetadataStructure>): MessageInteractionMetadata {
        return new MessageInteractionMetadata(data);
    }

    patch(data: Partial<MessageInteractionMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.authorizing_integration_owners) {
            this.#authorizingIntegrationOwners = { ...data.authorizing_integration_owners };
        }

        this.#id = data.id ?? this.#id;
        this.#interactedMessageId = data.interacted_message_id ?? this.#interactedMessageId;
        this.#originalResponseMessageId = data.original_response_message_id ?? this.#originalResponseMessageId;
        this.#triggeringInteractionMetadata = data.triggering_interaction_metadata
            ? MessageInteractionMetadata.from(data.triggering_interaction_metadata)
            : this.#triggeringInteractionMetadata;
        this.#type = data.type ?? this.#type;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<MessageInteractionMetadataStructure> {
        return {
            authorizing_integration_owners: { ...this.#authorizingIntegrationOwners },
            id: this.#id ?? undefined,
            interacted_message_id: this.#interactedMessageId ?? undefined,
            original_response_message_id: this.#originalResponseMessageId ?? undefined,
            triggering_interaction_metadata:
                (this.#triggeringInteractionMetadata?.toJson() as MessageInteractionMetadataStructure) ?? undefined,
            type: this.#type ?? undefined,
            user: (this.#user?.toJson() as UserStructure) ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageInteractionMetadataSchema {
        return {
            authorizingIntegrationOwners: { ...this.#authorizingIntegrationOwners },
            id: this.#id,
            interactedMessageId: this.#interactedMessageId,
            originalResponseMessageId: this.#originalResponseMessageId,
            triggeringInteractionMetadata: this.#triggeringInteractionMetadata,
            type: this.#type,
            user: this.#user,
        };
    }

    clone(): MessageInteractionMetadata {
        return new MessageInteractionMetadata(this.toJson());
    }

    reset(): void {
        this.#authorizingIntegrationOwners = {} as Record<ApplicationIntegrationTypes, Snowflake>;
        this.#id = null;
        this.#interactedMessageId = null;
        this.#originalResponseMessageId = null;
        this.#triggeringInteractionMetadata = null;
        this.#type = null;
        this.#user = null;
    }

    equals(other: Partial<MessageInteractionMetadata>): boolean {
        return Boolean(
            JSON.stringify(this.#authorizingIntegrationOwners) === JSON.stringify(other.authorizingIntegrationOwners) &&
                this.#id === other.id &&
                this.#interactedMessageId === other.interactedMessageId &&
                this.#originalResponseMessageId === other.originalResponseMessageId &&
                this.#triggeringInteractionMetadata?.equals(other.triggeringInteractionMetadata ?? {}) &&
                this.#type === other.type &&
                this.#user?.equals(other.user ?? {}),
        );
    }
}

export interface MessageActivitySchema {
    readonly partyId: string | null;
    readonly type: MessageActivityTypes | null;
}

export class MessageActivity
    extends Base<MessageActivityStructure, MessageActivitySchema>
    implements MessageActivitySchema
{
    #partyId: string | null = null;
    #type: MessageActivityTypes | null = null;

    constructor(data: Partial<MessageActivityStructure>) {
        super();
        this.patch(data);
    }

    get partyId(): string | null {
        return this.#partyId;
    }

    get type(): MessageActivityTypes | null {
        return this.#type;
    }

    static from(data: Partial<MessageActivityStructure>): MessageActivity {
        return new MessageActivity(data);
    }

    patch(data: Partial<MessageActivityStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#partyId = data.party_id ?? this.#partyId;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<MessageActivityStructure> {
        return {
            party_id: this.#partyId ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageActivitySchema {
        return {
            partyId: this.#partyId,
            type: this.#type,
        };
    }

    clone(): MessageActivity {
        return new MessageActivity(this.toJson());
    }

    reset(): void {
        this.#partyId = null;
        this.#type = null;
    }

    equals(other: Partial<MessageActivity>): boolean {
        return Boolean(this.#partyId === other.partyId && this.#type === other.type);
    }
}

export interface MessageSnapshotSchema {
    readonly message: Pick<
        MessageStructure,
        | "attachments"
        | "components"
        | "content"
        | "edited_timestamp"
        | "embeds"
        | "flags"
        | "mention_roles"
        | "mentions"
        | "sticker_items"
        | "stickers"
        | "timestamp"
        | "type"
    > | null;
}

export class MessageSnapshot
    extends Base<MessageSnapshotStructure, MessageSnapshotSchema>
    implements MessageSnapshotSchema
{
    #message: Pick<
        MessageStructure,
        | "attachments"
        | "components"
        | "content"
        | "edited_timestamp"
        | "embeds"
        | "flags"
        | "mention_roles"
        | "mentions"
        | "sticker_items"
        | "stickers"
        | "timestamp"
        | "type"
    > | null = null;

    constructor(data: Partial<MessageSnapshotStructure>) {
        super();
        this.patch(data);
    }

    get message(): Pick<
        MessageStructure,
        | "attachments"
        | "components"
        | "content"
        | "edited_timestamp"
        | "embeds"
        | "flags"
        | "mention_roles"
        | "mentions"
        | "sticker_items"
        | "stickers"
        | "timestamp"
        | "type"
    > | null {
        return this.#message;
    }

    static from(data: Partial<MessageSnapshotStructure>): MessageSnapshot {
        return new MessageSnapshot(data);
    }

    patch(data: Partial<MessageSnapshotStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.message) {
            this.#message = {
                attachments: data.message.attachments,
                components: data.message.components,
                content: data.message.content,
                edited_timestamp: data.message.edited_timestamp,
                embeds: data.message.embeds,
                flags: data.message.flags,
                mention_roles: data.message.mention_roles,
                mentions: data.message.mentions,
                sticker_items: data.message.sticker_items,
                stickers: data.message.stickers,
                timestamp: data.message.timestamp,
                type: data.message.type,
            };
        }
    }

    toJson(): Partial<MessageSnapshotStructure> {
        return {
            message: this.#message ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageSnapshotSchema {
        return {
            message: this.#message,
        };
    }

    clone(): MessageSnapshot {
        return new MessageSnapshot(this.toJson());
    }

    reset(): void {
        this.#message = null;
    }

    equals(other: Partial<MessageSnapshot>): boolean {
        return Boolean(JSON.stringify(this.#message) === JSON.stringify(other.message));
    }
}

export interface MessageSchema {
    readonly activity: MessageActivity | null;
    readonly application: Application | null;
    readonly applicationId: Snowflake | null;
    readonly attachments: Attachment[];
    readonly author: User | null;
    readonly call: MessageCall | null;
    readonly channelId: Snowflake | null;
    readonly components: ActionRowStructure[];
    readonly content: string | null;
    readonly editedTimestamp: Iso8601Timestamp | null;
    readonly embeds: EmbedStructure[];
    readonly flags: BitfieldResolvable<MessageFlags>;
    readonly id: Snowflake | null;
    readonly interaction: MessageInteractionStructure | null;
    readonly interactionMetadata: MessageInteractionMetadata | null;
    readonly mentionChannels: ChannelMention[];
    readonly mentionEveryone: boolean;
    readonly mentionRoles: Snowflake[];
    readonly mentions: User[];
    readonly messageReference: MessageReference | null;
    readonly messageSnapshots: MessageSnapshot[];
    readonly nonce: string | null;
    readonly pinned: boolean;
    readonly position: Integer | null;
    readonly reactions: Reaction[];
    readonly referencedMessage: Message | null;
    readonly roleSubscriptionData: RoleSubscriptionData | null;
    readonly stickerItems: StickerItemStructure[];
    readonly thread: Channel | null;
    readonly timestamp: Iso8601Timestamp | null;
    readonly tts: boolean;
    readonly type: MessageTypes | null;
    readonly webhookId: Snowflake | null;
}

export class Message extends Base<MessageStructure, MessageSchema> implements MessageSchema {
    #activity: MessageActivity | null = null;
    #application: Application | null = null;
    #applicationId: Snowflake | null = null;
    #attachments: Attachment[] = [];
    #author: User | null = null;
    #call: MessageCall | null = null;
    #channelId: Snowflake | null = null;
    #components: ActionRowStructure[] = [];
    #content: string | null = null;
    #editedTimestamp: Iso8601Timestamp | null = null;
    #embeds: EmbedStructure[] = [];
    #flags: BitfieldResolvable<MessageFlags> = 0n;
    #id: Snowflake | null = null;
    #interaction: MessageInteractionStructure | null = null;
    #interactionMetadata: MessageInteractionMetadata | null = null;
    #mentionChannels: ChannelMention[] = [];
    #mentionEveryone = false;
    #mentionRoles: Snowflake[] = [];
    #mentions: User[] = [];
    #messageReference: MessageReference | null = null;
    #messageSnapshots: MessageSnapshot[] = [];
    #nonce: string | null = null;
    #pinned = false;
    #position: Integer | null = null;
    #reactions: Reaction[] = [];
    #referencedMessage: Message | null = null;
    #roleSubscriptionData: RoleSubscriptionData | null = null;
    #stickerItems: StickerItemStructure[] = [];
    #thread: Channel | null = null;
    #timestamp: Iso8601Timestamp | null = null;
    #tts = false;
    #type: MessageTypes | null = null;
    #webhookId: Snowflake | null = null;

    constructor(data: Partial<MessageStructure>) {
        super();
        this.patch(data);
    }

    // Getters
    get activity(): MessageActivity | null {
        return this.#activity;
    }

    get application(): Application | null {
        return this.#application;
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get attachments(): Attachment[] {
        return [...this.#attachments];
    }

    get author(): User | null {
        return this.#author;
    }

    get call(): MessageCall | null {
        return this.#call;
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get components(): ActionRowStructure[] {
        return [...this.#components];
    }

    get content(): string | null {
        return this.#content;
    }

    get editedTimestamp(): Iso8601Timestamp | null {
        return this.#editedTimestamp;
    }

    get embeds(): EmbedStructure[] {
        return [...this.#embeds];
    }

    get flags(): BitfieldResolvable<MessageFlags> {
        return this.#flags;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get interaction(): MessageInteractionStructure | null {
        return this.#interaction;
    }

    get interactionMetadata(): MessageInteractionMetadata | null {
        return this.#interactionMetadata;
    }

    get mentionChannels(): ChannelMention[] {
        return [...this.#mentionChannels];
    }

    get mentionEveryone(): boolean {
        return this.#mentionEveryone;
    }

    get mentionRoles(): Snowflake[] {
        return [...this.#mentionRoles];
    }

    get mentions(): User[] {
        return [...this.#mentions];
    }

    get messageReference(): MessageReference | null {
        return this.#messageReference;
    }

    get messageSnapshots(): MessageSnapshot[] {
        return [...this.#messageSnapshots];
    }

    get nonce(): string | null {
        return this.#nonce;
    }

    get pinned(): boolean {
        return this.#pinned;
    }

    get position(): Integer | null {
        return this.#position;
    }

    get reactions(): Reaction[] {
        return [...this.#reactions];
    }

    get referencedMessage(): Message | null {
        return this.#referencedMessage;
    }

    get roleSubscriptionData(): RoleSubscriptionData | null {
        return this.#roleSubscriptionData;
    }

    get stickerItems(): StickerItemStructure[] {
        return [...this.#stickerItems];
    }

    get thread(): Channel | null {
        return this.#thread;
    }

    get timestamp(): Iso8601Timestamp | null {
        return this.#timestamp;
    }

    get tts(): boolean {
        return this.#tts;
    }

    get type(): MessageTypes | null {
        return this.#type;
    }

    get webhookId(): Snowflake | null {
        return this.#webhookId;
    }

    static from(data: Partial<MessageStructure>): Message {
        return new Message(data);
    }

    patch(data: Partial<MessageStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#activity = data.activity ? MessageActivity.from(data.activity) : this.#activity;
        this.#application = data.application ? Application.from(data.application) : this.#application;
        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#attachments = data.attachments
            ? data.attachments.map((attachment) => Attachment.from(attachment))
            : this.#attachments;
        this.#author = data.author ? User.from(data.author) : this.#author;
        this.#call = data.call ? MessageCall.from(data.call) : this.#call;
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#components = data.components ? [...data.components] : this.#components;
        this.#content = data.content ?? this.#content;
        this.#editedTimestamp = data.edited_timestamp ?? this.#editedTimestamp;
        this.#embeds = data.embeds ?? this.#embeds;
        this.#flags = data.flags ?? this.#flags;
        this.#id = data.id ?? this.#id;
        this.#interaction = data.interaction ?? this.#interaction;
        this.#interactionMetadata = data.interaction_metadata
            ? MessageInteractionMetadata.from(data.interaction_metadata)
            : this.#interactionMetadata;
        this.#mentionChannels = data.mention_channels
            ? data.mention_channels.map((channel) => ChannelMention.from(channel))
            : this.#mentionChannels;
        this.#mentionEveryone = Boolean(data.mention_everyone ?? this.#mentionEveryone);
        this.#mentionRoles = data.mention_roles ? [...data.mention_roles] : this.#mentionRoles;
        this.#mentions = data.mentions ? data.mentions.map((user) => User.from(user)) : this.#mentions;
        this.#messageReference = data.message_reference
            ? MessageReference.from(data.message_reference)
            : this.#messageReference;
        this.#messageSnapshots = data.message_snapshots
            ? data.message_snapshots.map((snapshot) => MessageSnapshot.from(snapshot))
            : this.#messageSnapshots;
        this.#nonce = data.nonce?.toString() ?? this.#nonce;
        this.#pinned = Boolean(data.pinned ?? this.#pinned);
        this.#position = data.position ?? this.#position;
        this.#reactions = data.reactions ? data.reactions.map((reaction) => Reaction.from(reaction)) : this.#reactions;
        this.#referencedMessage = data.referenced_message
            ? Message.from(data.referenced_message)
            : this.#referencedMessage;
        this.#roleSubscriptionData = data.role_subscription_data
            ? RoleSubscriptionData.from(data.role_subscription_data)
            : this.#roleSubscriptionData;
        this.#stickerItems = data.sticker_items ?? this.#stickerItems;
        this.#thread = data.thread ? Channel.from(data.thread) : this.#thread;
        this.#timestamp = data.timestamp ?? this.#timestamp;
        this.#tts = Boolean(data.tts ?? this.#tts);
        this.#type = data.type ?? this.#type;
        this.#webhookId = data.webhook_id ?? this.#webhookId;
    }

    toJson(): Partial<MessageStructure> {
        return {
            activity: this.#activity?.toJson() as MessageActivityStructure,
            application: this.#application?.toJson(),
            application_id: this.#applicationId ?? undefined,
            attachments: this.#attachments.map((attachment) => attachment.toJson()) as AttachmentStructure[],
            author: this.#author?.toJson() as UserStructure,
            call: this.#call?.toJson() as MessageCallStructure,
            channel_id: this.#channelId ?? undefined,
            components: [...this.#components],
            content: this.#content ?? undefined,
            edited_timestamp: this.#editedTimestamp ?? undefined,
            embeds: [...this.#embeds],
            flags: this.#flags,
            id: this.#id ?? undefined,
            interaction: this.#interaction ?? undefined,
            interaction_metadata: this.#interactionMetadata?.toJson() as MessageInteractionMetadataStructure,
            mention_channels: this.#mentionChannels.map((channel) => channel.toJson()) as ChannelMentionStructure[],
            mention_everyone: this.#mentionEveryone,
            mention_roles: [...this.#mentionRoles],
            mentions: this.#mentions.map((user) => user.toJson()) as UserStructure[],
            message_reference: this.#messageReference?.toJson(),
            message_snapshots: this.#messageSnapshots.map((snapshot) =>
                snapshot.toJson(),
            ) as MessageSnapshotStructure[],
            nonce: this.#nonce ?? undefined,
            pinned: this.#pinned,
            position: this.#position ?? undefined,
            reactions: this.#reactions.map((reaction) => reaction.toJson()) as ReactionStructure[],
            referenced_message: this.#referencedMessage?.toJson() as MessageStructure,
            role_subscription_data: this.#roleSubscriptionData?.toJson() as RoleSubscriptionDataStructure,
            sticker_items: [...this.#stickerItems],
            thread: this.#thread?.toJson() as ChannelStructure,
            timestamp: this.#timestamp ?? undefined,
            tts: this.#tts,
            type: this.#type ?? undefined,
            webhook_id: this.#webhookId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessageSchema {
        return {
            activity: this.#activity,
            application: this.#application,
            applicationId: this.#applicationId,
            attachments: this.#attachments,
            author: this.#author,
            call: this.#call,
            channelId: this.#channelId,
            components: this.#components,
            content: this.#content,
            editedTimestamp: this.#editedTimestamp,
            embeds: this.#embeds,
            flags: this.#flags,
            id: this.#id,
            interaction: this.#interaction,
            interactionMetadata: this.#interactionMetadata,
            mentionChannels: this.#mentionChannels,
            mentionEveryone: this.#mentionEveryone,
            mentionRoles: this.#mentionRoles,
            mentions: this.#mentions,
            messageReference: this.#messageReference,
            messageSnapshots: this.#messageSnapshots,
            nonce: this.#nonce,
            pinned: this.#pinned,
            position: this.#position,
            reactions: this.#reactions,
            referencedMessage: this.#referencedMessage,
            roleSubscriptionData: this.#roleSubscriptionData,
            stickerItems: this.#stickerItems,
            thread: this.#thread,
            timestamp: this.#timestamp,
            tts: this.#tts,
            type: this.#type,
            webhookId: this.#webhookId,
        };
    }

    clone(): Message {
        return new Message(this.toJson());
    }

    reset(): void {
        this.#activity = null;
        this.#application = null;
        this.#applicationId = null;
        this.#attachments = [];
        this.#author = null;
        this.#call = null;
        this.#channelId = null;
        this.#components = [];
        this.#content = null;
        this.#editedTimestamp = null;
        this.#embeds = [];
        this.#flags = 0n;
        this.#id = null;
        this.#interaction = null;
        this.#interactionMetadata = null;
        this.#mentionChannels = [];
        this.#mentionEveryone = false;
        this.#mentionRoles = [];
        this.#mentions = [];
        this.#messageReference = null;
        this.#messageSnapshots = [];
        this.#nonce = null;
        this.#pinned = false;
        this.#position = null;
        this.#reactions = [];
        this.#referencedMessage = null;
        this.#roleSubscriptionData = null;
        this.#stickerItems = [];
        this.#thread = null;
        this.#timestamp = null;
        this.#tts = false;
        this.#type = null;
        this.#webhookId = null;
    }

    equals(other: Partial<Message>): boolean {
        return Boolean(
            this.#activity?.equals(other.activity ?? {}) &&
                this.#application?.equals(other.application ?? {}) &&
                this.#applicationId === other.applicationId &&
                JSON.stringify(this.#attachments) ===
                    JSON.stringify(other.attachments?.map((attachment) => attachment.valueOf())) &&
                this.#author?.equals(other.author ?? {}) &&
                this.#call?.equals(other.call ?? {}) &&
                this.#channelId === other.channelId &&
                JSON.stringify(this.#components) === JSON.stringify(other.components) &&
                this.#content === other.content &&
                this.#editedTimestamp === other.editedTimestamp &&
                JSON.stringify(this.#embeds) === JSON.stringify(other.embeds) &&
                this.#flags === other.flags &&
                this.#id === other.id &&
                JSON.stringify(this.#interaction) === JSON.stringify(other.interaction) &&
                this.#interactionMetadata?.equals(other.interactionMetadata ?? {}) &&
                JSON.stringify(this.#mentionChannels) ===
                    JSON.stringify(other.mentionChannels?.map((channel) => channel.valueOf())) &&
                this.#mentionEveryone === other.mentionEveryone &&
                JSON.stringify(this.#mentionRoles) === JSON.stringify(other.mentionRoles) &&
                JSON.stringify(this.#mentions) === JSON.stringify(other.mentions?.map((user) => user.valueOf())) &&
                this.#messageReference?.equals(other.messageReference ?? {}) &&
                JSON.stringify(this.#messageSnapshots) ===
                    JSON.stringify(other.messageSnapshots?.map((snapshot) => snapshot.valueOf())) &&
                this.#nonce === other.nonce &&
                this.#pinned === other.pinned &&
                this.#position === other.position &&
                JSON.stringify(this.#reactions) ===
                    JSON.stringify(other.reactions?.map((reaction) => reaction.valueOf())) &&
                this.#referencedMessage?.equals(other.referencedMessage ?? {}) &&
                this.#roleSubscriptionData?.equals(other.roleSubscriptionData ?? {}) &&
                JSON.stringify(this.#stickerItems) === JSON.stringify(other.stickerItems) &&
                this.#thread?.equals(other.thread ?? {}) &&
                this.#timestamp === other.timestamp &&
                this.#tts === other.tts &&
                this.#type === other.type &&
                this.#webhookId === other.webhookId,
        );
    }
}
