import {
  ChannelType,
  type GuildStageVoiceChannelEntity,
  type Snowflake,
  type VideoQualityMode,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Channel } from "./channel.class.js";
import { Overwrite } from "./overwrite.class.js";

export class GuildStageVoiceChannel
  extends Channel<GuildStageVoiceChannelEntity>
  implements EnforceCamelCase<GuildStageVoiceChannelEntity>
{
  override get type(): ChannelType.GuildStageVoice {
    return ChannelType.GuildStageVoice;
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

    return this.data.permission_overwrites.map((overwrite) =>
      Overwrite.from(this.client, overwrite),
    );
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get bitrate(): number {
    return this.data.bitrate;
  }

  get userLimit(): number {
    return this.data.user_limit;
  }

  get parentId(): Snowflake | null | undefined {
    return this.data.parent_id;
  }

  get rtcRegion(): string | null | undefined {
    return this.data.rtc_region;
  }

  get videoQualityMode(): VideoQualityMode | undefined {
    return this.data.video_quality_mode;
  }

  get permissions(): string | undefined {
    return this.data.permissions;
  }

  get flags(): number {
    return this.data.flags;
  }
}
