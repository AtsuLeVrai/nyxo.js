import type {
  AnyThreadChannelEntity,
  GuildMemberEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import type {
  ThreadListSyncEntity,
  ThreadMembersUpdateEntity,
  ThreadMemberUpdateEntity,
} from "@nyxjs/gateway";
import { BaseClass } from "../bases/index.js";

/**
 * Represents a thread member update event.
 * Sent when the thread member object for the current user is updated.
 */
export class ThreadMember extends BaseClass<ThreadMemberUpdateEntity> {
  /**
   * ID of the thread
   */
  get id(): Snowflake | undefined {
    return this.data.id;
  }

  /**
   * ID of the user
   */
  get userId(): Snowflake | undefined {
    return this.data.user_id;
  }

  /**
   * ID of the guild
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Time the user last joined the thread
   */
  get joinTimestamp(): string {
    return this.data.join_timestamp;
  }

  /**
   * Thread-specific user settings
   */
  get flags(): number {
    return this.data.flags;
  }

  /**
   * Additional information about the user
   */
  get member(): GuildMemberEntity | undefined {
    return this.data.member;
  }

  /**
   * Whether the user has member data available
   */
  get hasMemberData(): boolean {
    return Boolean(this.data.member);
  }
}

/**
 * Represents a thread members update event.
 * Sent when anyone is added to or removed from a thread.
 */
export class ThreadMembers extends BaseClass<ThreadMembersUpdateEntity> {
  /**
   * ID of the thread
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * ID of the guild
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Approximate number of members in the thread, capped at 50
   */
  get memberCount(): number {
    return this.data.member_count;
  }

  /**
   * The members who were added to the thread
   */
  get addedMembers(): ThreadMemberEntity[] | undefined {
    return this.data.added_members;
  }

  /**
   * The IDs of members who were removed from the thread
   */
  get removedMemberIds(): string[] | undefined {
    return this.data.removed_member_ids;
  }

  /**
   * Whether there were members added to the thread in this update
   */
  get hasMembersAdded(): boolean {
    return this.data.added_members?.length > 0;
  }

  /**
   * Whether there were members removed from the thread in this update
   */
  get hasMembersRemoved(): boolean {
    return this.data.removed_member_ids?.length > 0;
  }
}

/**
 * Represents a thread list sync event.
 * Sent when the client gains access to a channel, containing all active threads in that channel.
 * This helps synchronize thread state when joining a guild or gaining access to a channel.
 */
export class ThreadListSync extends BaseClass<ThreadListSyncEntity> {
  /**
   * ID of the guild
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * IDs of the parent channels whose threads are being synced
   */
  get channelIds(): Snowflake[] | undefined {
    return this.data.channel_ids;
  }

  /**
   * All active threads in the given channels that the current user can access
   */
  get threads(): AnyThreadChannelEntity[] {
    return this.data.threads;
  }

  /**
   * All thread member objects from the synced threads for the current user
   */
  get members(): ThreadMemberEntity[] {
    return this.data.members;
  }

  /**
   * Whether specific channel IDs were specified for this sync
   */
  get hasChannelIds(): boolean {
    return this.data.channel_ids?.length > 0;
  }

  /**
   * Whether there are any threads in this sync
   */
  get hasThreads(): boolean {
    return this.data.threads.length > 0;
  }

  /**
   * Whether the current user is a member of any of the synced threads
   */
  get hasMembers(): boolean {
    return this.data.members.length > 0;
  }
}
