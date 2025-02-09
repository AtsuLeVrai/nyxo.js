import { ThreadListSyncEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class ThreadListSync {
  readonly #data: ThreadListSyncEntity;

  constructor(data: ThreadListSyncEntity) {
    this.#data = ThreadListSyncEntity.parse(data);
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get channelIds(): unknown[] | null {
    return this.#data.channel_ids ?? null;
  }

  get threads(): unknown[] {
    return Array.isArray(this.#data.threads) ? [...this.#data.threads] : [];
  }

  get members(): object[] {
    return Array.isArray(this.#data.members) ? [...this.#data.members] : [];
  }

  static fromJson(json: ThreadListSyncEntity): ThreadListSync {
    return new ThreadListSync(json);
  }

  toJson(): ThreadListSyncEntity {
    return { ...this.#data };
  }

  clone(): ThreadListSync {
    return new ThreadListSync(this.toJson());
  }

  validate(): boolean {
    try {
      ThreadListSyncSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ThreadListSyncEntity>): ThreadListSync {
    return new ThreadListSync({ ...this.toJson(), ...other });
  }

  equals(other: ThreadListSync): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ThreadListSyncSchema = z.instanceof(ThreadListSync);
