import { ReactionCountDetailsEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ReactionCountDetails extends BaseClass<ReactionCountDetailsEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ReactionCountDetailsEntity>> = {},
  ) {
    super(client, ReactionCountDetailsEntity, entity);
  }

  get burst(): number {
    return this.entity.burst;
  }

  get normal(): number {
    return this.entity.normal;
  }

  toJson(): ReactionCountDetailsEntity {
    return { ...this.entity };
  }
}

export const ReactionCountDetailsSchema = z.instanceof(ReactionCountDetails);
