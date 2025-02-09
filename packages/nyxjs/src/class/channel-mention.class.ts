import { ChannelMentionEntity } from "@nyxjs/core";
import { z } from "zod";

export class ChannelMention {
  readonly #data: ChannelMentionEntity;

  constructor(data: ChannelMentionEntity) {
    this.#data = ChannelMentionEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get name(): string {
    return this.#data.name;
  }

  static fromJson(json: ChannelMentionEntity): ChannelMention {
    return new ChannelMention(json);
  }

  toJson(): ChannelMentionEntity {
    return { ...this.#data };
  }

  clone(): ChannelMention {
    return new ChannelMention(this.toJson());
  }

  validate(): boolean {
    try {
      ChannelMentionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ChannelMentionEntity>): ChannelMention {
    return new ChannelMention({ ...this.toJson(), ...other });
  }

  equals(other: ChannelMention): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ChannelMentionSchema = z.instanceof(ChannelMention);
