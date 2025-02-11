import { IntegrationApplicationEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class IntegrationApplication extends BaseClass<IntegrationApplicationEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof IntegrationApplicationEntity>> = {},
  ) {
    super(client, IntegrationApplicationEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get description(): string {
    return this.data.description;
  }

  get bot(): User | null {
    return this.data.bot ? new User(this.client, this.data.bot) : null;
  }

  toJson(): IntegrationApplicationEntity {
    return { ...this.data };
  }
}

export const IntegrationApplicationSchema = z.instanceof(
  IntegrationApplication,
);
