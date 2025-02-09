import { ActivityEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Activity {
  readonly #data: ActivityEntity;

  constructor(data: Partial<z.input<typeof ActivityEntity>> = {}) {
    try {
      this.#data = ActivityEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get name(): string {
    return this.#data.name;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get url(): string | null {
    return this.#data.url ?? null;
  }

  get createdAt(): number {
    return this.#data.created_at;
  }

  get timestamps(): object | null {
    return this.#data.timestamps ?? null;
  }

  get applicationId(): unknown | null {
    return this.#data.application_id ?? null;
  }

  get details(): string | null {
    return this.#data.details ?? null;
  }

  get state(): string | null {
    return this.#data.state ?? null;
  }

  get emoji(): object | null {
    return this.#data.emoji ?? null;
  }

  get party(): object | null {
    return this.#data.party ?? null;
  }

  get assets(): object | null {
    return this.#data.assets ?? null;
  }

  get secrets(): object | null {
    return this.#data.secrets ?? null;
  }

  get instance(): boolean | null {
    return this.#data.instance ?? null;
  }

  get flags(): unknown | null {
    return this.#data.flags ?? null;
  }

  get buttons(): object[] | null {
    return this.#data.buttons ?? null;
  }

  static fromJson(json: ActivityEntity): Activity {
    return new Activity(json);
  }

  toJson(): ActivityEntity {
    return { ...this.#data };
  }

  clone(): Activity {
    return new Activity(this.toJson());
  }

  validate(): boolean {
    try {
      ActivitySchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ActivityEntity>): Activity {
    return new Activity({ ...this.toJson(), ...other });
  }

  equals(other: Activity): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ActivitySchema = z.instanceof(Activity);
