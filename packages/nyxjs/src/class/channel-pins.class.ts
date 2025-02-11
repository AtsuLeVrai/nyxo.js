import type { Snowflake } from "@nyxjs/core";
import { ChannelPinsUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ChannelPins extends BaseClass<ChannelPinsUpdateEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ChannelPinsUpdateEntity>> = {},
  ) {
    super(client, ChannelPinsUpdateEntity, data);
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  toJson(): ChannelPinsUpdateEntity {
    return { ...this.data };
  }
}

export const ChannelPinsSchema = z.instanceof(ChannelPins);
