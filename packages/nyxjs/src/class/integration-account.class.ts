import { IntegrationAccountEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class IntegrationAccount extends BaseClass<IntegrationAccountEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof IntegrationAccountEntity>> = {},
  ) {
    super(client, IntegrationAccountEntity, data);
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  toJson(): IntegrationAccountEntity {
    return { ...this.data };
  }
}

export const IntegrationAccountSchema = z.instanceof(IntegrationAccount);
