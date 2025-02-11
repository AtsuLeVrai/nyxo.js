import { type Snowflake, UnavailableGuildEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class UnavailableGuild extends BaseClass<UnavailableGuildEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof UnavailableGuildEntity>> = {},
  ) {
    super(client, UnavailableGuildEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get unavailable(): true {
    return this.data.unavailable;
  }

  toJson(): UnavailableGuildEntity {
    return { ...this.data };
  }
}

export const UnavailableGuildSchema = z.instanceof(UnavailableGuild);
