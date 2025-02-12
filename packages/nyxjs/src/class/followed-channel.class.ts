import { FollowedChannelEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class FollowedChannel extends BaseClass<FollowedChannelEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof FollowedChannelEntity>> = {},
  ) {
    super(client, FollowedChannelEntity, entity);
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get webhookId(): Snowflake {
    return this.entity.webhook_id;
  }

  toJson(): FollowedChannelEntity {
    return { ...this.entity };
  }
}

export const FollowedChannelSchema = z.instanceof(FollowedChannel);
