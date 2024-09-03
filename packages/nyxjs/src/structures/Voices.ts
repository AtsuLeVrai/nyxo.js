import type { IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import type {
	GuildMemberStructure,
	VoiceRegionStructure,
	VoiceStateStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";

export class VoiceRegion extends Base<VoiceRegionStructure> {
	public custom!: boolean;
	public deprecated!: boolean;
	public id!: string;
	public name!: string;
	public optimal!: boolean;

	public constructor(data: Partial<VoiceRegionStructure>) {
		super(data);
	}

	protected patch(data: Partial<VoiceRegionStructure>): void {
		this.custom = data.custom ?? this.custom;
		this.deprecated = data.deprecated ?? this.deprecated;
		this.id = data.id ?? this.id;
		this.name = data.name ?? this.name;
		this.optimal = data.optimal ?? this.optimal;
	}
}

export class VoiceState extends Base<VoiceStateStructure> {
	public channelId!: Snowflake | null;
	public deaf!: boolean;
	public guildId?: Snowflake;
	public member?: GuildMemberStructure;
	public mute!: boolean;
	public requestToSpeakTimestamp!: IsoO8601Timestamp | null;
	public selfDeaf!: boolean;
	public selfMute!: boolean;
	public selfStream?: boolean;
	public selfVideo!: boolean;
	public sessionId!: string;
	public suppress!: boolean;
	public userId!: Snowflake;

	public constructor(data: Partial<VoiceStateStructure>) {
		super(data);
	}

	protected patch(data: Partial<VoiceStateStructure>): void {
		this.channelId = data.channel_id ?? this.channelId;
		this.deaf = data.deaf ?? this.deaf;
		this.mute = data.mute ?? this.mute;
		this.requestToSpeakTimestamp =
			data.request_to_speak_timestamp ?? this.requestToSpeakTimestamp;
		this.selfDeaf = data.self_deaf ?? this.selfDeaf;
		this.selfMute = data.self_mute ?? this.selfMute;
		this.selfVideo = data.self_video ?? this.selfVideo;
		this.sessionId = data.session_id ?? this.sessionId;
		this.suppress = data.suppress ?? this.suppress;
		this.userId = data.user_id ?? this.userId;

		if ("guild_id" in data) {
			this.guildId = data.guild_id;
		}
		if ("member" in data) {
			this.member = data.member;
		}
		if ("self_stream" in data) {
			this.selfStream = data.self_stream;
		}
	}
}
