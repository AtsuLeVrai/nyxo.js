import { BaseBuilder } from "../../bases/index.js";
import {
  type ButtonEntity,
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
  type ThumbnailEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for Discord section components in Components v2.
 * Combines text content with visual accessories for enhanced message layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#section}
 */
export class SectionBuilder extends BaseBuilder<SectionEntity> {
  constructor(data?: Partial<SectionEntity>) {
    super({
      type: ComponentType.Section,
      components: [],
      ...data,
    });
  }

  /**
   * @description Creates a section builder from existing data.
   * @param data - Existing section entity data
   * @returns New section builder instance
   */
  static from(data: SectionEntity): SectionBuilder {
    return new SectionBuilder(data);
  }

  /**
   * @description Adds a text display component to the section.
   * @param textDisplay - Text display component to add
   * @returns This builder instance for method chaining
   */
  addTextDisplay(textDisplay: TextDisplayEntity): this {
    return this.pushToArray("components", textDisplay);
  }

  /**
   * @description Adds multiple text display components to the section.
   * @param textDisplays - Text display components to add
   * @returns This builder instance for method chaining
   */
  addTextDisplays(...textDisplays: TextDisplayEntity[]): this {
    for (const textDisplay of textDisplays) {
      this.addTextDisplay(textDisplay);
    }
    return this;
  }

  /**
   * @description Sets all text display components, replacing existing ones.
   * @param textDisplays - Text display components (1-3 components)
   * @returns This builder instance for method chaining
   */
  setTextDisplays(textDisplays: TextDisplayEntity[]): this {
    if (textDisplays.length > 3) {
      throw new Error("Section cannot have more than 3 text display components");
    }
    return this.setArray("components", textDisplays);
  }

  /**
   * @description Sets the accessory component (thumbnail or button).
   * @param accessory - Accessory component providing visual context
   * @returns This builder instance for method chaining
   */
  setAccessory(accessory: ThumbnailEntity | ButtonEntity): this {
    return this.set("accessory", accessory);
  }

  /**
   * @description Sets a thumbnail as the accessory component.
   * @param thumbnail - Thumbnail component
   * @returns This builder instance for method chaining
   */
  setThumbnailAccessory(thumbnail: ThumbnailEntity): this {
    return this.setAccessory(thumbnail);
  }

  /**
   * @description Sets a button as the accessory component.
   * @param button - Button component
   * @returns This builder instance for method chaining
   */
  setButtonAccessory(button: ButtonEntity): this {
    return this.setAccessory(button);
  }

  /**
   * @description Sets the unique component identifier within the message.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Creates a section with single text display and thumbnail accessory.
   * @param textDisplay - Text display component
   * @param thumbnail - Thumbnail accessory
   * @returns This builder instance for method chaining
   */
  setSimpleTextWithThumbnail(textDisplay: TextDisplayEntity, thumbnail: ThumbnailEntity): this {
    return this.setTextDisplays([textDisplay]).setThumbnailAccessory(thumbnail);
  }

  /**
   * @description Creates a section with single text display and button accessory.
   * @param textDisplay - Text display component
   * @param button - Button accessory
   * @returns This builder instance for method chaining
   */
  setSimpleTextWithButton(textDisplay: TextDisplayEntity, button: ButtonEntity): this {
    return this.setTextDisplays([textDisplay]).setButtonAccessory(button);
  }

  /**
   * @description Creates a section with multiple text displays and thumbnail accessory.
   * @param textDisplays - Text display components (1-3)
   * @param thumbnail - Thumbnail accessory
   * @returns This builder instance for method chaining
   */
  setMultiTextWithThumbnail(textDisplays: TextDisplayEntity[], thumbnail: ThumbnailEntity): this {
    return this.setTextDisplays(textDisplays).setThumbnailAccessory(thumbnail);
  }

  /**
   * @description Creates a section with multiple text displays and button accessory.
   * @param textDisplays - Text display components (1-3)
   * @param button - Button accessory
   * @returns This builder instance for method chaining
   */
  setMultiTextWithButton(textDisplays: TextDisplayEntity[], button: ButtonEntity): this {
    return this.setTextDisplays(textDisplays).setButtonAccessory(button);
  }

  /**
   * @description Validates section data before building.
   * @throws {Error} When section configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;

    if (!data.components || data.components.length === 0) {
      throw new Error("Section must have at least one text display component");
    }

    if (data.components.length > 3) {
      throw new Error("Section cannot have more than 3 text display components");
    }

    if (!data.accessory) {
      throw new Error("Section must have an accessory component");
    }

    // Validate that all components are text displays
    for (const component of data.components) {
      if (component.type !== ComponentType.TextDisplay) {
        throw new Error("Section components must be TextDisplay components");
      }
    }

    // Validate accessory type
    if (
      data.accessory.type !== ComponentType.Thumbnail &&
      data.accessory.type !== ComponentType.Button
    ) {
      throw new Error("Section accessory must be a Thumbnail or Button component");
    }
  }
}
