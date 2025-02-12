import { IntegrationApplicationEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class IntegrationApplication extends BaseClass<IntegrationApplicationEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof IntegrationApplicationEntity>> = {},
  ) {
    super(client, IntegrationApplicationEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get description(): string {
    return this.entity.description;
  }

  get bot(): User | null {
    return this.entity.bot ? new User(this.client, this.entity.bot) : null;
  }

  toJson(): IntegrationApplicationEntity {
    return { ...this.entity };
  }
}

export const IntegrationApplicationSchema = z.instanceof(
  IntegrationApplication,
);
