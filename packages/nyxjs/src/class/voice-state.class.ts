import { VoiceStateEntity } from "@nyxjs/core";
import { z } from "zod";

export class VoiceState {
  readonly #data: VoiceStateEntity;

  constructor(data: VoiceStateEntity) {
    this.#data = VoiceStateEntity.parse(data);
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get channelId(): unknown | null {
    return this.#data.channel_id ?? null;
  }

  get userId(): unknown {
    return this.#data.user_id;
  }

  get member(): object | null {
    return this.#data.member ?? null;
  }

  get sessionId(): unknown {
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

  get selfStream(): boolean | null {
    return this.#data.self_stream ?? null;
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

  static fromJson(json: VoiceStateEntity): VoiceState {
    return new VoiceState(json);
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
