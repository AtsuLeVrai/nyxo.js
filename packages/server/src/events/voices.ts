import type { Snowflake } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export type VoiceServerUpdateEventFields = {
	/**
	 * Voice server host
	 */
	endpoint: string | null;
	/**
	 * Guild this voice server update is for
	 */
	guild_id: Snowflake;
	/**
	 * Voice connection token
	 */
	token: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export type GatewayVoiceStateUpdateStructure = {
	/**
	 * ID of the voice channel client wants to join (null if disconnecting)
	 */
	channel_id: Snowflake | null;
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
	/**
	 * Whether the client deafened
	 */
	self_deaf: boolean;
	/**
	 * Whether the client is muted
	 */
	self_mute: boolean;
};
