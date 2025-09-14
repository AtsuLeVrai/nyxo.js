import { BaseBuilder } from "../../bases/index.js";
import type { InteractionCallbackModalEntity } from "../interaction/index.js";
import {
  ComponentType,
  type LegacyActionRowEntity,
  type StringSelectMenuEntity,
  type TextInputEntity,
} from "./components.entity.js";

export class ModalBuilder extends BaseBuilder<InteractionCallbackModalEntity> {
  constructor(data?: Partial<InteractionCallbackModalEntity>) {
    super({
      components: [],
      ...data,
    });
  }

  static from(data: InteractionCallbackModalEntity): ModalBuilder {
    return new ModalBuilder(data);
  }

  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Modal custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  setTitle(title: string): this {
    if (title.length > 45) {
      throw new Error("Modal title cannot exceed 45 characters");
    }
    return this.set("title", title);
  }

  addActionRow(actionRow: LegacyActionRowEntity): this {
    return this.pushToArray("components", actionRow);
  }

  addActionRows(...actionRows: LegacyActionRowEntity[]): this {
    for (const actionRow of actionRows) {
      this.addActionRow(actionRow);
    }
    return this;
  }

  setActionRows(actionRows: LegacyActionRowEntity[]): this {
    if (actionRows.length > 5) {
      throw new Error("Modal cannot have more than 5 action rows");
    }
    return this.setArray("components", actionRows);
  }

  addTextInput(textInput: TextInputEntity): this {
    const actionRow: LegacyActionRowEntity = {
      type: ComponentType.ActionRow,
      components: [textInput as any],
    };
    return this.addActionRow(actionRow);
  }

  addSelectMenu(selectMenu: StringSelectMenuEntity): this {
    const actionRow: LegacyActionRowEntity = {
      type: ComponentType.ActionRow,
      components: [selectMenu],
    };
    return this.addActionRow(actionRow);
  }

  addLabeledTextInput(textInput: TextInputEntity): this {
    // Note: Labels are conceptual - in practice, text inputs are still wrapped in ActionRows
    // The label and description would be used by Discord's rendering system
    return this.addTextInput(textInput);
  }

  addLabeledSelectMenu(selectMenu: StringSelectMenuEntity): this {
    // Note: Labels are conceptual - in practice, select menus are still wrapped in ActionRows
    // The label and description would be used by Discord's rendering system
    return this.addSelectMenu(selectMenu);
  }

  createSimpleTextModal(title: string, customId: string, textInput: TextInputEntity): this {
    return this.setTitle(title).setCustomId(customId).addTextInput(textInput);
  }

  createSurveyModal(title: string, customId: string, inputs: TextInputEntity[]): this {
    this.setTitle(title).setCustomId(customId);
    for (const input of inputs) {
      this.addTextInput(input);
    }
    return this;
  }

  protected validate(): void {
    const data = this.rawData;

    if (!data.custom_id) {
      throw new Error("Modal must have a custom_id");
    }

    if (!data.title) {
      throw new Error("Modal must have a title");
    }

    if (!data.components || data.components.length === 0) {
      throw new Error("Modal must have at least one component");
    }

    if (data.components.length > 5) {
      throw new Error("Modal cannot have more than 5 action rows");
    }

    // Validate each ActionRow
    for (const component of data.components) {
      if (component.type !== ComponentType.ActionRow) {
        throw new Error("Modal components must be ActionRow components");
      }

      if (!component.components || component.components.length === 0) {
        throw new Error("Modal ActionRow must contain at least one component");
      }

      // Each ActionRow should contain exactly one input component in modals
      if (component.components.length > 1) {
        throw new Error("Modal ActionRow should contain exactly one input component");
      }

      const inputComponent = component.components[0];
      if (
        inputComponent.type !== ComponentType.TextInput &&
        inputComponent.type !== ComponentType.StringSelect
      ) {
        throw new Error("Modal input components must be TextInput or StringSelect");
      }
    }
  }
}
