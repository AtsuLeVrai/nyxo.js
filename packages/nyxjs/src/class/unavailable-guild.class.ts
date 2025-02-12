import { type Snowflake, UnavailableGuildEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class UnavailableGuild extends BaseClass<UnavailableGuildEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof UnavailableGuildEntity>> = {},
  ) {
    super(client, UnavailableGuildEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get unavailable(): true {
    return this.entity.unavailable;
  }

  toJson(): UnavailableGuildEntity {
    return { ...this.entity };
  }
}

export const UnavailableGuildSchema = z.instanceof(UnavailableGuild);
