import { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class VoiceServer {
  readonly #data: VoiceServerUpdateEntity;

  constructor(data: VoiceServerUpdateEntity) {
    this.#data = VoiceServerUpdateEntity.parse(data);
  }

  get token(): string {
    return this.#data.token;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get endpoint(): string | null {
    return this.#data.endpoint ?? null;
  }

  static fromJson(json: VoiceServerUpdateEntity): VoiceServer {
    return new VoiceServer(json);
  }

  toJson(): VoiceServerUpdateEntity {
    return { ...this.#data };
  }

  clone(): VoiceServer {
    return new VoiceServer(this.toJson());
  }

  validate(): boolean {
    try {
      VoiceServerSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<VoiceServerUpdateEntity>): VoiceServer {
    return new VoiceServer({ ...this.toJson(), ...other });
  }

  equals(other: VoiceServer): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const VoiceServerSchema = z.instanceof(VoiceServer);
