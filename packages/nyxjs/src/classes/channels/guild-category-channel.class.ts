import {
  ChannelType,
  type GuildCategoryChannelEntity,
  type Snowflake,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Channel } from "./channel.class.js";
import { Overwrite } from "./overwrite.class.js";

export class GuildCategoryChannel
  extends Channel<GuildCategoryChannelEntity>
  implements EnforceCamelCase<GuildCategoryChannelEntity>
{
  override get type(): ChannelType.GuildCategory {
    return ChannelType.GuildCategory;
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

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}
