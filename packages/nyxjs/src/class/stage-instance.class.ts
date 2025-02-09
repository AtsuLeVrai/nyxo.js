import { StageInstanceEntity } from "@nyxjs/core";
import { z } from "zod";

export class StageInstance {
  readonly #data: StageInstanceEntity;

  constructor(data: StageInstanceEntity) {
    this.#data = StageInstanceEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get channelId(): unknown {
    return this.#data.channel_id;
  }

  get topic(): string {
    return this.#data.topic;
  }

  get privacyLevel(): unknown {
    return this.#data.privacy_level;
  }

  get discoverableDisabled(): boolean {
    return Boolean(this.#data.discoverable_disabled);
  }

  get guildScheduledEventId(): unknown | null {
    return this.#data.guild_scheduled_event_id ?? null;
  }

  static fromJson(json: StageInstanceEntity): StageInstance {
    return new StageInstance(json);
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
