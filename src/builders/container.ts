import { BaseBuilder } from "../../bases/index.js";
import { type ColorResolvable, resolveColor } from "../../utils/index.js";
import {
  type ComponentsV2MessageComponentEntity,
  ComponentType,
  type ContainerEntity,
} from "./components.entity.js";

export class ContainerBuilder extends BaseBuilder<ContainerEntity> {
  constructor(data?: Partial<ContainerEntity>) {
    super({
      type: ComponentType.Container,
      components: [],
      ...data,
    });
  }

  static from(data: ContainerEntity): ContainerBuilder {
    return new ContainerBuilder(data);
  }

  addComponent(component: ComponentsV2MessageComponentEntity): this {
    return this.pushToArray("components", component);
  }

  addComponents(...components: ComponentsV2MessageComponentEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  setComponents(components: ComponentsV2MessageComponentEntity[]): this {
    return this.setArray("components", components);
  }

  setAccentColor(color: ColorResolvable): this {
    const resolvedColor = resolveColor(color);
    if (resolvedColor < 0x000000 || resolvedColor > 0xffffff) {
      throw new Error("Container accent color must be between 0x000000 and 0xFFFFFF");
    }
    return this.set("accent_color", resolvedColor);
  }

  clearAccentColor(): this {
    return this.set("accent_color", null);
  }

  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setColoredContainer(
    color: ColorResolvable,
    components: ComponentsV2MessageComponentEntity[],
  ): this {
    return this.setAccentColor(color).setComponents(components);
  }

  setNeutralContainer(components: ComponentsV2MessageComponentEntity[]): this {
    return this.clearAccentColor().setComponents(components);
  }

  setSpoilerContainer(
    components: ComponentsV2MessageComponentEntity[],
    color?: ColorResolvable,
  ): this {
    this.setSpoiler(true).setComponents(components);
    if (color) this.setAccentColor(color);
    return this;
  }

  setThemedContainer(
    theme: "primary" | "success" | "warning" | "danger" | ColorResolvable,
    components: ComponentsV2MessageComponentEntity[],
  ): this {
    const themeColors = {
      primary: 0x5865f2, // Discord Blurple
      success: 0x57f287, // Discord Green
      warning: 0xfee75c, // Discord Yellow
      danger: 0xed4245, // Discord Red
    };

    const color =
      typeof theme === "string" && theme in themeColors
        ? themeColors[theme as keyof typeof themeColors]
        : theme;

    return this.setAccentColor(color).setComponents(components);
  }

  protected validate(): void {
    const data = this.rawData;

    if (!data.components || data.components.length === 0) {
      throw new Error("Container must have at least one child component");
    }

    // Validate accent color range
    if (data.accent_color !== undefined && data.accent_color !== null) {
      if (typeof data.accent_color !== "number") {
        throw new Error("Container accent color must be a number");
      }
      if (data.accent_color < 0x000000 || data.accent_color > 0xffffff) {
        throw new Error("Container accent color must be between 0x000000 and 0xFFFFFF");
      }
    }

    // Validate child components are Components v2 compatible
    for (const component of data.components) {
      const validTypes = [
        ComponentType.ActionRow,
        ComponentType.TextDisplay,
        ComponentType.Section,
        ComponentType.MediaGallery,
        ComponentType.File,
        ComponentType.Thumbnail,
        ComponentType.Separator,
        ComponentType.Container,
      ];

      if (!validTypes.includes(component.type)) {
        throw new Error(
          `Container child component type ${component.type} is not valid for Components v2`,
        );
      }
    }
  }
}
