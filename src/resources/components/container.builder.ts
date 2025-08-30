import { BaseBuilder } from "../../bases/index.js";
import { type ColorResolvable, resolveColor } from "../../utils/index.js";
import {
  type ComponentsV2MessageComponentEntity,
  ComponentType,
  type ContainerEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for Discord container components in Components v2.
 * Creates visual grouping containers with optional accent colors for organized layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#container}
 */
export class ContainerBuilder extends BaseBuilder<ContainerEntity> {
  constructor(data?: Partial<ContainerEntity>) {
    super({
      type: ComponentType.Container,
      components: [],
      ...data,
    });
  }

  /**
   * @description Creates a container builder from existing data.
   * @param data - Existing container entity data
   * @returns New container builder instance
   */
  static from(data: ContainerEntity): ContainerBuilder {
    return new ContainerBuilder(data);
  }

  /**
   * @description Adds a single child component to the container.
   * @param component - Components v2 message component
   * @returns This builder instance for method chaining
   */
  addComponent(component: ComponentsV2MessageComponentEntity): this {
    return this.pushToArray("components", component);
  }

  /**
   * @description Adds multiple child components to the container.
   * @param components - Components v2 message components
   * @returns This builder instance for method chaining
   */
  addComponents(...components: ComponentsV2MessageComponentEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  /**
   * @description Sets all child components, replacing existing ones.
   * @param components - Components v2 message components
   * @returns This builder instance for method chaining
   */
  setComponents(components: ComponentsV2MessageComponentEntity[]): this {
    return this.setArray("components", components);
  }

  /**
   * @description Sets the RGB accent color for the container border.
   * @param color - Color resolvable (hex string, RGB array, number)
   * @returns This builder instance for method chaining
   */
  setAccentColor(color: ColorResolvable): this {
    const resolvedColor = resolveColor(color);
    if (resolvedColor < 0x000000 || resolvedColor > 0xffffff) {
      throw new Error("Container accent color must be between 0x000000 and 0xFFFFFF");
    }
    return this.set("accent_color", resolvedColor);
  }

  /**
   * @description Removes the accent color from the container.
   * @returns This builder instance for method chaining
   */
  clearAccentColor(): this {
    return this.set("accent_color", null);
  }

  /**
   * @description Sets whether the container should be blurred as a spoiler.
   * @param spoiler - Whether container is a spoiler (defaults to true)
   * @returns This builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
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
   * @description Creates a container with accent color and components.
   * @param color - Accent color
   * @param components - Child components
   * @returns This builder instance for method chaining
   */
  setColoredContainer(
    color: ColorResolvable,
    components: ComponentsV2MessageComponentEntity[],
  ): this {
    return this.setAccentColor(color).setComponents(components);
  }

  /**
   * @description Creates a neutral container without accent color.
   * @param components - Child components
   * @returns This builder instance for method chaining
   */
  setNeutralContainer(components: ComponentsV2MessageComponentEntity[]): this {
    return this.clearAccentColor().setComponents(components);
  }

  /**
   * @description Creates a spoiler container that blurs its contents.
   * @param components - Child components
   * @param color - Optional accent color
   * @returns This builder instance for method chaining
   */
  setSpoilerContainer(
    components: ComponentsV2MessageComponentEntity[],
    color?: ColorResolvable,
  ): this {
    this.setSpoiler(true).setComponents(components);
    if (color) this.setAccentColor(color);
    return this;
  }

  /**
   * @description Creates a themed container with specific color scheme.
   * @param theme - Color theme ("primary", "success", "warning", "danger", or custom color)
   * @param components - Child components
   * @returns This builder instance for method chaining
   */
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

  /**
   * @description Validates container data before building.
   * @throws {Error} When container configuration is invalid
   */
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
