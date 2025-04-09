import type {
  EmojiEntity,
  GuildMemberEntity,
  Snowflake,
  VoiceStateEntity,
} from "@nyxjs/core";
import type {
  VoiceChannelEffectSendAnimationType,
  VoiceChannelEffectSendEntity,
  VoiceServerUpdateEntity,
} from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import type { GuildBased } from "../types/index.js";
import { Emoji } from "./emoji.class.js";
import { GuildMember } from "./guild.class.js";

export class VoiceState extends BaseClass<VoiceStateEntity> {
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

export class VoiceChannelEffectSend extends BaseClass<VoiceChannelEffectSendEntity> {
  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get emoji(): Emoji | null | undefined {
    if (!this.data.emoji) {
      return null;
    }

    return Emoji.from(this.client, this.data.emoji as EmojiEntity);
  }

  get animationType(): VoiceChannelEffectSendAnimationType | undefined {
    return this.data.animation_type;
  }

  get animationId(): number | undefined {
    return this.data.animation_id;
  }

  get soundId(): Snowflake | number | undefined {
    return this.data.sound_id;
  }

  get soundVolume(): number | undefined {
    return this.data.sound_volume;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class VoiceServer extends BaseClass<VoiceServerUpdateEntity> {
  get token(): string {
    return this.data.token;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get endpoint(): string | null {
    return this.data.endpoint;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "voiceServers",
      id: this.guildId,
    };
  }
}
