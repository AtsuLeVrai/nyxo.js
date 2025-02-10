import {
  type Snowflake,
  StageInstanceEntity,
  type StageInstancePrivacyLevel,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class StageInstance {
  readonly #data: StageInstanceEntity;

  constructor(data: Partial<z.input<typeof StageInstanceEntity>> = {}) {
    try {
      this.#data = StageInstanceEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get topic(): string {
    return this.#data.topic;
  }

  get privacyLevel(): StageInstancePrivacyLevel {
    return this.#data.privacy_level;
  }

  get discoverableDisabled(): boolean {
    return Boolean(this.#data.discoverable_disabled);
  }

  get guildScheduledEventId(): Snowflake | null {
    return this.#data.guild_scheduled_event_id ?? null;
  }

  toJson(): StageInstanceEntity {
    return { ...this.#data };
  }

  clone(): StageInstance {
    return new StageInstance(this.toJson());
  }

  validate(): boolean {
    try {
      StageInstanceSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<StageInstanceEntity>): StageInstance {
    return new StageInstance({ ...this.toJson(), ...other });
  }

  equals(other: StageInstance): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const StageInstanceSchema = z.instanceof(StageInstance);
