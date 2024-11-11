import {
    type BitfieldResolvable,
    type BitwisePermissions,
    type ChannelFlags,
    type ChannelStructure,
    ChannelTypes,
    type DefaultReactionStructure,
    type FollowedChannelStructure,
    type ForumLayoutTypes,
    type ForumTagStructure,
    type GuildMemberStructure,
    type Integer,
    type Iso8601Timestamp,
    type OverwriteStructure,
    type OverwriteTypes,
    type Snowflake,
    type SortOrderTypes,
    type ThreadMemberStructure,
    type ThreadMetadataStructure,
    type UserStructure,
    type VideoQualityModes,
} from "@nyxjs/core";
import type {
    ChannelPinsUpdateEventFields,
    ThreadListSyncEventFields,
    ThreadMemberUpdateEventExtraFields,
    ThreadMembersUpdateEventFields,
} from "@nyxjs/gateway";
import { Base } from "./Base.js";
import { GuildMember } from "./Guilds.js";
import { User } from "./Users.js";

export interface ForumTagSchema {
    readonly emojiId: Snowflake | null;
    readonly emojiName: string | null;
    readonly id: Snowflake | null;
    readonly moderated: boolean;
    readonly name: string | null;
}

export class ForumTag extends Base<ForumTagStructure, ForumTagSchema> implements ForumTagSchema {
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;
    #id: Snowflake | null = null;
    #moderated = false;
    #name: string | null = null;

    constructor(data: Partial<ForumTagStructure>) {
        super();
        this.patch(data);
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

    get moderated(): boolean {
        return this.#moderated;
    }

    get name(): string | null {
        return this.#name;
    }

    static from(data: Partial<ForumTagStructure>): ForumTag {
        return new ForumTag(data);
    }

    patch(data: Partial<ForumTagStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
        this.#id = data.id ?? this.#id;
        this.#moderated = Boolean(data.moderated ?? this.#moderated);
        this.#name = data.name ?? this.#name;
    }

    toJson(): Partial<ForumTagStructure> {
        return {
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
            id: this.#id ?? undefined,
            moderated: this.#moderated,
            name: this.#name ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ForumTagSchema {
        return {
            emojiId: this.#emojiId,
            emojiName: this.#emojiName,
            id: this.#id,
            moderated: this.#moderated,
            name: this.#name,
        };
    }

    clone(): ForumTag {
        return new ForumTag(this.toJson());
    }

    reset(): void {
        this.#emojiId = null;
        this.#emojiName = null;
        this.#id = null;
        this.#moderated = false;
        this.#name = null;
    }

    equals(other: Partial<ForumTag>): boolean {
        return Boolean(
            this.#emojiId === other.emojiId &&
                this.#emojiName === other.emojiName &&
                this.#id === other.id &&
                this.#moderated === other.moderated &&
                this.#name === other.name,
        );
    }
}

export interface DefaultReactionSchema {
    readonly emojiId: Snowflake | null;
    readonly emojiName: string | null;
}

export class DefaultReaction
    extends Base<DefaultReactionStructure, DefaultReactionSchema>
    implements DefaultReactionSchema
{
    #emojiId: Snowflake | null = null;
    #emojiName: string | null = null;

    constructor(data: Partial<DefaultReactionStructure>) {
        super();
        this.patch(data);
    }

    get emojiId(): Snowflake | null {
        return this.#emojiId;
    }

    get emojiName(): string | null {
        return this.#emojiName;
    }

    static from(data: Partial<DefaultReactionStructure>): DefaultReaction {
        return new DefaultReaction(data);
    }

    patch(data: Partial<DefaultReactionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#emojiId = data.emoji_id ?? this.#emojiId;
        this.#emojiName = data.emoji_name ?? this.#emojiName;
    }

    toJson(): Partial<DefaultReactionStructure> {
        return {
            emoji_id: this.#emojiId ?? undefined,
            emoji_name: this.#emojiName ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): DefaultReactionSchema {
        return {
            emojiId: this.#emojiId,
            emojiName: this.#emojiName,
        };
    }

    clone(): DefaultReaction {
        return new DefaultReaction(this.toJson());
    }

    reset(): void {
        this.#emojiId = null;
        this.#emojiName = null;
    }

    equals(other: Partial<DefaultReaction>): boolean {
        return Boolean(this.#emojiId === other.emojiId && this.#emojiName === other.emojiName);
    }
}

export interface ThreadMemberUpdateEventSchema {
    readonly guildId: Snowflake | null;
}

export interface ThreadMemberSchema extends ThreadMemberUpdateEventSchema {
    readonly flags: Integer;
    readonly id: Snowflake | null;
    readonly joinTimestamp: Iso8601Timestamp | null;
    readonly member: GuildMember | null;
    readonly userId: Snowflake | null;
}

export class ThreadMember
    extends Base<ThreadMemberStructure & ThreadMemberUpdateEventExtraFields, ThreadMemberSchema>
    implements ThreadMemberSchema
{
    #flags = 0;
    #id: Snowflake | null = null;
    #joinTimestamp: Iso8601Timestamp | null = null;
    #member: GuildMember | null = null;
    #userId: Snowflake | null = null;
    #guildId: Snowflake | null = null;

    constructor(data: Partial<ThreadMemberStructure & ThreadMemberUpdateEventExtraFields>) {
        super();
        this.patch(data);
    }

    get flags(): Integer {
        return this.#flags;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get joinTimestamp(): Iso8601Timestamp | null {
        return this.#joinTimestamp;
    }

    get member(): GuildMember | null {
        return this.#member;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    static from(data: Partial<ThreadMemberStructure & ThreadMemberUpdateEventExtraFields>): ThreadMember {
        return new ThreadMember(data);
    }

    patch(data: Partial<ThreadMemberStructure & ThreadMemberUpdateEventExtraFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#flags = data.flags ?? this.#flags;
        this.#id = data.id ?? this.#id;
        this.#joinTimestamp = data.join_timestamp ?? this.#joinTimestamp;
        this.#member = data.member ? GuildMember.from(data.member) : this.#member;
        this.#userId = data.user_id ?? this.#userId;
        this.#guildId = data.guild_id ?? this.#guildId;
    }

    toJson(): Partial<ThreadMemberStructure & ThreadMemberUpdateEventExtraFields> {
        return {
            flags: this.#flags,
            id: this.#id ?? undefined,
            join_timestamp: this.#joinTimestamp ?? undefined,
            member: this.#member?.toJson() as GuildMemberStructure,
            user_id: this.#userId ?? undefined,
            guild_id: this.#guildId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ThreadMemberSchema {
        return {
            flags: this.#flags,
            id: this.#id,
            joinTimestamp: this.#joinTimestamp,
            member: this.#member,
            userId: this.#userId,
            guildId: this.#guildId,
        };
    }

    clone(): ThreadMember {
        return new ThreadMember(this.toJson());
    }

    reset(): void {
        this.#flags = 0;
        this.#id = null;
        this.#joinTimestamp = null;
        this.#member = null;
        this.#userId = null;
    }

    equals(other: Partial<ThreadMember>): boolean {
        return Boolean(
            this.#flags === other.flags &&
                this.#id === other.id &&
                this.#joinTimestamp === other.joinTimestamp &&
                this.#member?.equals(other.member ?? {}) &&
                this.#userId === other.userId,
        );
    }
}

export interface ThreadMetadataSchema {
    readonly archiveTimestamp: Iso8601Timestamp | null;
    readonly archived: boolean;
    readonly autoArchiveDuration: Integer;
    readonly createTimestamp: Iso8601Timestamp | null;
    readonly invitable: boolean;
    readonly locked: boolean;
}

export class ThreadMetadata
    extends Base<ThreadMetadataStructure, ThreadMetadataSchema>
    implements ThreadMetadataSchema
{
    #archiveTimestamp: Iso8601Timestamp | null = null;
    #archived = false;
    #autoArchiveDuration = 0;
    #createTimestamp: Iso8601Timestamp | null = null;
    #invitable = false;
    #locked = false;

    constructor(data: Partial<ThreadMetadataStructure>) {
        super();
        this.patch(data);
    }

    get archiveTimestamp(): Iso8601Timestamp | null {
        return this.#archiveTimestamp;
    }

    get archived(): boolean {
        return this.#archived;
    }

    get autoArchiveDuration(): Integer {
        return this.#autoArchiveDuration;
    }

    get createTimestamp(): Iso8601Timestamp | null {
        return this.#createTimestamp;
    }

    get invitable(): boolean {
        return this.#invitable;
    }

    get locked(): boolean {
        return this.#locked;
    }

    static from(data: Partial<ThreadMetadataStructure>): ThreadMetadata {
        return new ThreadMetadata(data);
    }

    patch(data: Partial<ThreadMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#archiveTimestamp = data.archive_timestamp ?? this.#archiveTimestamp;
        this.#archived = Boolean(data.archived ?? this.#archived);
        this.#autoArchiveDuration = data.auto_archive_duration ?? this.#autoArchiveDuration;
        this.#createTimestamp = data.create_timestamp ?? this.#createTimestamp;
        this.#invitable = Boolean(data.invitable ?? this.#invitable);
        this.#locked = Boolean(data.locked ?? this.#locked);
    }

    toJson(): Partial<ThreadMetadataStructure> {
        return {
            archive_timestamp: this.#archiveTimestamp ?? undefined,
            archived: this.#archived,
            auto_archive_duration: this.#autoArchiveDuration,
            create_timestamp: this.#createTimestamp ?? undefined,
            invitable: this.#invitable,
            locked: this.#locked,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ThreadMetadataSchema {
        return {
            archiveTimestamp: this.#archiveTimestamp,
            archived: this.#archived,
            autoArchiveDuration: this.#autoArchiveDuration,
            createTimestamp: this.#createTimestamp,
            invitable: this.#invitable,
            locked: this.#locked,
        };
    }

    clone(): ThreadMetadata {
        return new ThreadMetadata(this.toJson());
    }

    reset(): void {
        this.#archiveTimestamp = null;
        this.#archived = false;
        this.#autoArchiveDuration = 0;
        this.#createTimestamp = null;
        this.#invitable = false;
        this.#locked = false;
    }

    equals(other: Partial<ThreadMetadata>): boolean {
        return Boolean(
            this.#archiveTimestamp === other.archiveTimestamp &&
                this.#archived === other.archived &&
                this.#autoArchiveDuration === other.autoArchiveDuration &&
                this.#createTimestamp === other.createTimestamp &&
                this.#invitable === other.invitable &&
                this.#locked === other.locked,
        );
    }
}

export interface OverwriteSchema {
    readonly allow: BitfieldResolvable<BitwisePermissions>;
    readonly deny: BitfieldResolvable<BitwisePermissions>;
    readonly id: Snowflake | null;
    readonly type: OverwriteTypes | null;
}

export class Overwrite extends Base<OverwriteStructure, OverwriteSchema> implements OverwriteSchema {
    #allow: BitfieldResolvable<BitwisePermissions> = 0n;
    #deny: BitfieldResolvable<BitwisePermissions> = 0n;
    #id: Snowflake | null = null;
    #type: OverwriteTypes | null = null;

    constructor(data: Partial<OverwriteStructure>) {
        super();
        this.patch(data);
    }

    get allow(): BitfieldResolvable<BitwisePermissions> {
        return this.#allow;
    }

    get deny(): BitfieldResolvable<BitwisePermissions> {
        return this.#deny;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get type(): OverwriteTypes | null {
        return this.#type;
    }

    static from(data: Partial<OverwriteStructure>): Overwrite {
        return new Overwrite(data);
    }

    patch(data: Partial<OverwriteStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#allow = data.allow ?? this.#allow;
        this.#deny = data.deny ?? this.#deny;
        this.#id = data.id ?? this.#id;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<OverwriteStructure> {
        return {
            allow: this.#allow,
            deny: this.#deny,
            id: this.#id ?? undefined,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): OverwriteSchema {
        return {
            allow: this.#allow,
            deny: this.#deny,
            id: this.#id,
            type: this.#type,
        };
    }

    clone(): Overwrite {
        return new Overwrite(this.toJson());
    }

    reset(): void {
        this.#allow = 0n;
        this.#deny = 0n;
        this.#id = null;
        this.#type = null;
    }

    equals(other: Partial<Overwrite>): boolean {
        return Boolean(
            this.#allow === other.allow &&
                this.#deny === other.deny &&
                this.#id === other.id &&
                this.#type === other.type,
        );
    }
}

export interface FollowedChannelSchema {
    readonly channelId: Snowflake | null;
    readonly webhookId: Snowflake | null;
}

export class FollowedChannel
    extends Base<FollowedChannelStructure, FollowedChannelSchema>
    implements FollowedChannelSchema
{
    #channelId: Snowflake | null = null;
    #webhookId: Snowflake | null = null;

    constructor(data: Partial<FollowedChannelStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get webhookId(): Snowflake | null {
        return this.#webhookId;
    }

    static from(data: Partial<FollowedChannelStructure>): FollowedChannel {
        return new FollowedChannel(data);
    }

    patch(data: Partial<FollowedChannelStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#webhookId = data.webhook_id ?? this.#webhookId;
    }

    toJson(): Partial<FollowedChannelStructure> {
        return {
            channel_id: this.#channelId ?? undefined,
            webhook_id: this.#webhookId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): FollowedChannelSchema {
        return {
            channelId: this.#channelId,
            webhookId: this.#webhookId,
        };
    }

    clone(): FollowedChannel {
        return new FollowedChannel(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#webhookId = null;
    }

    equals(other: Partial<FollowedChannel>): boolean {
        return Boolean(this.#channelId === other.channelId && this.#webhookId === other.webhookId);
    }
}

export interface ChannelPinsSchema {
    readonly channelId: Snowflake | null;
    readonly guildId: Snowflake | null;
    readonly lastPinTimestamp: Iso8601Timestamp | null;
}

export class ChannelPins extends Base<ChannelPinsUpdateEventFields, ChannelPinsSchema> implements ChannelPinsSchema {
    #channelId: Snowflake | null = null;
    #guildId: Snowflake | null = null;
    #lastPinTimestamp: Iso8601Timestamp | null = null;

    constructor(data: Partial<ChannelPinsUpdateEventFields>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get lastPinTimestamp(): Iso8601Timestamp | null {
        return this.#lastPinTimestamp;
    }

    static from(data: Partial<ChannelPinsUpdateEventFields>): ChannelPins {
        return new ChannelPins(data);
    }

    patch(data: Partial<ChannelPinsUpdateEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#lastPinTimestamp = data.last_pin_timestamp ?? this.#lastPinTimestamp;
    }

    toJson(): Partial<ChannelPinsUpdateEventFields> {
        return {
            channel_id: this.#channelId ?? undefined,
            guild_id: this.#guildId ?? undefined,
            last_pin_timestamp: this.#lastPinTimestamp ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ChannelPinsSchema {
        return {
            channelId: this.#channelId,
            guildId: this.#guildId,
            lastPinTimestamp: this.#lastPinTimestamp,
        };
    }

    clone(): ChannelPins {
        return new ChannelPins(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#guildId = null;
        this.#lastPinTimestamp = null;
    }

    equals(other: Partial<ChannelPins>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#guildId === other.guildId &&
                this.#lastPinTimestamp === other.lastPinTimestamp,
        );
    }
}

export interface ThreadMembersSchema {
    readonly addedMembers: ThreadMemberStructure[];
    readonly guildId: Snowflake | null;
    readonly id: Snowflake | null;
    readonly memberCount: Integer | null;
    readonly removedMemberIds: Snowflake[];
}

export class ThreadMembers
    extends Base<ThreadMembersUpdateEventFields, ThreadMembersSchema>
    implements ThreadMembersSchema
{
    #addedMembers: ThreadMemberStructure[] = [];
    #guildId: Snowflake | null = null;
    #id: Snowflake | null = null;
    #memberCount: Integer | null = null;
    #removedMemberIds: Snowflake[] = [];

    constructor(data: Partial<ThreadMembersUpdateEventFields>) {
        super();
        this.patch(data);
    }

    get addedMembers(): ThreadMemberStructure[] {
        return [...this.#addedMembers];
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get memberCount(): Integer | null {
        return this.#memberCount;
    }

    get removedMemberIds(): Snowflake[] {
        return [...this.#removedMemberIds];
    }

    static from(data: Partial<ThreadMembersUpdateEventFields>): ThreadMembers {
        return new ThreadMembers(data);
    }

    patch(data: Partial<ThreadMembersUpdateEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#addedMembers = data.added_members ? [...data.added_members] : this.#addedMembers;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#id = data.id ?? this.#id;
        this.#memberCount = data.member_count ?? this.#memberCount;
        this.#removedMemberIds = data.removed_member_ids ? [...data.removed_member_ids] : this.#removedMemberIds;
    }

    toJson(): Partial<ThreadMembersUpdateEventFields> {
        return {
            added_members: [...this.#addedMembers],
            guild_id: this.#guildId ?? undefined,
            id: this.#id ?? undefined,
            member_count: this.#memberCount ?? undefined,
            removed_member_ids: [...this.#removedMemberIds],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ThreadMembersSchema {
        return {
            addedMembers: this.#addedMembers,
            guildId: this.#guildId,
            id: this.#id,
            memberCount: this.#memberCount,
            removedMemberIds: this.#removedMemberIds,
        };
    }

    clone(): ThreadMembers {
        return new ThreadMembers(this.toJson());
    }

    reset(): void {
        this.#addedMembers = [];
        this.#guildId = null;
        this.#id = null;
        this.#memberCount = null;
        this.#removedMemberIds = [];
    }

    equals(other: Partial<ThreadMembers>): boolean {
        return Boolean(
            JSON.stringify(this.#addedMembers) === JSON.stringify(other.addedMembers) &&
                this.#guildId === other.guildId &&
                this.#id === other.id &&
                this.#memberCount === other.memberCount &&
                JSON.stringify(this.#removedMemberIds) === JSON.stringify(other.removedMemberIds),
        );
    }
}

export interface ThreadListSyncSchema {
    readonly channelIds: Snowflake[];
    readonly guildId: Snowflake | null;
    readonly members: ThreadMemberStructure[];
    readonly threads: ChannelStructure[];
}

export class ThreadListSync
    extends Base<ThreadListSyncEventFields, ThreadListSyncSchema>
    implements ThreadListSyncSchema
{
    #channelIds: Snowflake[] = [];
    #guildId: Snowflake | null = null;
    #members: ThreadMemberStructure[] = [];
    #threads: ChannelStructure[] = [];

    constructor(data: Partial<ThreadListSyncEventFields>) {
        super();
        this.patch(data);
    }

    get channelIds(): Snowflake[] {
        return [...this.#channelIds];
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get members(): ThreadMemberStructure[] {
        return [...this.#members];
    }

    get threads(): ChannelStructure[] {
        return [...this.#threads];
    }

    static from(data: Partial<ThreadListSyncEventFields>): ThreadListSync {
        return new ThreadListSync(data);
    }

    patch(data: Partial<ThreadListSyncEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelIds = data.channel_ids ? [...data.channel_ids] : this.#channelIds;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#members = data.members ? [...data.members] : this.#members;
        this.#threads = data.threads ? [...data.threads] : this.#threads;
    }

    toJson(): Partial<ThreadListSyncEventFields> {
        return {
            channel_ids: [...this.#channelIds],
            guild_id: this.#guildId ?? undefined,
            members: [...this.#members],
            threads: [...this.#threads],
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ThreadListSyncSchema {
        return {
            channelIds: this.#channelIds,
            guildId: this.#guildId,
            members: this.#members,
            threads: this.#threads,
        };
    }

    clone(): ThreadListSync {
        return new ThreadListSync(this.toJson());
    }

    reset(): void {
        this.#channelIds = [];
        this.#guildId = null;
        this.#members = [];
        this.#threads = [];
    }

    equals(other: Partial<ThreadListSync>): boolean {
        return Boolean(
            JSON.stringify(this.#channelIds) === JSON.stringify(other.channelIds) &&
                this.#guildId === other.guildId &&
                JSON.stringify(this.#members) === JSON.stringify(other.members) &&
                JSON.stringify(this.#threads) === JSON.stringify(other.threads),
        );
    }
}

export interface BaseChannelSchema {
    readonly id: Snowflake | null;
    readonly type: ChannelTypes | null;
    readonly guildId: Snowflake | null;
    readonly position: Integer | null;
    readonly permissionOverwrites: Overwrite[];
    readonly name: string | null;
    readonly flags: BitfieldResolvable<ChannelFlags>;
    readonly parentId: Snowflake | null;
}

class BaseChannel extends Base<ChannelStructure, BaseChannelSchema> implements BaseChannelSchema {
    #id: Snowflake | null = null;
    #type: ChannelTypes | null = null;
    #guildId: Snowflake | null = null;
    #position: Integer | null = null;
    #permissionOverwrites: Overwrite[] = [];
    #name: string | null = null;
    #flags: BitfieldResolvable<ChannelFlags> = 0n;
    #parentId: Snowflake | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super();
        this.patch(data);
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get type(): ChannelTypes | null {
        return this.#type;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get position(): Integer | null {
        return this.#position;
    }

    get permissionOverwrites(): Overwrite[] {
        return [...this.#permissionOverwrites];
    }

    get name(): string | null {
        return this.#name;
    }

    get flags(): BitfieldResolvable<ChannelFlags> {
        return this.#flags;
    }

    get parentId(): Snowflake | null {
        return this.#parentId;
    }

    toJson(): Partial<ChannelStructure> {
        return {
            id: this.#id ?? undefined,
            type: this.#type ?? undefined,
            guild_id: this.#guildId ?? undefined,
            position: this.#position ?? undefined,
            permission_overwrites: (this.#permissionOverwrites.length > 0
                ? this.#permissionOverwrites.map((overwrite) => overwrite.toJson())
                : undefined) as OverwriteStructure[],
            name: this.#name ?? undefined,
            flags: this.#flags ?? undefined,
            parent_id: this.#parentId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): BaseChannelSchema {
        return {
            id: this.#id,
            type: this.#type,
            guildId: this.#guildId,
            position: this.#position,
            permissionOverwrites: [...this.#permissionOverwrites],
            name: this.#name,
            flags: this.#flags,
            parentId: this.#parentId,
        };
    }

    clone(): BaseChannel {
        return new BaseChannel(this.toJson());
    }

    patch(data: Partial<ChannelStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#id = data.id ?? this.#id;
        this.#type = data.type ?? this.#type;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#position = data.position ?? this.#position;
        this.#permissionOverwrites = data.permission_overwrites
            ? data.permission_overwrites.map((overwrite) => Overwrite.from(overwrite))
            : this.#permissionOverwrites;
        this.#name = data.name ?? this.#name;
        this.#flags = data.flags ?? this.#flags;
        this.#parentId = data.parent_id ?? this.#parentId;
    }

    reset(): void {
        this.#id = null;
        this.#type = null;
        this.#guildId = null;
        this.#position = null;
        this.#permissionOverwrites = [];
        this.#name = null;
        this.#flags = 0n;
        this.#parentId = null;
    }

    equals(other: Partial<BaseChannel>): boolean {
        return Boolean(
            this.#id === other.id &&
                this.#type === other.type &&
                this.#guildId === other.guildId &&
                this.#position === other.position &&
                JSON.stringify(this.#permissionOverwrites) ===
                    JSON.stringify(other.permissionOverwrites?.map((overwrite) => overwrite.valueOf())) &&
                this.#name === other.name &&
                this.#flags === other.flags &&
                this.#parentId === other.parentId,
        );
    }
}

export interface TextChannelSchema extends BaseChannelSchema {
    readonly topic: string | null;
    readonly nsfw: boolean;
    readonly lastMessageId: Snowflake | null;
    readonly rateLimitPerUser: Integer | null;
    readonly lastPinTimestamp: Iso8601Timestamp | null;
    readonly defaultAutoArchiveDuration: Integer | null;
}

export class TextChannel extends BaseChannel implements TextChannelSchema {
    #topic: string | null = null;
    #nsfw = false;
    #lastMessageId: Snowflake | null = null;
    #rateLimitPerUser: Integer | null = null;
    #lastPinTimestamp: Iso8601Timestamp | null = null;
    #defaultAutoArchiveDuration: Integer | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get topic(): string | null {
        return this.#topic;
    }

    get nsfw(): boolean {
        return this.#nsfw;
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get rateLimitPerUser(): Integer | null {
        return this.#rateLimitPerUser;
    }

    get lastPinTimestamp(): Iso8601Timestamp | null {
        return this.#lastPinTimestamp;
    }

    get defaultAutoArchiveDuration(): Integer | null {
        return this.#defaultAutoArchiveDuration;
    }

    static from(data: Partial<ChannelStructure>): TextChannel {
        return new TextChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#topic = data.topic ?? this.#topic;
        this.#nsfw = Boolean(data.nsfw ?? this.#nsfw);
        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#rateLimitPerUser = data.rate_limit_per_user ?? this.#rateLimitPerUser;
        this.#lastPinTimestamp = data.last_pin_timestamp ?? this.#lastPinTimestamp;
        this.#defaultAutoArchiveDuration = data.default_auto_archive_duration ?? this.#defaultAutoArchiveDuration;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            topic: this.#topic ?? undefined,
            nsfw: this.#nsfw,
            last_message_id: this.#lastMessageId ?? undefined,
            rate_limit_per_user: this.#rateLimitPerUser ?? undefined,
            last_pin_timestamp: this.#lastPinTimestamp ?? undefined,
            default_auto_archive_duration: this.#defaultAutoArchiveDuration ?? undefined,
        };
    }

    override valueOf(): TextChannelSchema {
        return {
            ...super.valueOf(),
            topic: this.#topic,
            nsfw: this.#nsfw,
            lastMessageId: this.#lastMessageId,
            rateLimitPerUser: this.#rateLimitPerUser,
            lastPinTimestamp: this.#lastPinTimestamp,
            defaultAutoArchiveDuration: this.#defaultAutoArchiveDuration,
        };
    }

    override clone(): TextChannel {
        return new TextChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#topic = null;
        this.#nsfw = false;
        this.#lastMessageId = null;
        this.#rateLimitPerUser = null;
        this.#lastPinTimestamp = null;
        this.#defaultAutoArchiveDuration = null;
    }

    override equals(other: Partial<TextChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#topic === other.topic &&
                this.#nsfw === other.nsfw &&
                this.#lastMessageId === other.lastMessageId &&
                this.#rateLimitPerUser === other.rateLimitPerUser &&
                this.#lastPinTimestamp === other.lastPinTimestamp &&
                this.#defaultAutoArchiveDuration === other.defaultAutoArchiveDuration,
        );
    }
}

export interface DmChannelSchema extends BaseChannelSchema {
    readonly lastMessageId: Snowflake | null;
    readonly recipients: User[];
}

export class DmChannel extends BaseChannel implements DmChannelSchema {
    #lastMessageId: Snowflake | null = null;
    #recipients: User[] = [];

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get recipients(): User[] {
        return [...this.#recipients];
    }

    static from(data: Partial<ChannelStructure>): DmChannel {
        return new DmChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#recipients = data.recipients ? data.recipients.map((user) => User.from(user)) : this.#recipients;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            last_message_id: this.#lastMessageId ?? undefined,
            recipients: (this.#recipients.length > 0
                ? this.#recipients.map((user) => user.toJson())
                : undefined) as UserStructure[],
        };
    }

    override valueOf(): DmChannelSchema {
        return {
            ...super.valueOf(),
            lastMessageId: this.#lastMessageId,
            recipients: [...this.#recipients],
        };
    }

    override clone(): DmChannel {
        return new DmChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#lastMessageId = null;
        this.#recipients = [];
    }

    override equals(other: Partial<DmChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#lastMessageId === other.lastMessageId &&
                JSON.stringify(this.#recipients) === JSON.stringify(other.recipients?.map((user) => user.valueOf())),
        );
    }
}

export interface GuildVoiceChannelSchema extends BaseChannelSchema {
    readonly bitrate: Integer | null;
    readonly userLimit: Integer | null;
    readonly rtcRegion: string | null;
    readonly videoQualityMode: VideoQualityModes | null;
}

export class GuildVoiceChannel extends BaseChannel implements GuildVoiceChannelSchema {
    #bitrate: Integer | null = null;
    #userLimit: Integer | null = null;
    #rtcRegion: string | null = null;
    #videoQualityMode: VideoQualityModes | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get bitrate(): Integer | null {
        return this.#bitrate;
    }

    get userLimit(): Integer | null {
        return this.#userLimit;
    }

    get rtcRegion(): string | null {
        return this.#rtcRegion;
    }

    get videoQualityMode(): VideoQualityModes | null {
        return this.#videoQualityMode;
    }

    static from(data: Partial<ChannelStructure>): GuildVoiceChannel {
        return new GuildVoiceChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#bitrate = data.bitrate ?? this.#bitrate;
        this.#userLimit = data.user_limit ?? this.#userLimit;
        this.#rtcRegion = data.rtc_region ?? this.#rtcRegion;
        this.#videoQualityMode = data.video_quality_mode ?? this.#videoQualityMode;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            bitrate: this.#bitrate ?? undefined,
            user_limit: this.#userLimit ?? undefined,
            rtc_region: this.#rtcRegion ?? undefined,
            video_quality_mode: this.#videoQualityMode ?? undefined,
        };
    }

    override valueOf(): GuildVoiceChannelSchema {
        return {
            ...super.valueOf(),
            bitrate: this.#bitrate,
            userLimit: this.#userLimit,
            rtcRegion: this.#rtcRegion,
            videoQualityMode: this.#videoQualityMode,
        };
    }

    override clone(): GuildVoiceChannel {
        return new GuildVoiceChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#bitrate = null;
        this.#userLimit = null;
        this.#rtcRegion = null;
        this.#videoQualityMode = null;
    }

    override equals(other: Partial<GuildVoiceChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#bitrate === other.bitrate &&
                this.#userLimit === other.userLimit &&
                this.#rtcRegion === other.rtcRegion &&
                this.#videoQualityMode === other.videoQualityMode,
        );
    }
}

export interface GroupDmChannelSchema extends BaseChannelSchema {
    readonly icon: string | null;
    readonly ownerId: Snowflake | null;
    readonly applicationId: Snowflake | null;
    readonly managed: boolean;
    readonly lastMessageId: Snowflake | null;
    readonly recipients: User[];
}

export class GroupDmChannel extends BaseChannel implements GroupDmChannelSchema {
    #icon: string | null = null;
    #ownerId: Snowflake | null = null;
    #applicationId: Snowflake | null = null;
    #managed = false;
    #lastMessageId: Snowflake | null = null;
    #recipients: User[] = [];

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get icon(): string | null {
        return this.#icon;
    }

    get ownerId(): Snowflake | null {
        return this.#ownerId;
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get managed(): boolean {
        return this.#managed;
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get recipients(): User[] {
        return [...this.#recipients];
    }

    static from(data: Partial<ChannelStructure>): GroupDmChannel {
        return new GroupDmChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#icon = data.icon ?? this.#icon;
        this.#ownerId = data.owner_id ?? this.#ownerId;
        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#managed = Boolean(data.managed ?? this.#managed);
        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#recipients = data.recipients ? data.recipients.map((user) => User.from(user)) : this.#recipients;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            icon: this.#icon ?? undefined,
            owner_id: this.#ownerId ?? undefined,
            application_id: this.#applicationId ?? undefined,
            managed: this.#managed,
            last_message_id: this.#lastMessageId ?? undefined,
            recipients: (this.#recipients.length > 0
                ? this.#recipients.map((user) => user.toJson())
                : undefined) as UserStructure[],
        };
    }

    override valueOf(): GroupDmChannelSchema {
        return {
            ...super.valueOf(),
            icon: this.#icon,
            ownerId: this.#ownerId,
            applicationId: this.#applicationId,
            managed: this.#managed,
            lastMessageId: this.#lastMessageId,
            recipients: [...this.#recipients],
        };
    }

    override clone(): GroupDmChannel {
        return new GroupDmChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#icon = null;
        this.#ownerId = null;
        this.#applicationId = null;
        this.#managed = false;
        this.#lastMessageId = null;
        this.#recipients = [];
    }

    override equals(other: Partial<GroupDmChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#icon === other.icon &&
                this.#ownerId === other.ownerId &&
                this.#applicationId === other.applicationId &&
                this.#managed === other.managed &&
                this.#lastMessageId === other.lastMessageId &&
                JSON.stringify(this.#recipients) === JSON.stringify(other.recipients?.map((user) => user.valueOf())),
        );
    }
}

export interface GuildAnnouncementChannelSchema extends BaseChannelSchema {
    readonly topic: string | null;
    readonly nsfw: boolean;
    readonly lastMessageId: Snowflake | null;
    readonly lastPinTimestamp: Iso8601Timestamp | null;
    readonly defaultAutoArchiveDuration: Integer | null;
}

export class GuildAnnouncementChannel extends BaseChannel implements GuildAnnouncementChannelSchema {
    #topic: string | null = null;
    #nsfw = false;
    #lastMessageId: Snowflake | null = null;
    #lastPinTimestamp: Iso8601Timestamp | null = null;
    #defaultAutoArchiveDuration: Integer | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get topic(): string | null {
        return this.#topic;
    }

    get nsfw(): boolean {
        return this.#nsfw;
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get lastPinTimestamp(): Iso8601Timestamp | null {
        return this.#lastPinTimestamp;
    }

    get defaultAutoArchiveDuration(): Integer | null {
        return this.#defaultAutoArchiveDuration;
    }

    static from(data: Partial<ChannelStructure>): GuildAnnouncementChannel {
        return new GuildAnnouncementChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#topic = data.topic ?? this.#topic;
        this.#nsfw = Boolean(data.nsfw ?? this.#nsfw);
        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#lastPinTimestamp = data.last_pin_timestamp ?? this.#lastPinTimestamp;
        this.#defaultAutoArchiveDuration = data.default_auto_archive_duration ?? this.#defaultAutoArchiveDuration;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            topic: this.#topic ?? undefined,
            nsfw: this.#nsfw,
            last_message_id: this.#lastMessageId ?? undefined,
            last_pin_timestamp: this.#lastPinTimestamp ?? undefined,
            default_auto_archive_duration: this.#defaultAutoArchiveDuration ?? undefined,
        };
    }

    override valueOf(): GuildAnnouncementChannelSchema {
        return {
            ...super.valueOf(),
            topic: this.#topic,
            nsfw: this.#nsfw,
            lastMessageId: this.#lastMessageId,
            lastPinTimestamp: this.#lastPinTimestamp,
            defaultAutoArchiveDuration: this.#defaultAutoArchiveDuration,
        };
    }

    override clone(): GuildAnnouncementChannel {
        return new GuildAnnouncementChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#topic = null;
        this.#nsfw = false;
        this.#lastMessageId = null;
        this.#lastPinTimestamp = null;
        this.#defaultAutoArchiveDuration = null;
    }

    override equals(other: Partial<GuildAnnouncementChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#topic === other.topic &&
                this.#nsfw === other.nsfw &&
                this.#lastMessageId === other.lastMessageId &&
                this.#lastPinTimestamp === other.lastPinTimestamp &&
                this.#defaultAutoArchiveDuration === other.defaultAutoArchiveDuration,
        );
    }
}

export interface ThreadChannelSchema extends BaseChannelSchema {
    readonly lastMessageId: Snowflake | null;
    readonly messageCount: Integer | null;
    readonly memberCount: Integer | null;
    readonly rateLimitPerUser: Integer | null;
    readonly ownerId: Snowflake | null;
    readonly threadMetadata: ThreadMetadata | null;
    readonly member: ThreadMember | null;
    readonly totalMessageSent: Integer | null;
    readonly appliedTags: Snowflake[];
}

export class ThreadChannel extends BaseChannel implements ThreadChannelSchema {
    #lastMessageId: Snowflake | null = null;
    #messageCount: Integer | null = null;
    #memberCount: Integer | null = null;
    #rateLimitPerUser: Integer | null = null;
    #ownerId: Snowflake | null = null;
    #threadMetadata: ThreadMetadata | null = null;
    #member: ThreadMember | null = null;
    #totalMessageSent: Integer | null = null;
    #appliedTags: Snowflake[] = [];

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get messageCount(): Integer | null {
        return this.#messageCount;
    }

    get memberCount(): Integer | null {
        return this.#memberCount;
    }

    get rateLimitPerUser(): Integer | null {
        return this.#rateLimitPerUser;
    }

    get ownerId(): Snowflake | null {
        return this.#ownerId;
    }

    get threadMetadata(): ThreadMetadata | null {
        return this.#threadMetadata;
    }

    get member(): ThreadMember | null {
        return this.#member;
    }

    get totalMessageSent(): Integer | null {
        return this.#totalMessageSent;
    }

    get appliedTags(): Snowflake[] {
        return [...this.#appliedTags];
    }

    static from(data: Partial<ChannelStructure>): ThreadChannel {
        return new ThreadChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#messageCount = data.message_count ?? this.#messageCount;
        this.#memberCount = data.member_count ?? this.#memberCount;
        this.#rateLimitPerUser = data.rate_limit_per_user ?? this.#rateLimitPerUser;
        this.#ownerId = data.owner_id ?? this.#ownerId;
        this.#threadMetadata = data.thread_metadata ? ThreadMetadata.from(data.thread_metadata) : this.#threadMetadata;
        this.#member = data.member ? ThreadMember.from(data.member) : this.#member;
        this.#totalMessageSent = data.total_message_sent ?? this.#totalMessageSent;
        this.#appliedTags = data.applied_tags ? [...data.applied_tags] : this.#appliedTags;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            last_message_id: this.#lastMessageId ?? undefined,
            message_count: this.#messageCount ?? undefined,
            member_count: this.#memberCount ?? undefined,
            rate_limit_per_user: this.#rateLimitPerUser ?? undefined,
            owner_id: this.#ownerId ?? undefined,
            thread_metadata: this.#threadMetadata?.toJson() as ThreadMetadataStructure,
            member: this.#member?.toJson() as ThreadMemberStructure,
            total_message_sent: this.#totalMessageSent ?? undefined,
            applied_tags: this.#appliedTags.length > 0 ? [...this.#appliedTags] : undefined,
        };
    }

    override valueOf(): ThreadChannelSchema {
        return {
            ...super.valueOf(),
            lastMessageId: this.#lastMessageId,
            messageCount: this.#messageCount,
            memberCount: this.#memberCount,
            rateLimitPerUser: this.#rateLimitPerUser,
            ownerId: this.#ownerId,
            threadMetadata: this.#threadMetadata,
            member: this.#member,
            totalMessageSent: this.#totalMessageSent,
            appliedTags: [...this.#appliedTags],
        };
    }

    override clone(): ThreadChannel {
        return new ThreadChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#lastMessageId = null;
        this.#messageCount = null;
        this.#memberCount = null;
        this.#rateLimitPerUser = null;
        this.#ownerId = null;
        this.#threadMetadata = null;
        this.#member = null;
        this.#totalMessageSent = null;
        this.#appliedTags = [];
    }

    override equals(other: Partial<ThreadChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#lastMessageId === other.lastMessageId &&
                this.#messageCount === other.messageCount &&
                this.#memberCount === other.memberCount &&
                this.#rateLimitPerUser === other.rateLimitPerUser &&
                this.#ownerId === other.ownerId &&
                this.#threadMetadata?.equals(other.threadMetadata ?? {}) &&
                this.#member?.equals(other.member ?? {}) &&
                this.#totalMessageSent === other.totalMessageSent &&
                JSON.stringify(this.#appliedTags) === JSON.stringify(other.appliedTags),
        );
    }
}

export interface StageVoiceChannelSchema extends BaseChannelSchema {
    readonly topic: string | null;
    readonly bitrate: Integer | null;
    readonly userLimit: Integer | null;
    readonly rtcRegion: string | null;
    readonly videoQualityMode: VideoQualityModes | null;
}

export class StageVoiceChannel extends BaseChannel implements StageVoiceChannelSchema {
    #topic: string | null = null;
    #bitrate: Integer | null = null;
    #userLimit: Integer | null = null;
    #rtcRegion: string | null = null;
    #videoQualityMode: VideoQualityModes | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get topic(): string | null {
        return this.#topic;
    }

    get bitrate(): Integer | null {
        return this.#bitrate;
    }

    get userLimit(): Integer | null {
        return this.#userLimit;
    }

    get rtcRegion(): string | null {
        return this.#rtcRegion;
    }

    get videoQualityMode(): VideoQualityModes | null {
        return this.#videoQualityMode;
    }

    static from(data: Partial<ChannelStructure>): StageVoiceChannel {
        return new StageVoiceChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#topic = data.topic ?? this.#topic;
        this.#bitrate = data.bitrate ?? this.#bitrate;
        this.#userLimit = data.user_limit ?? this.#userLimit;
        this.#rtcRegion = data.rtc_region ?? this.#rtcRegion;
        this.#videoQualityMode = data.video_quality_mode ?? this.#videoQualityMode;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            topic: this.#topic ?? undefined,
            bitrate: this.#bitrate ?? undefined,
            user_limit: this.#userLimit ?? undefined,
            rtc_region: this.#rtcRegion ?? undefined,
            video_quality_mode: this.#videoQualityMode ?? undefined,
        };
    }

    override valueOf(): StageVoiceChannelSchema {
        return {
            ...super.valueOf(),
            topic: this.#topic,
            bitrate: this.#bitrate,
            userLimit: this.#userLimit,
            rtcRegion: this.#rtcRegion,
            videoQualityMode: this.#videoQualityMode,
        };
    }

    override clone(): StageVoiceChannel {
        return new StageVoiceChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#topic = null;
        this.#bitrate = null;
        this.#userLimit = null;
        this.#rtcRegion = null;
        this.#videoQualityMode = null;
    }

    override equals(other: Partial<StageVoiceChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#topic === other.topic &&
                this.#bitrate === other.bitrate &&
                this.#userLimit === other.userLimit &&
                this.#rtcRegion === other.rtcRegion &&
                this.#videoQualityMode === other.videoQualityMode,
        );
    }
}

export interface DirectoryChannelSchema extends BaseChannelSchema {}

export class DirectoryChannel extends BaseChannel implements DirectoryChannelSchema {
    static from(data: Partial<ChannelStructure>): DirectoryChannel {
        return new DirectoryChannel(data);
    }

    override clone(): DirectoryChannel {
        return new DirectoryChannel(this.toJson());
    }
}

export interface ForumChannelSchema extends BaseChannelSchema {
    readonly topic: string | null;
    readonly nsfw: boolean;
    readonly rateLimitPerUser: Integer | null;
    readonly availableTags: ForumTag[];
    readonly defaultReactionEmoji: DefaultReaction | null;
    readonly defaultThreadRateLimitPerUser: Integer | null;
    readonly defaultSortOrder: SortOrderTypes | null;
    readonly defaultForumLayout: ForumLayoutTypes | null;
    readonly defaultAutoArchiveDuration: Integer | null;
}

export class ForumChannel extends BaseChannel implements ForumChannelSchema {
    #topic: string | null = null;
    #nsfw = false;
    #rateLimitPerUser: Integer | null = null;
    #availableTags: ForumTag[] = [];
    #defaultReactionEmoji: DefaultReaction | null = null;
    #defaultThreadRateLimitPerUser: Integer | null = null;
    #defaultSortOrder: SortOrderTypes | null = null;
    #defaultForumLayout: ForumLayoutTypes | null = null;
    #defaultAutoArchiveDuration: Integer | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super(data);
        this.patch(data);
    }

    get topic(): string | null {
        return this.#topic;
    }

    get nsfw(): boolean {
        return this.#nsfw;
    }

    get rateLimitPerUser(): Integer | null {
        return this.#rateLimitPerUser;
    }

    get availableTags(): ForumTag[] {
        return [...this.#availableTags];
    }

    get defaultReactionEmoji(): DefaultReaction | null {
        return this.#defaultReactionEmoji;
    }

    get defaultThreadRateLimitPerUser(): Integer | null {
        return this.#defaultThreadRateLimitPerUser;
    }

    get defaultSortOrder(): SortOrderTypes | null {
        return this.#defaultSortOrder;
    }

    get defaultForumLayout(): ForumLayoutTypes | null {
        return this.#defaultForumLayout;
    }

    get defaultAutoArchiveDuration(): Integer | null {
        return this.#defaultAutoArchiveDuration;
    }

    static from(data: Partial<ChannelStructure>): ForumChannel {
        return new ForumChannel(data);
    }

    override patch(data: Partial<ChannelStructure>): void {
        super.patch(data);

        this.#topic = data.topic ?? this.#topic;
        this.#nsfw = Boolean(data.nsfw ?? this.#nsfw);
        this.#rateLimitPerUser = data.rate_limit_per_user ?? this.#rateLimitPerUser;
        this.#availableTags = data.available_tags
            ? data.available_tags.map((tag) => ForumTag.from(tag))
            : this.#availableTags;
        this.#defaultReactionEmoji = data.default_reaction_emoji
            ? DefaultReaction.from(data.default_reaction_emoji)
            : this.#defaultReactionEmoji;
        this.#defaultThreadRateLimitPerUser =
            data.default_thread_rate_limit_per_user ?? this.#defaultThreadRateLimitPerUser;
        this.#defaultSortOrder = data.default_sort_order ?? this.#defaultSortOrder;
        this.#defaultForumLayout = data.default_forum_layout ?? this.#defaultForumLayout;
        this.#defaultAutoArchiveDuration = data.default_auto_archive_duration ?? this.#defaultAutoArchiveDuration;
    }

    override toJson(): Partial<ChannelStructure> {
        return {
            ...super.toJson(),
            topic: this.#topic ?? undefined,
            nsfw: this.#nsfw,
            rate_limit_per_user: this.#rateLimitPerUser ?? undefined,
            available_tags: (this.#availableTags.length > 0
                ? this.#availableTags.map((tag) => tag.toJson())
                : undefined) as ForumTagStructure[],
            default_reaction_emoji: this.#defaultReactionEmoji?.toJson() as DefaultReactionStructure,
            default_thread_rate_limit_per_user: this.#defaultThreadRateLimitPerUser ?? undefined,
            default_sort_order: this.#defaultSortOrder ?? undefined,
            default_forum_layout: this.#defaultForumLayout ?? undefined,
            default_auto_archive_duration: this.#defaultAutoArchiveDuration ?? undefined,
        };
    }

    override valueOf(): ForumChannelSchema {
        return {
            ...super.valueOf(),
            topic: this.#topic,
            nsfw: this.#nsfw,
            rateLimitPerUser: this.#rateLimitPerUser,
            availableTags: [...this.#availableTags],
            defaultReactionEmoji: this.#defaultReactionEmoji,
            defaultThreadRateLimitPerUser: this.#defaultThreadRateLimitPerUser,
            defaultSortOrder: this.#defaultSortOrder,
            defaultForumLayout: this.#defaultForumLayout,
            defaultAutoArchiveDuration: this.#defaultAutoArchiveDuration,
        };
    }

    override clone(): ForumChannel {
        return new ForumChannel(this.toJson());
    }

    override reset(): void {
        super.reset();
        this.#topic = null;
        this.#nsfw = false;
        this.#rateLimitPerUser = null;
        this.#availableTags = [];
        this.#defaultReactionEmoji = null;
        this.#defaultThreadRateLimitPerUser = null;
        this.#defaultSortOrder = null;
        this.#defaultForumLayout = null;
        this.#defaultAutoArchiveDuration = null;
    }

    override equals(other: Partial<ForumChannel>): boolean {
        return Boolean(
            super.equals(other) &&
                this.#topic === other.topic &&
                this.#nsfw === other.nsfw &&
                this.#rateLimitPerUser === other.rateLimitPerUser &&
                JSON.stringify(this.#availableTags) ===
                    JSON.stringify(other.availableTags?.map((tag) => tag.valueOf())) &&
                this.#defaultReactionEmoji?.equals(other.defaultReactionEmoji ?? {}) &&
                this.#defaultThreadRateLimitPerUser === other.defaultThreadRateLimitPerUser &&
                this.#defaultSortOrder === other.defaultSortOrder &&
                this.#defaultForumLayout === other.defaultForumLayout &&
                this.#defaultAutoArchiveDuration === other.defaultAutoArchiveDuration,
        );
    }
}

export interface MediaChannelSchema extends ForumChannelSchema {}

export class MediaChannel extends ForumChannel implements MediaChannelSchema {
    static override from(data: Partial<ChannelStructure>): MediaChannel {
        return new MediaChannel(data);
    }

    override clone(): MediaChannel {
        return new MediaChannel(this.toJson());
    }
}

export type ChannelResolvable =
    | TextChannel
    | DmChannel
    | GuildVoiceChannel
    | GroupDmChannel
    | GuildAnnouncementChannel
    | ThreadChannel
    | StageVoiceChannel
    | DirectoryChannel
    | ForumChannel
    | MediaChannel;

export type ChannelSchemaResolvable =
    | TextChannelSchema
    | DmChannelSchema
    | GuildVoiceChannelSchema
    | GroupDmChannelSchema
    | GuildAnnouncementChannelSchema
    | ThreadChannelSchema
    | StageVoiceChannelSchema
    | DirectoryChannelSchema
    | ForumChannelSchema
    | MediaChannelSchema;

export interface ChannelSchema {
    readonly applicationId: Snowflake | null;
    readonly appliedTags: Snowflake[];
    readonly availableTags: ForumTag[];
    readonly bitrate: Integer | null;
    readonly defaultAutoArchiveDuration: Integer | null;
    readonly defaultForumLayout: ForumLayoutTypes | null;
    readonly defaultReactionEmoji: DefaultReaction | null;
    readonly defaultSortOrder: SortOrderTypes | null;
    readonly defaultThreadRateLimitPerUser: Integer | null;
    readonly flags: BitfieldResolvable<ChannelFlags>;
    readonly guildId: Snowflake | null;
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly lastMessageId: Snowflake | null;
    readonly lastPinTimestamp: Iso8601Timestamp | null;
    readonly managed: boolean;
    readonly member: ThreadMember | null;
    readonly memberCount: Integer | null;
    readonly messageCount: Integer | null;
    readonly name: string | null;
    readonly nsfw: boolean;
    readonly ownerId: Snowflake | null;
    readonly parentId: Snowflake | null;
    readonly permissionOverwrites: Overwrite[];
    readonly permissions: string | null;
    readonly position: Integer | null;
    readonly rateLimitPerUser: Integer | null;
    readonly recipients: User[];
    readonly rtcRegion: string | null;
    readonly threadMetadata: ThreadMetadata | null;
    readonly topic: string | null;
    readonly totalMessageSent: Integer | null;
    readonly type: ChannelTypes | null;
    readonly userLimit: Integer | null;
    readonly videoQualityMode: VideoQualityModes | null;
}

export class Channel extends Base<ChannelStructure, ChannelSchema> implements ChannelSchema {
    #applicationId: Snowflake | null = null;
    #appliedTags: Snowflake[] = [];
    #availableTags: ForumTag[] = [];
    #bitrate: Integer | null = null;
    #defaultAutoArchiveDuration: Integer | null = null;
    #defaultForumLayout: ForumLayoutTypes | null = null;
    #defaultReactionEmoji: DefaultReaction | null = null;
    #defaultSortOrder: SortOrderTypes | null = null;
    #defaultThreadRateLimitPerUser: Integer | null = null;
    #flags: BitfieldResolvable<ChannelFlags> = 0n;
    #guildId: Snowflake | null = null;
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #lastMessageId: Snowflake | null = null;
    #lastPinTimestamp: Iso8601Timestamp | null = null;
    #managed = false;
    #member: ThreadMember | null = null;
    #memberCount: Integer | null = null;
    #messageCount: Integer | null = null;
    #name: string | null = null;
    #nsfw = false;
    #ownerId: Snowflake | null = null;
    #parentId: Snowflake | null = null;
    #permissionOverwrites: Overwrite[] = [];
    #permissions: string | null = null;
    #position: Integer | null = null;
    #rateLimitPerUser: Integer | null = null;
    #recipients: User[] = [];
    #rtcRegion: string | null = null;
    #threadMetadata: ThreadMetadata | null = null;
    #topic: string | null = null;
    #totalMessageSent: Integer | null = null;
    #type: ChannelTypes | null = null;
    #userLimit: Integer | null = null;
    #videoQualityMode: VideoQualityModes | null = null;

    constructor(data: Partial<ChannelStructure>) {
        super();
        this.patch(data);
    }

    get applicationId(): Snowflake | null {
        return this.#applicationId;
    }

    get appliedTags(): Snowflake[] {
        return [...this.#appliedTags];
    }

    get availableTags(): ForumTag[] {
        return [...this.#availableTags];
    }

    get bitrate(): Integer | null {
        return this.#bitrate;
    }

    get defaultAutoArchiveDuration(): Integer | null {
        return this.#defaultAutoArchiveDuration;
    }

    get defaultForumLayout(): ForumLayoutTypes | null {
        return this.#defaultForumLayout;
    }

    get defaultReactionEmoji(): DefaultReaction | null {
        return this.#defaultReactionEmoji;
    }

    get defaultSortOrder(): SortOrderTypes | null {
        return this.#defaultSortOrder;
    }

    get defaultThreadRateLimitPerUser(): Integer | null {
        return this.#defaultThreadRateLimitPerUser;
    }

    get flags(): BitfieldResolvable<ChannelFlags> {
        return this.#flags;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get lastMessageId(): Snowflake | null {
        return this.#lastMessageId;
    }

    get lastPinTimestamp(): Iso8601Timestamp | null {
        return this.#lastPinTimestamp;
    }

    get managed(): boolean {
        return this.#managed;
    }

    get member(): ThreadMember | null {
        return this.#member;
    }

    get memberCount(): Integer | null {
        return this.#memberCount;
    }

    get messageCount(): Integer | null {
        return this.#messageCount;
    }

    get name(): string | null {
        return this.#name;
    }

    get nsfw(): boolean {
        return this.#nsfw;
    }

    get ownerId(): Snowflake | null {
        return this.#ownerId;
    }

    get parentId(): Snowflake | null {
        return this.#parentId;
    }

    get permissionOverwrites(): Overwrite[] {
        return [...this.#permissionOverwrites];
    }

    get permissions(): string | null {
        return this.#permissions;
    }

    get position(): Integer | null {
        return this.#position;
    }

    get rateLimitPerUser(): Integer | null {
        return this.#rateLimitPerUser;
    }

    get recipients(): User[] {
        return [...this.#recipients];
    }

    get rtcRegion(): string | null {
        return this.#rtcRegion;
    }

    get threadMetadata(): ThreadMetadata | null {
        return this.#threadMetadata;
    }

    get topic(): string | null {
        return this.#topic;
    }

    get totalMessageSent(): Integer | null {
        return this.#totalMessageSent;
    }

    get type(): ChannelTypes | null {
        return this.#type;
    }

    get userLimit(): Integer | null {
        return this.#userLimit;
    }

    get videoQualityMode(): VideoQualityModes | null {
        return this.#videoQualityMode;
    }

    static from(data: Partial<ChannelStructure>): Channel {
        return new Channel(data);
    }

    /**
     * Checks if the channel is a text channel
     */
    isText(): this is TextChannel {
        return this.type === ChannelTypes.GuildText;
    }

    /**
     * Converts the channel to a TextChannel instance
     */
    toTextChannel(): TextChannel | null {
        return this.isText() ? TextChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a DM channel
     */
    isDm(): this is DmChannel {
        return this.type === ChannelTypes.DM;
    }

    /**
     * Converts the channel to a DmChannel instance
     */
    toDmChannel(): DmChannel | null {
        return this.isDm() ? DmChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a voice channel
     */
    isVoice(): this is GuildVoiceChannel {
        return this.type === ChannelTypes.GuildVoice;
    }

    /**
     * Converts the channel to a GuildVoiceChannel instance
     */
    toVoiceChannel(): GuildVoiceChannel | null {
        return this.isVoice() ? GuildVoiceChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a group DM channel
     */
    isGroupDm(): this is GroupDmChannel {
        return this.type === ChannelTypes.GroupDM;
    }

    /**
     * Converts the channel to a GroupDmChannel instance
     */
    toGroupDmChannel(): GroupDmChannel | null {
        return this.isGroupDm() ? GroupDmChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is an announcement channel
     */
    isAnnouncement(): this is GuildAnnouncementChannel {
        return this.type === ChannelTypes.GuildAnnouncement;
    }

    /**
     * Converts the channel to a GuildAnnouncementChannel instance
     */
    toAnnouncementChannel(): GuildAnnouncementChannel | null {
        return this.isAnnouncement() ? GuildAnnouncementChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a thread
     */
    isThread(): this is ThreadChannel {
        return [ChannelTypes.AnnouncementThread, ChannelTypes.PrivateThread, ChannelTypes.PublicThread].includes(
            this.type as ChannelTypes,
        );
    }

    /**
     * Converts the channel to a ThreadChannel instance
     */
    toThreadChannel(): ThreadChannel | null {
        return this.isThread() ? ThreadChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a stage channel
     */
    isStage(): this is StageVoiceChannel {
        return this.type === ChannelTypes.GuildStageVoice;
    }

    /**
     * Converts the channel to a StageVoiceChannel instance
     */
    toStageChannel(): StageVoiceChannel | null {
        return this.isStage() ? StageVoiceChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a directory channel
     */
    isDirectory(): this is DirectoryChannel {
        return this.type === ChannelTypes.GuildDirectory;
    }

    /**
     * Converts the channel to a DirectoryChannel instance
     */
    toDirectoryChannel(): DirectoryChannel | null {
        return this.isDirectory() ? DirectoryChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a forum channel
     */
    isForum(): this is ForumChannel {
        return this.type === ChannelTypes.GuildForum;
    }

    /**
     * Converts the channel to a ForumChannel instance
     */
    toForumChannel(): ForumChannel | null {
        return this.isForum() ? ForumChannel.from(this.toJson()) : null;
    }

    /**
     * Checks if the channel is a media channel
     */
    isMedia(): this is MediaChannel {
        return this.type === ChannelTypes.GuildMedia;
    }

    /**
     * Converts the channel to a MediaChannel instance
     */
    toMediaChannel(): MediaChannel | null {
        return this.isMedia() ? MediaChannel.from(this.toJson()) : null;
    }

    /**
     * Converts the channel to its specific type instance
     */
    toSpecificChannel(): ChannelResolvable | null {
        if (this.isText()) {
            return this.toTextChannel();
        }
        if (this.isDm()) {
            return this.toDmChannel();
        }
        if (this.isVoice()) {
            return this.toVoiceChannel();
        }
        if (this.isGroupDm()) {
            return this.toGroupDmChannel();
        }
        if (this.isAnnouncement()) {
            return this.toAnnouncementChannel();
        }
        if (this.isThread()) {
            return this.toThreadChannel();
        }
        if (this.isStage()) {
            return this.toStageChannel();
        }
        if (this.isDirectory()) {
            return this.toDirectoryChannel();
        }
        if (this.isForum()) {
            return this.toForumChannel();
        }
        if (this.isMedia()) {
            return this.toMediaChannel();
        }
        return null;
    }

    /**
     * Checks if the channel is a guild channel
     */
    isGuildBased(): boolean {
        return Boolean(this.guildId);
    }

    /**
     * Checks if the channel can have threads
     */
    canHaveThreads(): boolean {
        return this.isText() || this.isAnnouncement() || this.isForum() || this.isMedia();
    }

    /**
     * Checks if the channel supports voice features
     */
    isVoiceBased(): boolean {
        return this.isVoice() || this.isStage();
    }

    patch(data: Partial<ChannelStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#applicationId = data.application_id ?? this.#applicationId;
        this.#appliedTags = data.applied_tags ? [...data.applied_tags] : this.#appliedTags;
        this.#availableTags = data.available_tags
            ? data.available_tags.map((tag) => ForumTag.from(tag))
            : this.#availableTags;
        this.#bitrate = data.bitrate ?? this.#bitrate;
        this.#defaultAutoArchiveDuration = data.default_auto_archive_duration ?? this.#defaultAutoArchiveDuration;
        this.#defaultForumLayout = data.default_forum_layout ?? this.#defaultForumLayout;
        this.#defaultReactionEmoji = data.default_reaction_emoji
            ? DefaultReaction.from(data.default_reaction_emoji)
            : this.#defaultReactionEmoji;
        this.#defaultSortOrder = data.default_sort_order ?? this.#defaultSortOrder;
        this.#defaultThreadRateLimitPerUser =
            data.default_thread_rate_limit_per_user ?? this.#defaultThreadRateLimitPerUser;
        this.#flags = data.flags ?? this.#flags;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#lastMessageId = data.last_message_id ?? this.#lastMessageId;
        this.#lastPinTimestamp = data.last_pin_timestamp ?? this.#lastPinTimestamp;
        this.#managed = Boolean(data.managed ?? this.#managed);
        this.#member = data.member ? ThreadMember.from(data.member) : this.#member;
        this.#memberCount = data.member_count ?? this.#memberCount;
        this.#messageCount = data.message_count ?? this.#messageCount;
        this.#name = data.name ?? this.#name;
        this.#nsfw = Boolean(data.nsfw ?? this.#nsfw);
        this.#ownerId = data.owner_id ?? this.#ownerId;
        this.#parentId = data.parent_id ?? this.#parentId;
        this.#permissionOverwrites = data.permission_overwrites
            ? data.permission_overwrites.map((overwrite) => Overwrite.from(overwrite))
            : this.#permissionOverwrites;
        this.#permissions = data.permissions ?? this.#permissions;
        this.#position = data.position ?? this.#position;
        this.#rateLimitPerUser = data.rate_limit_per_user ?? this.#rateLimitPerUser;
        this.#recipients = data.recipients ? data.recipients.map((user) => User.from(user)) : this.#recipients;
        this.#rtcRegion = data.rtc_region ?? this.#rtcRegion;
        this.#threadMetadata = data.thread_metadata ? ThreadMetadata.from(data.thread_metadata) : this.#threadMetadata;
        this.#topic = data.topic ?? this.#topic;
        this.#totalMessageSent = data.total_message_sent ?? this.#totalMessageSent;
        this.#type = data.type ?? this.#type;
        this.#userLimit = data.user_limit ?? this.#userLimit;
        this.#videoQualityMode = data.video_quality_mode ?? this.#videoQualityMode;
    }

    toJson(): Partial<ChannelStructure> {
        return {
            application_id: this.#applicationId ?? undefined,
            applied_tags: this.#appliedTags.length > 0 ? [...this.#appliedTags] : undefined,
            available_tags: (this.#availableTags.length > 0
                ? this.#availableTags.map((tag) => tag.toJson())
                : undefined) as ForumTagStructure[],
            bitrate: this.#bitrate ?? undefined,
            default_auto_archive_duration: this.#defaultAutoArchiveDuration ?? undefined,
            default_forum_layout: this.#defaultForumLayout ?? undefined,
            default_reaction_emoji: this.#defaultReactionEmoji?.toJson() as DefaultReactionStructure,
            default_sort_order: this.#defaultSortOrder ?? undefined,
            default_thread_rate_limit_per_user: this.#defaultThreadRateLimitPerUser ?? undefined,
            flags: this.#flags ?? undefined,
            guild_id: this.#guildId ?? undefined,
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            last_message_id: this.#lastMessageId ?? undefined,
            last_pin_timestamp: this.#lastPinTimestamp ?? undefined,
            managed: this.#managed,
            member: (this.#member?.toJson() ?? undefined) as ThreadMemberStructure,
            member_count: this.#memberCount ?? undefined,
            message_count: this.#messageCount ?? undefined,
            name: this.#name ?? undefined,
            nsfw: this.#nsfw,
            owner_id: this.#ownerId ?? undefined,
            parent_id: this.#parentId ?? undefined,
            permission_overwrites: (this.#permissionOverwrites.length > 0
                ? this.#permissionOverwrites.map((overwrite) => overwrite.toJson())
                : undefined) as OverwriteStructure[],
            permissions: this.#permissions ?? undefined,
            position: this.#position ?? undefined,
            rate_limit_per_user: this.#rateLimitPerUser ?? undefined,
            recipients: (this.#recipients.length > 0
                ? this.#recipients.map((user) => user.toJson())
                : undefined) as UserStructure[],
            rtc_region: this.#rtcRegion ?? undefined,
            thread_metadata: (this.#threadMetadata?.toJson() ?? undefined) as ThreadMetadataStructure,
            topic: this.#topic ?? undefined,
            total_message_sent: this.#totalMessageSent ?? undefined,
            type: this.#type ?? undefined,
            user_limit: this.#userLimit ?? undefined,
            video_quality_mode: this.#videoQualityMode ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ChannelSchema {
        return {
            applicationId: this.#applicationId,
            appliedTags: [...this.#appliedTags],
            availableTags: [...this.#availableTags],
            bitrate: this.#bitrate,
            defaultAutoArchiveDuration: this.#defaultAutoArchiveDuration,
            defaultForumLayout: this.#defaultForumLayout,
            defaultReactionEmoji: this.#defaultReactionEmoji,
            defaultSortOrder: this.#defaultSortOrder,
            defaultThreadRateLimitPerUser: this.#defaultThreadRateLimitPerUser,
            flags: this.#flags,
            guildId: this.#guildId,
            icon: this.#icon,
            id: this.#id,
            lastMessageId: this.#lastMessageId,
            lastPinTimestamp: this.#lastPinTimestamp,
            managed: this.#managed,
            member: this.#member,
            memberCount: this.#memberCount,
            messageCount: this.#messageCount,
            name: this.#name,
            nsfw: this.#nsfw,
            ownerId: this.#ownerId,
            parentId: this.#parentId,
            permissionOverwrites: [...this.#permissionOverwrites],
            permissions: this.#permissions,
            position: this.#position,
            rateLimitPerUser: this.#rateLimitPerUser,
            recipients: [...this.#recipients],
            rtcRegion: this.#rtcRegion,
            threadMetadata: this.#threadMetadata,
            topic: this.#topic,
            totalMessageSent: this.#totalMessageSent,
            type: this.#type,
            userLimit: this.#userLimit,
            videoQualityMode: this.#videoQualityMode,
        };
    }

    clone(): Channel {
        return new Channel(this.toJson());
    }

    reset(): void {
        this.#applicationId = null;
        this.#appliedTags = [];
        this.#availableTags = [];
        this.#bitrate = null;
        this.#defaultAutoArchiveDuration = null;
        this.#defaultForumLayout = null;
        this.#defaultReactionEmoji = null;
        this.#defaultSortOrder = null;
        this.#defaultThreadRateLimitPerUser = null;
        this.#flags = 0n;
        this.#guildId = null;
        this.#icon = null;
        this.#id = null;
        this.#lastMessageId = null;
        this.#lastPinTimestamp = null;
        this.#managed = false;
        this.#member = null;
        this.#memberCount = null;
        this.#messageCount = null;
        this.#name = null;
        this.#nsfw = false;
        this.#ownerId = null;
        this.#parentId = null;
        this.#permissionOverwrites = [];
        this.#permissions = null;
        this.#position = null;
        this.#rateLimitPerUser = null;
        this.#recipients = [];
        this.#rtcRegion = null;
        this.#threadMetadata = null;
        this.#topic = null;
        this.#totalMessageSent = null;
        this.#type = null;
        this.#userLimit = null;
        this.#videoQualityMode = null;
    }

    equals(other: Partial<Channel>): boolean {
        return Boolean(
            this.#applicationId === other.applicationId &&
                JSON.stringify(this.#appliedTags) === JSON.stringify(other.appliedTags) &&
                JSON.stringify(this.#availableTags) ===
                    JSON.stringify(other.availableTags?.map((tag) => tag.valueOf())) &&
                this.#bitrate === other.bitrate &&
                this.#defaultAutoArchiveDuration === other.defaultAutoArchiveDuration &&
                this.#defaultForumLayout === other.defaultForumLayout &&
                this.#defaultReactionEmoji?.equals(other.defaultReactionEmoji ?? {}) &&
                this.#defaultSortOrder === other.defaultSortOrder &&
                this.#defaultThreadRateLimitPerUser === other.defaultThreadRateLimitPerUser &&
                this.#flags === other.flags &&
                this.#guildId === other.guildId &&
                this.#icon === other.icon &&
                this.#id === other.id &&
                this.#lastMessageId === other.lastMessageId &&
                this.#lastPinTimestamp === other.lastPinTimestamp &&
                this.#managed === other.managed &&
                this.#member?.equals(other.member ?? {}) &&
                this.#memberCount === other.memberCount &&
                this.#messageCount === other.messageCount &&
                this.#name === other.name &&
                this.#nsfw === other.nsfw &&
                this.#ownerId === other.ownerId &&
                this.#parentId === other.parentId &&
                JSON.stringify(this.#permissionOverwrites) ===
                    JSON.stringify(other.permissionOverwrites?.map((overwrite) => overwrite.valueOf())) &&
                this.#permissions === other.permissions &&
                this.#position === other.position &&
                this.#rateLimitPerUser === other.rateLimitPerUser &&
                JSON.stringify(this.#recipients) === JSON.stringify(other.recipients?.map((user) => user.valueOf())) &&
                this.#rtcRegion === other.rtcRegion &&
                this.#threadMetadata?.equals(other.threadMetadata ?? {}) &&
                this.#topic === other.topic &&
                this.#totalMessageSent === other.totalMessageSent &&
                this.#type === other.type &&
                this.#userLimit === other.userLimit &&
                this.#videoQualityMode === other.videoQualityMode,
        );
    }
}
