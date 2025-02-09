import { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class VoiceServer {
  readonly #data: VoiceServerUpdateEntity;

  constructor(data: Partial<z.input<typeof VoiceServerUpdateEntity>> = {}) {
    try {
      this.#data = VoiceServerUpdateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
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
