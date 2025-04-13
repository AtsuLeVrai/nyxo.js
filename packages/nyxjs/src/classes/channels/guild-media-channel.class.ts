import {
  type AutoArchiveDuration,
  ChannelType,
  type GuildMediaChannelEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Channel } from "./channel.class.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { Overwrite } from "./overwrite.class.js";

export class GuildMediaChannel
  extends Channel<GuildMediaChannelEntity>
  implements EnforceCamelCase<GuildMediaChannelEntity>
{
  override get type(): ChannelType.GuildMedia {
    return ChannelType.GuildMedia;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get position(): number | undefined {
    return this.data.position;
  }

  get permissionOverwrites(): Overwrite[] | undefined {
    if (!this.data.permission_overwrites) {
      return undefined;
    }

    return this.data.permission_overwrites.map(
      (overwrite) => new Overwrite(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get topic(): string | undefined {
    return this.data.topic;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get rateLimitPerUser(): number | undefined {
    return this.data.rate_limit_per_user;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get defaultAutoArchiveDuration(): AutoArchiveDuration | undefined {
    return this.data.default_auto_archive_duration;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }

  get availableTags(): ForumTag[] {
    return this.data.available_tags.map(
      (tag) => new ForumTag(this.client, tag),
    );
  }

  get appliedTags(): Snowflake[] | undefined {
    return this.data.applied_tags;
  }

  get defaultReactionEmoji(): DefaultReaction | null | undefined {
    if (!this.data.default_reaction_emoji) {
      return null;
    }

    return new DefaultReaction(this.client, this.data.default_reaction_emoji);
  }

  get defaultThreadRateLimitPerUser(): number | undefined {
    return this.data.default_thread_rate_limit_per_user;
  }

  get defaultSortOrder(): SortOrderType | null | undefined {
    return this.data.default_sort_order;
  }
}
