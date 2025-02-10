import type { ApiVersion, ApplicationEntity } from "@nyxjs/core";
import { ReadyEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Application } from "./application.class.js";
import { UnavailableGuild } from "./unavailable-guild.class.js";
import { User } from "./user.class.js";

export class Ready {
  readonly #data: ReadyEntity;

  constructor(data: Partial<z.input<typeof ReadyEntity>> = {}) {
    try {
      this.#data = ReadyEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get v(): ApiVersion {
    return this.#data.v;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get guilds(): UnavailableGuild[] {
    return Array.isArray(this.#data.guilds)
      ? this.#data.guilds.map((guild) => new UnavailableGuild(guild))
      : [];
  }

  get sessionId(): string {
    return this.#data.session_id;
  }

  get resumeGatewayUrl(): string {
    return this.#data.resume_gateway_url;
  }

  get shard(): [number, number] | null {
    return this.#data.shard ?? null;
  }

  get application(): Application | null {
    return this.#data.application
      ? new Application(this.#data.application as ApplicationEntity)
      : null;
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
