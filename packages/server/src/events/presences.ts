import type { Integer, Snowflake } from "@nyxjs/core";
import type { GuildMemberStructure, UserStructure } from "@nyxjs/rest";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#typing-start-typing-start-event-fields}
 */
export type TypingStartEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * Member who started typing if this happened in a guild
	 */
	member?: GuildMemberStructure;
	/**
	 * Unix time (in seconds) of when the user started typing
	 */
	timestamp: Integer;
	/**
	 * ID of the user
	 */
	user_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-buttons}
 */
export type ActivityButton = {
	/**
	 * Text shown on the button (1-32 characters)
	 */
	label: string;
	/**
	 * URL opened when clicking the button (1-512 characters)
	 */
	url: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
	Instance = 1,
	Join = 2,
	Spectate = 4,
	JoinRequest = 8,
	Sync = 16,
	Play = 32,
	PartyPrivacyFriends = 64,
	PartyPrivacyVoiceChannel = 128,
	Embedded = 256,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-secrets}
 */
export type ActivitySecrets = {
	/**
	 * Secret for joining a party
	 */
	join?: string;
	/**
	 * Secret for a specific instanced match
	 */
	match?: string;
	/**
	 * Secret for spectating a game
	 */
	spectate?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-assets}
 */
export type ActivityAssets = {
	/**
	 * ID for a large asset of the activity
	 */
	large_image?: string;
	/**
	 * Text displayed when hovering over the large image of the activity
	 */
	large_text?: string;
	/**
	 * ID for a small asset of the activity
	 */
	small_image?: string;
	/**
	 * Text displayed when hovering over the small image of the activity
	 */
	small_text?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-party}
 */
export type ActivityParty = {
	/**
	 * ID of the party
	 */
	id?: string;
	/**
	 * Used to show the party's current and maximum size
	 */
	size?: [current_size: Integer, max_size: Integer];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-emoji}
 */
export type ActivityEmoji = {
	/**
	 * Whether the emoji is animated
	 */
	animated?: boolean;
	/**
	 * ID of the emoji
	 */
	id?: Snowflake;
	/**
	 * Name of the emoji
	 */
	name: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-timestamps}
 */
export type ActivityTimestamps = {
	/**
	 * Unix time (in milliseconds) of when the activity ends
	 */
	end?: Integer;
	/**
	 * Unix time (in milliseconds) of when the activity started
	 */
	start?: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-types}
 */
export enum ActivityTypes {
	Game = 0,
	Streaming = 1,
	Listening = 2,
	Watching = 3,
	Custom = 4,
	Competing = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#activity-object-activity-structure}
 */
export type ActivityStructure = {
	/**
	 * Application ID for the game
	 */
	application_id?: Snowflake;
	/**
	 * Images for the presence and their hover texts
	 */
	assets?: ActivityAssets;
	/**
	 * Custom buttons shown in the Rich Presence (max 2)
	 */
	buttons?: ActivityButton[];
	/**
	 * Unix timestamp (in milliseconds) of when the activity was added to the user's session
	 */
	created_at: Integer;
	/**
	 * What the player is currently doing
	 */
	details?: string | null;
	/**
	 * Emoji used for a custom status
	 */
	emoji?: ActivityEmoji | null;
	/**
	 * Activity flags ORd together, describes what the payload includes
	 */
	flags?: ActivityFlags;
	/**
	 * Whether or not the activity is an instanced game session
	 */
	instance?: boolean;
	/**
	 * Activity's name
	 */
	name: string;
	/**
	 * Information for the current party of the player
	 */
	party?: ActivityParty;
	/**
	 * Secrets for Rich Presence joining and spectating
	 */
	secrets?: ActivitySecrets;
	/**
	 * User's current party status, or text used for a custom status
	 */
	state?: string | null;
	/**
	 * Unix timestamps for start and/or end of the game
	 */
	timestamps?: ActivityTimestamps;
	/**
	 * Activity type
	 */
	type: ActivityTypes;
	/**
	 * Stream URL, is validated when type is 1
	 */
	url?: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#client-status-object}
 */
export type ClientStatus = {
	/**
	 * User's status set for an active desktop (Windows, Linux, Mac) application session
	 */
	desktop?: string;
	/**
	 * User's status set for an active mobile (iOS, Android) application session
	 */
	mobile?: string;
	/**
	 * User's status set for an active web (browser, bot user) application session
	 */
	web?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#presence-update-presence-update-event-fields}
 */
export type PresenceUpdateEventFields = {
	/**
	 * User's current activities
	 */
	activities: ActivityStructure[];
	/**
	 * User's platform-dependent status
	 */
	client_status: ClientStatus;
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
	/**
	 * Either "idle", "dnd", "online", or "offline"
	 */
	status: "dnd" | "idle" | "offline" | "online";
	/**
	 * User whose presence is being updated
	 */
	user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence-status-types}
 */
export enum PresenceStatusTypes {
	AwayFromKeyboard = "idle",
	DoNotDisturb = "dnd",
	Invisible = "invisible",
	Offline = "offline",
	Online = "online",
}

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#update-presence-gateway-presence-update-structure}
 */
export type GatewayPresenceUpdateStructure = {
	/**
	 * User's activities
	 */
	activities: ActivityStructure[];
	/**
	 * Whether or not the client is afk
	 */
	afk: boolean;
	/**
	 * Unix time (in milliseconds) of when the client went idle, or null if the client is not idle
	 */
	since: Integer | null;
	/**
	 * User's new status
	 */
	status: PresenceStatusTypes;
};
