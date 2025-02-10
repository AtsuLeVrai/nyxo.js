import { FollowedChannelEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class FollowedChannel {
  readonly #data: FollowedChannelEntity;

  constructor(data: Partial<z.input<typeof FollowedChannelEntity>> = {}) {
    try {
      this.#data = FollowedChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get webhookId(): Snowflake {
    return this.#data.webhook_id;
  }

  toJson(): FollowedChannelEntity {
    return { ...this.#data };
  }

  clone(): FollowedChannel {
    return new FollowedChannel(this.toJson());
  }

  validate(): boolean {
    try {
      FollowedChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<FollowedChannelEntity>): FollowedChannel {
    return new FollowedChannel({ ...this.toJson(), ...other });
  }

  equals(other: FollowedChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const FollowedChannelSchema = z.instanceof(FollowedChannel);
