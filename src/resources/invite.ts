import type { ApplicationEntity } from "./application.js";
import type { AnyChannelEntity } from "./channel.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.js";
import type { GuildScheduledEventObject } from "./guild-scheduled-event.js";
import type { UserObject } from "./user.js";

/**
 * Types of Discord invites categorizing the destination and access method.
 * Determines what kind of space the invite provides access to.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-types} for invite types specification
 */
export enum InviteTypes {
  /** Invite to join a Discord guild (server) */
  Guild = 0,
  /** Invite to join a group direct message channel */
  GroupDm = 1,
  /** Friend invitation for direct messaging */
  Friend = 2,
}

/**
 * Target types for voice channel invites with special functionality.
 * Specifies what kind of activity the invite is designed to showcase.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types} for invite target types specification
 */
export enum InviteTargetTypes {
  /** Invite to watch a user's stream in a voice channel */
  Stream = 1,
  /** Invite to use an embedded application in a voice channel */
  EmbeddedApplication = 2,
}

/**
 * Bitfield flags providing additional context for guild invites.
 * Controls special behaviors and access permissions for invited users.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object-guild-invite-flags} for guild invite flags specification
 */
export enum GuildInviteFlags {
  /** Invite grants guest access to a voice channel without full guild membership */
  IsGuestInvite = 1 << 0,
}

/**
 * Deprecated stage instance information included with some invites.
 * Contains metadata about active stage channel sessions for context.
 *
 * @deprecated This object type is no longer actively used
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-stage-instance-object} for stage instance specification
 */
export interface InviteStageInstanceObject {
  /** Partial guild member objects of users speaking in the stage */
  readonly members: Partial<GuildMemberEntity>[];
  /** Total number of users currently in the stage channel */
  readonly participant_count: number;
  /** Number of users currently speaking in the stage */
  readonly speaker_count: number;
  /** Topic of the stage instance (1-120 characters) */
  readonly topic: string;
}

/**
 * Extended metadata for invites providing usage statistics and configuration.
 * Contains administrative information about invite limits and creation details.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-metadata-object} for invite metadata specification
 */
export interface InviteMetadataObject {
  /** Number of times this invite has been used */
  readonly uses: number;
  /** Maximum number of times this invite can be used (0 for unlimited) */
  readonly max_uses: number;
  /** Duration in seconds after which the invite expires (0 for permanent) */
  readonly max_age: number;
  /** Whether this invite only grants temporary membership */
  readonly temporary: boolean;
  /** ISO8601 timestamp when this invite was created */
  readonly created_at: string;
}

/**
 * Discord invite object representing access codes for guilds and channels.
 * Provides temporary or permanent access to Discord spaces with configurable restrictions.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#invite-object} for invite object specification
 */
export interface InviteObject {
  /** Type of invite determining the destination */
  readonly type: InviteTypes;
  /** Unique invite code used for redemption */
  readonly code: string;
  /** Partial guild object this invite provides access to */
  readonly guild?: Partial<GuildEntity>;
  /** Channel this invite is for (null for guild-wide invites) */
  readonly channel: AnyChannelEntity | null;
  /** User who created this invite */
  readonly inviter?: UserObject;
  /** Special target type for voice channel invites */
  readonly target_type?: InviteTargetTypes;
  /** Target user for stream invites */
  readonly target_user?: UserObject;
  /** Target application for embedded application invites */
  readonly target_application?: Partial<ApplicationEntity>;
  /** Approximate count of online members (requires with_counts=true) */
  readonly approximate_presence_count?: number;
  /** Approximate count of total members (requires with_counts=true) */
  readonly approximate_member_count?: number;
  /** ISO8601 timestamp when this invite expires */
  readonly expires_at?: string | null;
  /** Deprecated stage instance data */
  readonly stage_instance?: InviteStageInstanceObject;
  /** Guild scheduled event associated with this invite */
  readonly guild_scheduled_event?: GuildScheduledEventObject;
  /** Guild-specific invite flags */
  readonly flags?: GuildInviteFlags;
}

/**
 * Extended invite object including administrative metadata.
 * Combines base invite information with usage statistics and management data.
 */
export type InviteWithMetadataObject = InviteObject & InviteMetadataObject;

/**
 * Gateway event data for invite deletion notifications.
 * Sent when invites are deleted to notify connected clients.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete} for invite delete event specification
 */
export interface InviteDeleteObject {
  /** Channel the deleted invite was for */
  readonly channel_id: string;
  /** Guild the deleted invite was for (if applicable) */
  readonly guild_id?: string;
  /** Code of the deleted invite */
  readonly code: string;
}

/**
 * Gateway event data for invite creation notifications.
 * Sent when new invites are created to notify connected clients with full invite details.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create} for invite create event specification
 */
export interface InviteCreateObject {
  /** Channel the invite was created for */
  readonly channel_id: string;
  /** Unique invite code */
  readonly code: string;
  /** ISO8601 timestamp when invite was created */
  readonly created_at: string;
  /** Guild the invite was created for (if applicable) */
  readonly guild_id?: string;
  /** User who created the invite */
  readonly inviter?: UserObject;
  /** Duration in seconds after which invite expires */
  readonly max_age: number;
  /** Maximum number of times invite can be used */
  readonly max_uses: number;
  /** Target type for voice channel invites */
  readonly target_type?: InviteTargetTypes;
  /** Target user for stream invites */
  readonly target_user?: UserObject;
  /** Target application for embedded application invites */
  readonly target_application?: ApplicationEntity;
  /** Whether invite only grants temporary membership */
  readonly temporary: boolean;
  /** Current usage count for this invite */
  readonly uses: number;
}

/**
 * Query parameters for retrieving invite information with optional enhancements.
 * Controls what additional data is included in the invite response.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite} for get invite endpoint
 */
export interface GetInviteQueryStringParams {
  /** Whether to include approximate member counts in response */
  readonly with_counts?: boolean;
  /** Guild scheduled event ID to include with the invite */
  readonly guild_scheduled_event_id?: string;
}
