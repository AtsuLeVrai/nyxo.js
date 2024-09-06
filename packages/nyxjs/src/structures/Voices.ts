import type { VoiceRegionStructure, VoiceStateStructure } from "@nyxjs/api-types";
import type { IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { GuildMember } from "./Guilds";

export class VoiceRegion extends Base<VoiceRegionStructure> {
    public custom!: boolean;

    public deprecated!: boolean;

    public id!: string;

    public name!: string;

    public optimal!: boolean;

    public constructor(data: Readonly<Partial<VoiceRegionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<VoiceRegionStructure>>): void {
        if (data.custom !== undefined) {
            this.custom = data.custom;
        }

        if (data.deprecated !== undefined) {
            this.deprecated = data.deprecated;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.optimal !== undefined) {
            this.optimal = data.optimal;
        }
    }
}

export class VoiceState extends Base<VoiceStateStructure> {
    public channelId!: Snowflake | null;

    public deaf!: boolean;

    public guildId?: Snowflake;

    public member?: GuildMember;

    public mute!: boolean;

    public requestToSpeakTimestamp!: IsoO8601Timestamp | null;

    public selfDeaf!: boolean;

    public selfMute!: boolean;

    public selfStream?: boolean;

    public selfVideo!: boolean;

    public sessionId!: string;

    public suppress!: boolean;

    public userId!: Snowflake;

    public constructor(data: Readonly<Partial<VoiceStateStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<VoiceStateStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if (data.deaf !== undefined) {
            this.deaf = data.deaf;
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else if (data.guild_id !== undefined) {
                this.guildId = data.guild_id;
            }
        }

        if ("member" in data) {
            if (data.member === null) {
                this.member = undefined;
            } else if (data.member !== undefined) {
                this.member = GuildMember.from(data.member);
            }
        }

        if (data.mute !== undefined) {
            this.mute = data.mute;
        }

        if (data.request_to_speak_timestamp !== undefined) {
            this.requestToSpeakTimestamp = data.request_to_speak_timestamp;
        }

        if (data.self_deaf !== undefined) {
            this.selfDeaf = data.self_deaf;
        }

        if (data.self_mute !== undefined) {
            this.selfMute = data.self_mute;
        }

        if ("self_stream" in data) {
            if (data.self_stream === null) {
                this.selfStream = undefined;
            } else if (data.self_stream !== undefined) {
                this.selfStream = data.self_stream;
            }
        }

        if (data.self_video !== undefined) {
            this.selfVideo = data.self_video;
        }

        if (data.session_id !== undefined) {
            this.sessionId = data.session_id;
        }

        if (data.suppress !== undefined) {
            this.suppress = data.suppress;
        }

        if (data.user_id !== undefined) {
            this.userId = data.user_id;
        }
    }
}
