import {
  type ChannelType,
  DmChannelEntity,
  type ForumLayoutType,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { User } from "./user.class.js";

export class DmChannel extends BaseClass<DmChannelEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof DmChannelEntity>> = {},
  ) {
    super(client, DmChannelEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType.Dm {
    return this.entity.type;
  }

  get lastMessageId(): Snowflake | null {
    return this.entity.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.entity.rate_limit_per_user ?? null;
  }

  get recipients(): User[] {
    return Array.isArray(this.entity.recipients)
      ? this.entity.recipients.map(
          (recipient) => new User(this.client, recipient),
        )
      : [];
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.entity.owner_id ?? null;
  }

  get applicationId(): Snowflake | null {
    return this.entity.application_id ?? null;
  }

  get managed(): boolean {
    return Boolean(this.entity.managed);
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
  }

  get messageCount(): number | null {
    return this.entity.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.entity.member_count ?? null;
  }

  get member(): ThreadMember | null {
    return this.entity.member
      ? new ThreadMember(this.client, this.entity.member)
      : null;
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get totalMessageSent(): number | null {
    return this.entity.total_message_sent ?? null;
  }

  get appliedTags(): Snowflake[] | null {
    return this.entity.applied_tags ?? null;
  }

  get defaultReactionEmoji(): DefaultReaction | null {
    return this.entity.default_reaction_emoji
      ? new DefaultReaction(this.client, this.entity.default_reaction_emoji)
      : null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.entity.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): SortOrderType | null {
    return this.entity.default_sort_order ?? null;
  }

  get defaultForumLayout(): ForumLayoutType | null {
    return this.entity.default_forum_layout ?? null;
  }

  toJson(): DmChannelEntity {
    return { ...this.entity };
  }
}

export const DmChannelSchema = z.instanceof(DmChannel);
