import { IntegrationAccountEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class IntegrationAccount extends BaseClass<IntegrationAccountEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof IntegrationAccountEntity>> = {},
  ) {
    super(client, IntegrationAccountEntity, entity);
  }

  get id(): string {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  toJson(): IntegrationAccountEntity {
    return { ...this.entity };
  }
}

export const IntegrationAccountSchema = z.instanceof(IntegrationAccount);
