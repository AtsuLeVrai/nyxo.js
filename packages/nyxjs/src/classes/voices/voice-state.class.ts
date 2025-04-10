import type {
  GuildMemberEntity,
  Snowflake,
  VoiceStateEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase, GuildBased } from "../../types/index.js";
import { GuildMember } from "../guilds/index.js";

export class VoiceState
  extends BaseClass<VoiceStateEntity>
  implements EnforceCamelCase<VoiceStateEntity>
{
  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get member(): GuildMember | undefined {
    if (!this.data.member) {
      return undefined;
    }

    return GuildMember.from(
      this.client,
      this.data.member as GuildBased<GuildMemberEntity>,
    );
  }

  get sessionId(): string {
    return this.data.session_id;
  }

  get deaf(): boolean {
    return this.data.deaf;
  }

  get mute(): boolean {
    return this.data.mute;
  }

  get selfDeaf(): boolean {
    return this.data.self_deaf;
  }

  get selfMute(): boolean {
    return this.data.self_mute;
  }

  get selfStream(): boolean {
    return Boolean(this.data.self_stream);
  }

  get selfVideo(): boolean {
    return this.data.self_video;
  }

  get suppress(): boolean {
    return this.data.suppress;
  }

  get requestToSpeakTimestamp(): string | null {
    return this.data.request_to_speak_timestamp;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    // Voice states are uniquely identified by the combination of user and guild/channel
    return {
      storeKey: "voiceStates",
      id: this.guildId
        ? `${this.userId}-${this.guildId}`
        : `${this.userId}-${this.channelId}`,
    };
  }
}
