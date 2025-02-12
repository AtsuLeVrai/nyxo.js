import { VoiceRegionEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class VoiceRegion extends BaseClass<VoiceRegionEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof VoiceRegionEntity>> = {},
  ) {
    super(client, VoiceRegionEntity, entity);
  }

  get id(): string {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get optimal(): boolean {
    return Boolean(this.entity.optimal);
  }

  get deprecated(): boolean {
    return Boolean(this.entity.deprecated);
  }

  get custom(): boolean {
    return Boolean(this.entity.custom);
  }

  toJson(): VoiceRegionEntity {
    return { ...this.entity };
  }
}

export const VoiceRegionSchema = z.instanceof(VoiceRegion);
