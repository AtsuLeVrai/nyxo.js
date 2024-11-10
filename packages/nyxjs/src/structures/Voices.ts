import type {
    GuildMemberStructure,
    Iso8601Timestamp,
    Snowflake,
    VoiceRegionStructure,
    VoiceStateStructure,
} from "@nyxjs/core";
import { Base } from "./Base.js";
import { GuildMember } from "./Guilds.js";

export interface VoiceRegionSchema {
    readonly custom: boolean;
    readonly deprecated: boolean;
    readonly id: string | null;
    readonly name: string | null;
    readonly optimal: boolean;
}

export class VoiceRegion extends Base<VoiceRegionStructure, VoiceRegionSchema> {
    #custom = false;
    #deprecated = false;
    #id: string | null = null;
    #name: string | null = null;
    #optimal = false;

    constructor(data: Partial<VoiceRegionStructure>) {
        super();
        this.patch(data);
    }

    get custom(): boolean {
        return this.#custom;
    }

    get deprecated(): boolean {
        return this.#deprecated;
    }

    get id(): string | null {
        return this.#id;
    }

    get name(): string | null {
        return this.#name;
    }

    get optimal(): boolean {
        return this.#optimal;
    }

    static from(data: Partial<VoiceRegionStructure>): VoiceRegion {
        return new VoiceRegion(data);
    }

    patch(data: Partial<VoiceRegionStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#custom = Boolean(data.custom ?? this.#custom);
        this.#deprecated = Boolean(data.deprecated ?? this.#deprecated);
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#optimal = Boolean(data.optimal ?? this.#optimal);
    }

    toJson(): Partial<VoiceRegionStructure> {
        return {
            custom: this.#custom,
            deprecated: this.#deprecated,
            id: this.#id ?? undefined,
            name: this.#name ?? undefined,
            optimal: this.#optimal,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): VoiceRegionSchema {
        return {
            custom: this.#custom,
            deprecated: this.#deprecated,
            id: this.#id,
            name: this.#name,
            optimal: this.#optimal,
        };
    }

    clone(): VoiceRegion {
        return new VoiceRegion(this.toJson());
    }

    reset(): void {
        this.#custom = false;
        this.#deprecated = false;
        this.#id = null;
        this.#name = null;
        this.#optimal = false;
    }

    equals(other: Partial<VoiceRegion>): boolean {
        return (
            this.#custom === other.custom &&
            this.#deprecated === other.deprecated &&
            this.#id === other.id &&
            this.#name === other.name &&
            this.#optimal === other.optimal
        );
    }
}

export interface VoiceStateSchema {
    readonly channelId: Snowflake | null;
    readonly deaf: boolean;
    readonly guildId: Snowflake | null;
    readonly member: GuildMember | null;
    readonly mute: boolean;
    readonly requestToSpeakTimestamp: Iso8601Timestamp | null;
    readonly selfDeaf: boolean;
    readonly selfMute: boolean;
    readonly selfStream: boolean;
    readonly selfVideo: boolean;
    readonly sessionId: string | null;
    readonly suppress: boolean;
    readonly userId: Snowflake | null;
}

export class VoiceState extends Base<VoiceStateStructure, VoiceStateSchema> {
    #channelId: Snowflake | null = null;
    #deaf = false;
    #guildId: Snowflake | null = null;
    #member: GuildMember | null = null;
    #mute = false;
    #requestToSpeakTimestamp: Iso8601Timestamp | null = null;
    #selfDeaf = false;
    #selfMute = false;
    #selfStream = false;
    #selfVideo = false;
    #sessionId: string | null = null;
    #suppress = false;
    #userId: Snowflake | null = null;

    constructor(data: Partial<VoiceStateStructure>) {
        super();
        this.patch(data);
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get deaf(): boolean {
        return this.#deaf;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get member(): GuildMember | null {
        return this.#member;
    }

    get mute(): boolean {
        return this.#mute;
    }

    get requestToSpeakTimestamp(): Iso8601Timestamp | null {
        return this.#requestToSpeakTimestamp;
    }

    get selfDeaf(): boolean {
        return this.#selfDeaf;
    }

    get selfMute(): boolean {
        return this.#selfMute;
    }

    get selfStream(): boolean {
        return this.#selfStream;
    }

    get selfVideo(): boolean {
        return this.#selfVideo;
    }

    get sessionId(): string | null {
        return this.#sessionId;
    }

    get suppress(): boolean {
        return this.#suppress;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    static from(data: Partial<VoiceStateStructure>): VoiceState {
        return new VoiceState(data);
    }

    patch(data: Partial<VoiceStateStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#channelId = data.channel_id ?? this.#channelId;
        this.#deaf = Boolean(data.deaf ?? this.#deaf);
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#member = data.member ? GuildMember.from(data.member) : this.#member;
        this.#mute = Boolean(data.mute ?? this.#mute);
        this.#requestToSpeakTimestamp = data.request_to_speak_timestamp ?? this.#requestToSpeakTimestamp;
        this.#selfDeaf = Boolean(data.self_deaf ?? this.#selfDeaf);
        this.#selfMute = Boolean(data.self_mute ?? this.#selfMute);
        this.#selfStream = Boolean(data.self_stream ?? this.#selfStream);
        this.#selfVideo = Boolean(data.self_video ?? this.#selfVideo);
        this.#sessionId = data.session_id ?? this.#sessionId;
        this.#suppress = Boolean(data.suppress ?? this.#suppress);
        this.#userId = data.user_id ?? this.#userId;
    }

    toJson(): Partial<VoiceStateStructure> {
        return {
            channel_id: this.#channelId,
            deaf: this.#deaf,
            guild_id: this.#guildId ?? undefined,
            member: this.#member?.toJson() as GuildMemberStructure,
            mute: this.#mute,
            request_to_speak_timestamp: this.#requestToSpeakTimestamp,
            self_deaf: this.#selfDeaf,
            self_mute: this.#selfMute,
            self_stream: this.#selfStream,
            self_video: this.#selfVideo,
            session_id: this.#sessionId ?? undefined,
            suppress: this.#suppress,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): VoiceStateSchema {
        return {
            channelId: this.#channelId,
            deaf: this.#deaf,
            guildId: this.#guildId,
            member: this.#member,
            mute: this.#mute,
            requestToSpeakTimestamp: this.#requestToSpeakTimestamp,
            selfDeaf: this.#selfDeaf,
            selfMute: this.#selfMute,
            selfStream: this.#selfStream,
            selfVideo: this.#selfVideo,
            sessionId: this.#sessionId,
            suppress: this.#suppress,
            userId: this.#userId,
        };
    }

    clone(): VoiceState {
        return new VoiceState(this.toJson());
    }

    reset(): void {
        this.#channelId = null;
        this.#deaf = false;
        this.#guildId = null;
        this.#member = null;
        this.#mute = false;
        this.#requestToSpeakTimestamp = null;
        this.#selfDeaf = false;
        this.#selfMute = false;
        this.#selfStream = false;
        this.#selfVideo = false;
        this.#sessionId = null;
        this.#suppress = false;
        this.#userId = null;
    }

    equals(other: Partial<VoiceState>): boolean {
        return Boolean(
            this.#channelId === other.channelId &&
                this.#deaf === other.deaf &&
                this.#guildId === other.guildId &&
                this.#member?.equals(other.member ?? this.#member) &&
                this.#mute === other.mute &&
                this.#requestToSpeakTimestamp === other.requestToSpeakTimestamp &&
                this.#selfDeaf === other.selfDeaf &&
                this.#selfMute === other.selfMute &&
                this.#selfStream === other.selfStream &&
                this.#selfVideo === other.selfVideo &&
                this.#sessionId === other.sessionId &&
                this.#suppress === other.suppress &&
                this.#userId === other.userId,
        );
    }
}
