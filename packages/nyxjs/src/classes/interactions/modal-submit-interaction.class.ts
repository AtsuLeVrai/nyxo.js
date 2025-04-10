import type {
  ActionRowEntity,
  AnyInteractionEntity,
  ModalSubmitInteractionDataEntity,
} from "@nyxjs/core";
import type { EnforceCamelCase } from "../../types/index.js";
import { Interaction } from "./interaction.class.js";

export class ModalSubmitInteraction<
    T extends AnyInteractionEntity & {
      data: ModalSubmitInteractionDataEntity;
    } = AnyInteractionEntity & {
      data: ModalSubmitInteractionDataEntity;
    },
  >
  extends Interaction<T>
  implements
    EnforceCamelCase<
      AnyInteractionEntity & {
        data: ModalSubmitInteractionDataEntity;
      }
    >
{
  get modalData(): ModalSubmitInteractionDataEntity {
    return this.interactionData as ModalSubmitInteractionDataEntity;
  }

  get customId(): string {
    return this.modalData.custom_id;
  }

  get components(): ActionRowEntity[] {
    return this.modalData.components;
  }

  getField(customId: string): string | undefined {
    if (!this.components) {
      return undefined;
    }

    for (const row of this.components) {
      for (const component of row.components) {
        if (component.custom_id === customId && "value" in component) {
          return component.value;
        }
      }
    }

    return undefined;
  }
}
