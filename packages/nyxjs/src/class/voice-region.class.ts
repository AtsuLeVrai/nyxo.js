import { VoiceRegionEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class VoiceRegion extends BaseClass<VoiceRegionEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof VoiceRegionEntity>> = {},
  ) {
    super(client, VoiceRegionEntity, data);
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get optimal(): boolean {
    return Boolean(this.data.optimal);
  }

  get deprecated(): boolean {
    return Boolean(this.data.deprecated);
  }

  get custom(): boolean {
    return Boolean(this.data.custom);
  }

  toJson(): VoiceRegionEntity {
    return { ...this.data };
  }
}

export const VoiceRegionSchema = z.instanceof(VoiceRegion);
