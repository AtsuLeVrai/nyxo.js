import {
  ChannelMentionEntity,
  type ChannelType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ChannelMention extends BaseClass<ChannelMentionEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ChannelMentionEntity>> = {},
  ) {
    super(client, ChannelMentionEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get guildId(): Snowflake {
    return this.entity.guild_id;
  }

  get type(): ChannelType {
    return this.entity.type;
  }

  get name(): string {
    return this.entity.name;
  }

  toJson(): ChannelMentionEntity {
    return { ...this.entity };
  }
}

export const ChannelMentionSchema = z.instanceof(ChannelMention);
