import {
  type AutoArchiveDuration,
  ChannelType,
  type GuildAnnouncementChannelEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Channel } from "./channel.class.js";
import { Overwrite } from "./overwrite.class.js";

export class GuildAnnouncementChannel
  extends Channel<GuildAnnouncementChannelEntity>
  implements EnforceCamelCase<GuildAnnouncementChannelEntity>
{
  override get type(): ChannelType.GuildAnnouncement {
    return ChannelType.GuildAnnouncement;
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

  get lastMessageId(): Snowflake | null | undefined {
    return this.data.last_message_id;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null | undefined {
    return this.data.last_pin_timestamp;
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
}
