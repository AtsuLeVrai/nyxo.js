import type { Integer, ISO8601 } from "@lunajs/core";
import type { ApplicationStructure } from "./applications";
import type { ChannelStructure } from "./channels";
import type { GuildMemberStructure, GuildScheduledEventStructure, GuildStructure } from "./guilds";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure}
 */
export type InviteStageInstanceStructure = {
	/**
	 * The members speaking in the Stage
	 */
	members: Partial<GuildMemberStructure>[];
	/**
	 * The number of users in the Stage
	 */
	participant_count: Integer;
	/**
	 * The number of users speaking in the Stage
	 */
	speaker_count: Integer;
	/**
	 * The topic of the Stage instance (1-120 characters)
	 */
	topic: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure}
 */
export type InviteMetadataStructure = {
	/**
	 * When this invite was created
	 */
	created_at: ISO8601;
	/**
	 * The duration (in seconds) after which the invite expires
	 */
	max_age: Integer;
	/**
	 * The max number of times this invite can be used
	 */
	max_uses: Integer;
	/**
	 * Whether this invite only grants temporary membership
	 */
	temporary: boolean;
	/**
	 * The number of times this invite has been used
	 */
	uses: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types}
 */
export enum InviteTargetTypes {
	Stream = 1,
	EmbeddedApplication = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types}
 */
export enum InviteTypes {
	Guild = 0,
	GroupDM = 1,
	Friend = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure}
 */
export type InviteStructure = {
	/**
	 * Approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true
	 */
	approximate_member_count?: Integer;
	/**
	 * Approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true
	 */
	approximate_presence_count?: Integer;
	/**
	 * The channel this invite is for
	 */
	channel: Pick<ChannelStructure, "id" | "name" | "type"> | null;
	/**
	 * The invite code (unique ID)
	 */
	code: string;
	/**
	 * The expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true
	 */
	expires_at?: ISO8601 | null;
	/**
	 * The guild this invite is for
	 */
	guild?: Pick<GuildStructure, "banner" | "description" | "features" | "icon" | "id" | "name" | "nsfw_level" | "premium_subscription_count" | "splash" | "vanity_url_code" | "verification_level">;
	/**
	 * Guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id
	 */
	guild_scheduled_event?: GuildScheduledEventStructure;
	/**
	 * The user who created the invite
	 */
	inviter?: UserStructure;
	/**
	 * Stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated)
	 */
	stage_instance?: InviteStageInstanceStructure;
	/**
	 * The embedded application to open for this voice channel embedded application invite
	 */
	target_application?: Partial<ApplicationStructure>;
	/**
	 * The type of target for this voice channel invite
	 */
	target_type?: InviteTargetTypes;
	/**
	 * The user whose stream to display for this voice channel stream invite
	 */
	target_user?: UserStructure;
	/**
	 * The type of invite
	 */
	type: InviteTypes;
};
