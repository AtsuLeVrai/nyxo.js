import { ReadyEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class Ready {
  readonly #data: ReadyEntity;

  constructor(data: ReadyEntity) {
    this.#data = ReadyEntity.parse(data);
  }

  get v(): unknown {
    return this.#data.v;
  }

  get user(): object | null {
    return this.#data.user ? { ...this.#data.user } : null;
  }

  get guilds(): object[] {
    return Array.isArray(this.#data.guilds) ? [...this.#data.guilds] : [];
  }

  get sessionId(): string {
    return this.#data.session_id;
  }

  get resumeGatewayUrl(): string {
    return this.#data.resume_gateway_url;
  }

  get shard(): unknown {
    return this.#data.shard;
  }

  get application(): object | null {
    return this.#data.application ? { ...this.#data.application } : null;
  }

  static fromJson(json: ReadyEntity): Ready {
    return new Ready(json);
  }

  toJson(): ReadyEntity {
    return { ...this.#data };
  }

  clone(): Ready {
    return new Ready(this.toJson());
  }

  validate(): boolean {
    try {
      ReadySchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ReadyEntity>): Ready {
    return new Ready({ ...this.toJson(), ...other });
  }

  equals(other: Ready): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ReadySchema = z.instanceof(Ready);
