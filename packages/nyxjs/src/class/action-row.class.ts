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
    entity: Partial<z.input<typeof ActionRowEntity>> = {},
  ) {
    super(client, ActionRowEntity as z.ZodSchema, entity as ActionRowEntity);
  }

  get type(): ComponentType.ActionRow {
    return this.entity.type;
  }

  get components(): ComponentEntity[] {
    return [...this.entity.components];
  }

  toJson(): ActionRowEntity {
    return { ...this.entity };
  }
}

export const ActionRowSchema = z.instanceof(ActionRow);
