import { FollowedChannelEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class FollowedChannel extends BaseClass<FollowedChannelEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof FollowedChannelEntity>> = {},
  ) {
    super(client, FollowedChannelEntity, data);
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get webhookId(): Snowflake {
    return this.data.webhook_id;
  }

  toJson(): FollowedChannelEntity {
    return { ...this.data };
  }
}

export const FollowedChannelSchema = z.instanceof(FollowedChannel);
