import type { Snowflake } from "@nyxjs/core";
import { ThreadListSyncEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { type AnyThreadChannel, resolveThreadChannel } from "../utils/index.js";
import { GuildMember } from "./guild-member.class.js";

export class ThreadListSync {
  readonly #data: ThreadListSyncEntity;

  constructor(data: Partial<z.input<typeof ThreadListSyncEntity>> = {}) {
    try {
      this.#data = ThreadListSyncEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get channelIds(): Snowflake[] {
    return Array.isArray(this.#data.channel_ids)
      ? [...this.#data.channel_ids]
      : [];
  }

  get threads(): AnyThreadChannel[] {
    return Array.isArray(this.#data.threads)
      ? this.#data.threads.map((thread) => resolveThreadChannel(thread))
      : [];
  }

  get members(): GuildMember[] {
    return Array.isArray(this.#data.members)
      ? this.#data.members.map((member) => new GuildMember(member))
      : [];
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
