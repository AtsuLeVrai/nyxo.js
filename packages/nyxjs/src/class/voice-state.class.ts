import { type Snowflake, VoiceStateEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class VoiceState extends BaseClass<VoiceStateEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof VoiceStateEntity>> = {},
  ) {
    super(client, VoiceStateEntity, data);
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id ?? null;
  }

  get userId(): Snowflake {
    return this.data.user_id;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  get sessionId(): Snowflake {
    return this.data.session_id;
  }

  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  get selfDeaf(): boolean {
    return Boolean(this.data.self_deaf);
  }

  get selfMute(): boolean {
    return Boolean(this.data.self_mute);
  }

  get selfStream(): boolean {
    return Boolean(this.data.self_stream);
  }

  get selfVideo(): boolean {
    return Boolean(this.data.self_video);
  }

  get suppress(): boolean {
    return Boolean(this.data.suppress);
  }

  get requestToSpeakTimestamp(): string | null {
    return this.data.request_to_speak_timestamp ?? null;
  }

  toJson(): VoiceStateEntity {
    return { ...this.data };
  }
}

export const VoiceStateSchema = z.instanceof(VoiceState);
