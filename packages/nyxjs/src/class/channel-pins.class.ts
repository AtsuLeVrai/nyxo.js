import type { Snowflake } from "@nyxjs/core";
import { ChannelPinsUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ChannelPins extends BaseClass<ChannelPinsUpdateEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ChannelPinsUpdateEntity>> = {},
  ) {
    super(client, ChannelPinsUpdateEntity, entity);
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
  }

  toJson(): ChannelPinsUpdateEntity {
    return { ...this.entity };
  }
}

export const ChannelPinsSchema = z.instanceof(ChannelPins);
