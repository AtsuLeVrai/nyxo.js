import type {
    ChannelStructure,
    GuildMemberStructure,
    GuildScheduledEventStructure,
    GuildStructure,
    Integer,
    InviteMetadataStructure,
    InviteStageInstanceStructure,
    InviteStructure,
    InviteTargetTypes,
    InviteTypes,
    Iso8601Timestamp,
    UserStructure,
} from "@nyxjs/core";
import { Application } from "./Applications.js";
import { Base } from "./Base.js";
import { Channel } from "./Channels.js";
import { Guild } from "./Guilds.js";
import { User } from "./Users.js";

export interface InviteStageInstanceSchema {
    readonly members: Pick<
        GuildMemberStructure,
        "avatar" | "joined_at" | "nick" | "pending" | "premium_since" | "roles" | "user"
    >[];
    readonly participantCount: Integer;
    readonly speakerCount: Integer;
    readonly topic: string | null;
}

export class InviteStageInstance
    extends Base<InviteStageInstanceStructure, InviteStageInstanceSchema>
    implements InviteStageInstanceSchema
{
    #members: Pick<
        GuildMemberStructure,
        "avatar" | "joined_at" | "nick" | "pending" | "premium_since" | "roles" | "user"
    >[] = [];
    #participantCount = 0;
    #speakerCount = 0;
    #topic: string | null = null;

    constructor(data: Partial<InviteStageInstanceStructure>) {
        super();
        this.patch(data);
    }

    get members(): Pick<
        GuildMemberStructure,
        "avatar" | "joined_at" | "nick" | "pending" | "premium_since" | "roles" | "user"
    >[] {
        return [...this.#members];
    }

    get participantCount(): Integer {
        return this.#participantCount;
    }

    get speakerCount(): Integer {
        return this.#speakerCount;
    }

    get topic(): string | null {
        return this.#topic;
    }

    static from(data: Partial<InviteStageInstanceStructure>): InviteStageInstance {
        return new InviteStageInstance(data);
    }

    patch(data: Partial<InviteStageInstanceStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (data.members !== undefined) {
            if (!Array.isArray(data.members)) {
                throw new TypeError(`Expected array for members, got ${typeof data.members}`);
            }
            this.#members = [...data.members];
        }

        this.#participantCount = data.participant_count ?? this.#participantCount;
        this.#speakerCount = data.speaker_count ?? this.#speakerCount;

        if (data.topic !== undefined) {
            if (typeof data.topic !== "string") {
                throw new TypeError(`Expected string for topic, got ${typeof data.topic}`);
            }
            if (data.topic.length === 0 || data.topic.length > 120) {
                throw new RangeError("Topic must be between 1 and 120 characters");
            }
            this.#topic = data.topic;
        }
    }

    toJson(): Partial<InviteStageInstanceStructure> {
        return {
            members: [...this.#members],
            participant_count: this.#participantCount,
            speaker_count: this.#speakerCount,
            topic: this.#topic ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): InviteStageInstanceSchema {
        return {
            members: [...this.#members],
            participantCount: this.#participantCount,
            speakerCount: this.#speakerCount,
            topic: this.#topic,
        };
    }

    clone(): InviteStageInstance {
        return new InviteStageInstance(this.toJson());
    }

    reset(): void {
        this.#members = [];
        this.#participantCount = 0;
        this.#speakerCount = 0;
        this.#topic = null;
    }

    equals(other: Partial<InviteStageInstance>): boolean {
        return Boolean(
            JSON.stringify(this.#members) === JSON.stringify(other.members) &&
                this.#participantCount === other.participantCount &&
                this.#speakerCount === other.speakerCount &&
                this.#topic === other.topic,
        );
    }
}

export interface InviteMetadataSchema {
    readonly createdAt: Iso8601Timestamp | null;
    readonly maxAge: Integer;
    readonly maxUses: Integer;
    readonly temporary: boolean;
    readonly uses: Integer;
}

export class InviteMetadata
    extends Base<InviteMetadataStructure, InviteMetadataSchema>
    implements InviteMetadataSchema
{
    #createdAt: Iso8601Timestamp | null = null;
    #maxAge = 0;
    #maxUses = 0;
    #temporary = false;
    #uses = 0;

    constructor(data: Partial<InviteMetadataStructure>) {
        super();
        this.patch(data);
    }

    get createdAt(): Iso8601Timestamp | null {
        return this.#createdAt;
    }

    get maxAge(): Integer {
        return this.#maxAge;
    }

    get maxUses(): Integer {
        return this.#maxUses;
    }

    get temporary(): boolean {
        return this.#temporary;
    }

    get uses(): Integer {
        return this.#uses;
    }

    static from(data: Partial<InviteMetadataStructure>): InviteMetadata {
        return new InviteMetadata(data);
    }

    patch(data: Partial<InviteMetadataStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#createdAt = data.created_at ?? this.#createdAt;
        this.#maxAge = data.max_age ?? this.#maxAge;
        this.#maxUses = data.max_uses ?? this.#maxUses;
        this.#temporary = Boolean(data.temporary ?? this.#temporary);
        this.#uses = data.uses ?? this.#uses;
    }

    toJson(): Partial<InviteMetadataStructure> {
        return {
            created_at: this.#createdAt ?? undefined,
            max_age: this.#maxAge,
            max_uses: this.#maxUses,
            temporary: this.#temporary,
            uses: this.#uses,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): InviteMetadataSchema {
        return {
            createdAt: this.#createdAt,
            maxAge: this.#maxAge,
            maxUses: this.#maxUses,
            temporary: this.#temporary,
            uses: this.#uses,
        };
    }

    clone(): InviteMetadata {
        return new InviteMetadata(this.toJson());
    }

    reset(): void {
        this.#createdAt = null;
        this.#maxAge = 0;
        this.#maxUses = 0;
        this.#temporary = false;
        this.#uses = 0;
    }

    equals(other: Partial<InviteMetadata>): boolean {
        return Boolean(
            this.#createdAt === other.createdAt &&
                this.#maxAge === other.maxAge &&
                this.#maxUses === other.maxUses &&
                this.#temporary === other.temporary &&
                this.#uses === other.uses,
        );
    }
}

export interface InviteSchema {
    readonly approximateMemberCount: Integer | null;
    readonly approximatePresenceCount: Integer | null;
    readonly channel: Channel | null;
    readonly code: string | null;
    readonly expiresAt: Iso8601Timestamp | null;
    readonly guild: Guild | null;
    readonly guildScheduledEvent: GuildScheduledEventStructure | null;
    readonly inviter: User | null;
    readonly stageInstance: InviteStageInstance | null;
    readonly targetApplication: Application | null;
    readonly targetType: InviteTargetTypes | null;
    readonly targetUser: User | null;
    readonly type: InviteTypes | null;
}

export class Invite extends Base<InviteStructure, InviteSchema> implements InviteSchema {
    #approximateMemberCount: Integer | null = null;
    #approximatePresenceCount: Integer | null = null;
    #channel: Channel | null = null;
    #code: string | null = null;
    #expiresAt: Iso8601Timestamp | null = null;
    #guild: Guild | null = null;
    #guildScheduledEvent: GuildScheduledEventStructure | null = null;
    #inviter: User | null = null;
    #stageInstance: InviteStageInstance | null = null;
    #targetApplication: Application | null = null;
    #targetType: InviteTargetTypes | null = null;
    #targetUser: User | null = null;
    #type: InviteTypes | null = null;

    constructor(data: Partial<InviteStructure>) {
        super();
        this.patch(data);
    }

    get approximateMemberCount(): Integer | null {
        return this.#approximateMemberCount;
    }

    get approximatePresenceCount(): Integer | null {
        return this.#approximatePresenceCount;
    }

    get channel(): Channel | null {
        return this.#channel;
    }

    get code(): string | null {
        return this.#code;
    }

    get expiresAt(): Iso8601Timestamp | null {
        return this.#expiresAt;
    }

    get guild(): Guild | null {
        return this.#guild;
    }

    get guildScheduledEvent(): GuildScheduledEventStructure | null {
        return this.#guildScheduledEvent;
    }

    get inviter(): User | null {
        return this.#inviter;
    }

    get stageInstance(): InviteStageInstance | null {
        return this.#stageInstance;
    }

    get targetApplication(): Application | null {
        return this.#targetApplication;
    }

    get targetType(): InviteTargetTypes | null {
        return this.#targetType;
    }

    get targetUser(): User | null {
        return this.#targetUser;
    }

    get type(): InviteTypes | null {
        return this.#type;
    }

    static from(data: Partial<InviteStructure>): Invite {
        return new Invite(data);
    }

    patch(data: Partial<InviteStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#approximateMemberCount = data.approximate_member_count ?? this.#approximateMemberCount;
        this.#approximatePresenceCount = data.approximate_presence_count ?? this.#approximatePresenceCount;
        this.#channel = data.channel ? Channel.from(data.channel) : this.#channel;
        this.#code = data.code ?? this.#code;
        this.#expiresAt = data.expires_at ?? this.#expiresAt;
        this.#guild = data.guild ? Guild.from(data.guild) : this.#guild;
        this.#guildScheduledEvent = data.guild_scheduled_event ?? this.#guildScheduledEvent;
        this.#inviter = data.inviter ? User.from(data.inviter) : this.#inviter;
        this.#stageInstance = data.stage_instance ? InviteStageInstance.from(data.stage_instance) : this.#stageInstance;
        this.#targetApplication = data.target_application
            ? Application.from(data.target_application)
            : this.#targetApplication;
        this.#targetType = data.target_type ?? this.#targetType;
        this.#targetUser = data.target_user ? User.from(data.target_user) : this.#targetUser;
        this.#type = data.type ?? this.#type;
    }

    toJson(): Partial<InviteStructure> {
        return {
            approximate_member_count: this.#approximateMemberCount ?? undefined,
            approximate_presence_count: this.#approximatePresenceCount ?? undefined,
            channel: this.#channel?.toJson() as ChannelStructure,
            code: this.#code ?? undefined,
            expires_at: this.#expiresAt ?? undefined,
            guild: this.#guild?.toJson() as GuildStructure,
            guild_scheduled_event: this.#guildScheduledEvent ?? undefined,
            inviter: this.#inviter?.toJson() as UserStructure,
            stage_instance: this.#stageInstance?.toJson() as InviteStageInstanceStructure,
            target_application: this.#targetApplication?.toJson(),
            target_type: this.#targetType ?? undefined,
            target_user: this.#targetUser?.toJson() as UserStructure,
            type: this.#type ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): InviteSchema {
        return {
            approximateMemberCount: this.#approximateMemberCount,
            approximatePresenceCount: this.#approximatePresenceCount,
            channel: this.#channel,
            code: this.#code,
            expiresAt: this.#expiresAt,
            guild: this.#guild,
            guildScheduledEvent: this.#guildScheduledEvent,
            inviter: this.#inviter,
            stageInstance: this.#stageInstance,
            targetApplication: this.#targetApplication,
            targetType: this.#targetType,
            targetUser: this.#targetUser,
            type: this.#type,
        };
    }

    clone(): Invite {
        return new Invite(this.toJson());
    }

    reset(): void {
        this.#approximateMemberCount = null;
        this.#approximatePresenceCount = null;
        this.#channel = null;
        this.#code = null;
        this.#expiresAt = null;
        this.#guild = null;
        this.#guildScheduledEvent = null;
        this.#inviter = null;
        this.#stageInstance = null;
        this.#targetApplication = null;
        this.#targetType = null;
        this.#targetUser = null;
        this.#type = null;
    }

    equals(other: Partial<Invite>): boolean {
        return Boolean(
            this.#approximateMemberCount === other.approximateMemberCount &&
                this.#approximatePresenceCount === other.approximatePresenceCount &&
                this.#channel?.equals(other.channel ?? {}) &&
                this.#code === other.code &&
                this.#expiresAt === other.expiresAt &&
                this.#guild?.equals(other.guild ?? {}) &&
                this.#guildScheduledEvent === other.guildScheduledEvent &&
                this.#inviter?.equals(other.inviter ?? {}) &&
                this.#stageInstance?.equals(other.stageInstance ?? {}) &&
                this.#targetApplication?.equals(other.targetApplication ?? {}) &&
                this.#targetType === other.targetType &&
                this.#targetUser?.equals(other.targetUser ?? {}) &&
                this.#type === other.type,
        );
    }
}
