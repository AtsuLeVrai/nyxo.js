import {
  type ChannelType,
  type ForumLayoutType,
  GroupDmChannelEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { GuildMember } from "./guild-member.class.js";
import { User } from "./user.class.js";

export class GroupDmChannel extends BaseClass<GroupDmChannelEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GroupDmChannelEntity>> = {},
  ) {
    super(client, GroupDmChannelEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.GroupDm {
    return this.data.type;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get topic(): string | null {
    return this.data.topic ?? null;
  }

  get lastMessageId(): Snowflake | null {
    return this.data.last_message_id ?? null;
  }

  get recipients(): User[] {
    return Array.isArray(this.data.recipients)
      ? this.data.recipients.map(
          (recipient) => new User(this.client, recipient),
        )
      : [];
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get ownerId(): Snowflake {
    return this.data.owner_id;
  }

  get applicationId(): Snowflake | null {
    return this.data.application_id ?? null;
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  get messageCount(): number | null {
    return this.data.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.data.member_count ?? null;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get totalMessageSent(): number | null {
    return this.data.total_message_sent ?? null;
  }

  get appliedTags(): Snowflake[] | null {
    return this.data.applied_tags ?? null;
  }

  get defaultReactionEmoji(): DefaultReaction | null {
    return this.data.default_reaction_emoji
      ? new DefaultReaction(this.client, this.data.default_reaction_emoji)
      : null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.data.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): SortOrderType | null {
    return this.data.default_sort_order ?? null;
  }

  get defaultForumLayout(): ForumLayoutType | null {
    return this.data.default_forum_layout ?? null;
  }

  toJson(): GroupDmChannelEntity {
    return { ...this.data };
  }
}

export const GroupDmChannelSchema = z.instanceof(GroupDmChannel);
