import type { Integer, Iso8601Timestamp } from "../markdown/index.js";
import type { ApplicationStructure } from "./applications.js";
import type { ChannelStructure } from "./channels.js";
import type { GuildMemberStructure, GuildStructure } from "./guilds.js";
import type { GuildScheduledEventStructure } from "./scheduled.js";
import type { UserStructure } from "./users.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object-invite-stage-instance-structure|Invite Stage Instance Structure}
 */
export type InviteStageInstanceStructure = {
    /**
     * The members speaking in the Stage
     *
     * @todo Verify if this is correct
     */
    members: Pick<
        GuildMemberStructure,
        "avatar" | "joined_at" | "nick" | "pending" | "premium_since" | "roles" | "user"
    >[];
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
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object-invite-metadata-structure|Invite Metadata Structure}
 */
export type InviteMetadataStructure = {
    /**
     * When this invite was created
     */
    created_at: Iso8601Timestamp;
    /**
     * Duration (in seconds) after which the invite expires
     */
    max_age: Integer;
    /**
     * Max number of times this invite can be used
     */
    max_uses: Integer;
    /**
     * Whether this invite only grants temporary membership
     */
    temporary: boolean;
    /**
     * Number of times this invite has been used
     */
    uses: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types|Invite Target Types}
 */
export enum InviteTargetTypes {
    Stream = 1,
    EmbeddedApplication = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types|Invite Types}
 */
export enum InviteTypes {
    Guild = 0,
    GroupDM = 1,
    Friend = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-structure|Invite Structure}
 */
/**
 * type	integer	the type of invite
 * code	string	the invite code (unique ID)
 * guild?	partial guild object	the guild this invite is for
 * channel	?partial channel object	the channel this invite is for
 * inviter?	user object	the user who created the invite
 * target_type?	integer	the type of target for this voice channel invite
 * target_user?	user object	the user whose stream to display for this voice channel stream invite
 * target_application?	partial application object	the embedded application to open for this voice channel embedded application invite
 * approximate_presence_count?	integer	approximate count of online members, returned from the GET /invites/<code> endpoint when with_counts is true
 * approximate_member_count?	integer	approximate count of total members, returned from the GET /invites/<code> endpoint when with_counts is true
 * expires_at?	?ISO8601 timestamp	the expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true
 * stage_instance?	invite stage instance object	stage instance data if there is a public Stage instance in the Stage channel this invite is for (deprecated)
 * guild_scheduled_event?	guild scheduled event object	guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id
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
     *
     * @todo Verify if this is correct
     */
    channel: Pick<ChannelStructure, "id" | "name" | "type"> | null;
    /**
     * The invite code (unique ID)
     */
    code: string;
    /**
     * The expiration date of this invite, returned from the GET /invites/<code> endpoint when with_expiration is true
     */
    expires_at?: Iso8601Timestamp | null;
    /**
     * The guild this invite is for
     *
     * @todo Verify if this is correct
     */
    guild?: Pick<
        GuildStructure,
        | "banner"
        | "description"
        | "features"
        | "icon"
        | "id"
        | "name"
        | "nsfw_level"
        | "premium_subscription_count"
        | "splash"
        | "vanity_url_code"
        | "verification_level"
    >;
    /**
     * Guild scheduled event data, only included if guild_scheduled_event_id contains a valid guild scheduled event id
     */
    guild_scheduled_event?: GuildScheduledEventStructure;
    /**
     * The user who created the invite
     */
    inviter?: UserStructure;
    /**
     * Stage instance data if there is a public Stage instance in the Stage channel this invite is for
     */
    stage_instance?: InviteStageInstanceStructure;
    /**
     * The embedded application to open for this voice channel embedded application invite
     *
     * @todo No information available in the Discord API documentation
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
