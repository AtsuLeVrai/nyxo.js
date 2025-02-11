import {
  ActionRowEntity,
  type ComponentEntity,
  type ComponentType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ActionRow extends BaseClass<ActionRowEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ActionRowEntity>> = {},
  ) {
    super(client, ActionRowEntity as z.ZodSchema, data as ActionRowEntity);
  }

  get type(): ComponentType.ActionRow {
    return this.data.type;
  }

  get components(): ComponentEntity[] {
    return [...this.data.components];
  }

  toJson(): ActionRowEntity {
    return { ...this.data };
  }
}

export const ActionRowSchema = z.instanceof(ActionRow);
