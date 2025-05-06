import type { EmojiEntity, Snowflake } from "@nyxojs/core";
import type {
  VoiceChannelEffectSendAnimationType,
  VoiceChannelEffectSendEntity,
} from "@nyxojs/gateway";
import type { ObjectToCamel } from "ts-case-convert";
import { BaseClass } from "../bases/index.js";
import type { Enforce, GuildBased } from "../types/index.js";
import { Emoji } from "./emoji.class.js";

export class VoiceChannelEffectSend
  extends BaseClass<VoiceChannelEffectSendEntity>
  implements Enforce<ObjectToCamel<VoiceChannelEffectSendEntity>>
{
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

    return new Emoji(this.client, this.data.emoji as GuildBased<EmojiEntity>);
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
}
