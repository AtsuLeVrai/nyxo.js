import { type Snowflake, VoiceStateEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { GuildMember } from "./guild-member.class.js";

export class VoiceState {
  readonly #data: VoiceStateEntity;

  constructor(data: Partial<z.input<typeof VoiceStateEntity>> = {}) {
    try {
      this.#data = VoiceStateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.#data.channel_id ?? null;
  }

  get userId(): Snowflake {
    return this.#data.user_id;
  }

  get member(): GuildMember | null {
    return this.#data.member ? new GuildMember(this.#data.member) : null;
  }

  get sessionId(): Snowflake {
    return this.#data.session_id;
  }

  get deaf(): boolean {
    return Boolean(this.#data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.#data.mute);
  }

  get selfDeaf(): boolean {
    return Boolean(this.#data.self_deaf);
  }

  get selfMute(): boolean {
    return Boolean(this.#data.self_mute);
  }

  get selfStream(): boolean {
    return Boolean(this.#data.self_stream);
  }

  get selfVideo(): boolean {
    return Boolean(this.#data.self_video);
  }

  get suppress(): boolean {
    return Boolean(this.#data.suppress);
  }

  get requestToSpeakTimestamp(): string | null {
    return this.#data.request_to_speak_timestamp ?? null;
  }

  toJson(): VoiceStateEntity {
    return { ...this.#data };
  }

  clone(): VoiceState {
    return new VoiceState(this.toJson());
  }

  validate(): boolean {
    try {
      VoiceStateSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<VoiceStateEntity>): VoiceState {
    return new VoiceState({ ...this.toJson(), ...other });
  }

  equals(other: VoiceState): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const VoiceStateSchema = z.instanceof(VoiceState);
