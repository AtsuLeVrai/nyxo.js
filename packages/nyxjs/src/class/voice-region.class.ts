import { VoiceRegionEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class VoiceRegion {
  readonly #data: VoiceRegionEntity;

  constructor(data: Partial<z.input<typeof VoiceRegionEntity>> = {}) {
    try {
      this.#data = VoiceRegionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get optimal(): boolean {
    return Boolean(this.#data.optimal);
  }

  get deprecated(): boolean {
    return Boolean(this.#data.deprecated);
  }

  get custom(): boolean {
    return Boolean(this.#data.custom);
  }

  static fromJson(json: VoiceRegionEntity): VoiceRegion {
    return new VoiceRegion(json);
  }

  toJson(): VoiceRegionEntity {
    return { ...this.#data };
  }

  clone(): VoiceRegion {
    return new VoiceRegion(this.toJson());
  }

  validate(): boolean {
    try {
      VoiceRegionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<VoiceRegionEntity>): VoiceRegion {
    return new VoiceRegion({ ...this.toJson(), ...other });
  }

  equals(other: VoiceRegion): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const VoiceRegionSchema = z.instanceof(VoiceRegion);
