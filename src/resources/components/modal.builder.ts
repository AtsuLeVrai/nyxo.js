import { BaseBuilder } from "../../bases/index.js";
import type { InteractionCallbackModalEntity } from "../interaction/index.js";
import {
  ComponentType,
  type LegacyActionRowEntity,
  type StringSelectMenuEntity,
  type TextInputEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for Discord modal components with Label entities.
 * Creates interactive forms for user input collection in Discord applications.
 * @see {@link https://discord.com/developers/docs/components/reference#modal}
 */
export class ModalBuilder extends BaseBuilder<InteractionCallbackModalEntity> {
  constructor(data?: Partial<InteractionCallbackModalEntity>) {
    super({
      components: [],
      ...data,
    });
  }

  /**
   * @description Creates a modal builder from existing data.
   * @param data - Existing modal entity data
   * @returns New modal builder instance
   */
  static from(data: InteractionCallbackModalEntity): ModalBuilder {
    return new ModalBuilder(data);
  }

  /**
   * @description Sets the developer-defined identifier for the modal.
   * @param customId - Modal identifier (max 100 characters)
   * @returns This builder instance for method chaining
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Modal custom ID cannot exceed 100 characters");
    }
    return this.set("custom_id", customId);
  }

  /**
   * @description Sets the modal title displayed in the popup header.
   * @param title - Modal title (max 45 characters)
   * @returns This builder instance for method chaining
   */
  setTitle(title: string): this {
    if (title.length > 45) {
      throw new Error("Modal title cannot exceed 45 characters");
    }
    return this.set("title", title);
  }

  /**
   * @description Adds a legacy ActionRow component to the modal.
   * @param actionRow - ActionRow containing input components
   * @returns This builder instance for method chaining
   */
  addActionRow(actionRow: LegacyActionRowEntity): this {
    return this.pushToArray("components", actionRow);
  }

  /**
   * @description Adds multiple legacy ActionRow components to the modal.
   * @param actionRows - ActionRow components to add
   * @returns This builder instance for method chaining
   */
  addActionRows(...actionRows: LegacyActionRowEntity[]): this {
    for (const actionRow of actionRows) {
      this.addActionRow(actionRow);
    }
    return this;
  }

  /**
   * @description Sets all ActionRow components, replacing existing ones.
   * @param actionRows - ActionRow components (max 5)
   * @returns This builder instance for method chaining
   */
  setActionRows(actionRows: LegacyActionRowEntity[]): this {
    if (actionRows.length > 5) {
      throw new Error("Modal cannot have more than 5 action rows");
    }
    return this.setArray("components", actionRows);
  }

  /**
   * @description Creates a text input wrapped in an ActionRow and adds it to the modal.
   * @param textInput - Text input component
   * @returns This builder instance for method chaining
   */
  addTextInput(textInput: TextInputEntity): this {
    const actionRow: LegacyActionRowEntity = {
      type: ComponentType.ActionRow,
      components: [textInput as any],
    };
    return this.addActionRow(actionRow);
  }

  /**
   * @description Creates a select menu wrapped in an ActionRow and adds it to the modal.
   * @param selectMenu - String select menu component
   * @returns This builder instance for method chaining
   */
  addSelectMenu(selectMenu: StringSelectMenuEntity): this {
    const actionRow: LegacyActionRowEntity = {
      type: ComponentType.ActionRow,
      components: [selectMenu],
    };
    return this.addActionRow(actionRow);
  }

  /**
   * @description Creates a Label component wrapping a text input.
   * @param textInput - Text input component
   * @returns This builder instance for method chaining
   */
  addLabeledTextInput(textInput: TextInputEntity): this {
    // Note: Labels are conceptual - in practice, text inputs are still wrapped in ActionRows
    // The label and description would be used by Discord's rendering system
    return this.addTextInput(textInput);
  }

  /**
   * @description Creates a Label component wrapping a select menu.
   * @param selectMenu - String select menu component
   * @returns This builder instance for method chaining
   */
  addLabeledSelectMenu(selectMenu: StringSelectMenuEntity): this {
    // Note: Labels are conceptual - in practice, select menus are still wrapped in ActionRows
    // The label and description would be used by Discord's rendering system
    return this.addSelectMenu(selectMenu);
  }

  /**
   * @description Creates a simple text input modal with title and single input.
   * @param title - Modal title
   * @param customId - Modal custom ID
   * @param textInput - Text input component
   * @returns This builder instance for method chaining
   */
  createSimpleTextModal(title: string, customId: string, textInput: TextInputEntity): this {
    return this.setTitle(title).setCustomId(customId).addTextInput(textInput);
  }

  /**
   * @description Creates a survey-style modal with multiple inputs.
   * @param title - Modal title
   * @param customId - Modal custom ID
   * @param inputs - Array of text input components
   * @returns This builder instance for method chaining
   */
  createSurveyModal(title: string, customId: string, inputs: TextInputEntity[]): this {
    this.setTitle(title).setCustomId(customId);
    for (const input of inputs) {
      this.addTextInput(input);
    }
    return this;
  }

  /**
   * @description Validates modal data before building.
   * @throws {Error} When modal configuration is invalid
   */
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
