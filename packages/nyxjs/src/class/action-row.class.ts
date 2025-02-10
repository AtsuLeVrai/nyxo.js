import {
  ActionRowEntity,
  type ComponentEntity,
  ComponentType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class ActionRow {
  readonly #data: ActionRowEntity;

  constructor(data: Partial<z.input<typeof ActionRowEntity>> = {}) {
    try {
      this.#data = ActionRowEntity.parse({
        type: ComponentType.ActionRow,
        ...data,
      });
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get type(): ComponentType.ActionRow {
    return this.#data.type;
  }

  get components(): ComponentEntity[] {
    return [...this.#data.components];
  }

  toJson(): ActionRowEntity {
    return { ...this.#data };
  }

  clone(): ActionRow {
    return new ActionRow(this.toJson());
  }

  validate(): boolean {
    try {
      ActionRowEntity.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ActionRowEntity>): ActionRow {
    return new ActionRow({ ...this.toJson(), ...other });
  }

  equals(other: ActionRow): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ActionRowSchema = z.instanceof(ActionRow);
