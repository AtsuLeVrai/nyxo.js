import { BaseBuilder } from "../../bases/index.js";
import {
  type ButtonEntity,
  ComponentType,
  type SectionEntity,
  type TextDisplayEntity,
  type ThumbnailEntity,
} from "./components.entity.js";

export class SectionBuilder extends BaseBuilder<SectionEntity> {
  constructor(data?: Partial<SectionEntity>) {
    super({
      type: ComponentType.Section,
      components: [],
      ...data,
    });
  }

  static from(data: SectionEntity): SectionBuilder {
    return new SectionBuilder(data);
  }

  addTextDisplay(textDisplay: TextDisplayEntity): this {
    return this.pushToArray("components", textDisplay);
  }

  addTextDisplays(...textDisplays: TextDisplayEntity[]): this {
    for (const textDisplay of textDisplays) {
      this.addTextDisplay(textDisplay);
    }
    return this;
  }

  setTextDisplays(textDisplays: TextDisplayEntity[]): this {
    if (textDisplays.length > 3) {
      throw new Error("Section cannot have more than 3 text display components");
    }
    return this.setArray("components", textDisplays);
  }

  setAccessory(accessory: ThumbnailEntity | ButtonEntity): this {
    return this.set("accessory", accessory);
  }

  setThumbnailAccessory(thumbnail: ThumbnailEntity): this {
    return this.setAccessory(thumbnail);
  }

  setButtonAccessory(button: ButtonEntity): this {
    return this.setAccessory(button);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setSimpleTextWithThumbnail(textDisplay: TextDisplayEntity, thumbnail: ThumbnailEntity): this {
    return this.setTextDisplays([textDisplay]).setThumbnailAccessory(thumbnail);
  }

  setSimpleTextWithButton(textDisplay: TextDisplayEntity, button: ButtonEntity): this {
    return this.setTextDisplays([textDisplay]).setButtonAccessory(button);
  }

  setMultiTextWithThumbnail(textDisplays: TextDisplayEntity[], thumbnail: ThumbnailEntity): this {
    return this.setTextDisplays(textDisplays).setThumbnailAccessory(thumbnail);
  }

  setMultiTextWithButton(textDisplays: TextDisplayEntity[], button: ButtonEntity): this {
    return this.setTextDisplays(textDisplays).setButtonAccessory(button);
  }

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
