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
}
