import type { Integer, IsoO8601Timestamp, Snowflake } from "@nyxjs/core";
import type {
	ApplicationStructure,
	InviteTargetTypes,
	UserStructure,
} from "@nyxjs/rest";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#invite-delete-invite-delete-event-fields}
 */
export type InviteDeleteEventFields = {
	/**
	 * Channel of the invite
	 */
	channel_id: Snowflake;
	/**
	 * Unique invite code
	 */
	code: string;
	/**
	 * Guild of the invite
	 */
	guild_id?: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#invite-create-invite-create-event-fields}
 */
export type InviteCreateEventFields = {
	/**
	 * Channel the invite is for
	 */
	channel_id: Snowflake;
	/**
	 * Unique invite code
	 */
	code: string;
	/**
	 * Time at which the invite was created
	 */
	created_at: IsoO8601Timestamp;
	/**
	 * Guild of the invite
	 */
	guild_id?: Snowflake;
	/**
	 * User that created the invite
	 */
	inviter?: UserStructure;
	/**
	 * How long the invite is valid for (in seconds)
	 */
	max_age: Integer;
	/**
	 * Maximum number of times the invite can be used
	 */
	max_uses: Integer;
	/**
	 * Embedded application to open for this voice channel embedded application invite
	 */
	target_application?: Partial<ApplicationStructure>;
	/**
	 * Type of target for this voice channel invite
	 */
	target_type?: InviteTargetTypes;
	/**
	 * User whose stream to display for this voice channel stream invite
	 */
	target_user?: UserStructure;
	/**
	 * Whether or not the invite is temporary (invited users will be kicked on disconnect unless they're assigned a role)
	 */
	temporary: boolean;
	/**
	 * How many times the invite has been used (always will be 0)
	 */
	uses: Integer;
};
