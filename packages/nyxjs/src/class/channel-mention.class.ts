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
    data: Partial<z.input<typeof ChannelMentionEntity>> = {},
  ) {
    super(client, ChannelMentionEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get type(): ChannelType {
    return this.data.type;
  }

  get name(): string {
    return this.data.name;
  }

  toJson(): ChannelMentionEntity {
    return { ...this.data };
  }
}

export const ChannelMentionSchema = z.instanceof(ChannelMention);
