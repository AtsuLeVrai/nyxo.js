import { ReactionCountDetailsEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ReactionCountDetails extends BaseClass<ReactionCountDetailsEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ReactionCountDetailsEntity>> = {},
  ) {
    super(client, ReactionCountDetailsEntity, data);
  }

  get burst(): number {
    return this.data.burst;
  }

  get normal(): number {
    return this.data.normal;
  }

  toJson(): ReactionCountDetailsEntity {
    return { ...this.data };
  }
}

export const ReactionCountDetailsSchema = z.instanceof(ReactionCountDetails);
