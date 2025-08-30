import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type SeparatorEntity } from "./components.entity.js";

/**
 * @description Professional builder for Discord separator components in Components v2.
 * Used for visual separation and spacing in modern message layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#separator}
 */
export class SeparatorBuilder extends BaseBuilder<SeparatorEntity> {
  constructor(data?: Partial<SeparatorEntity>) {
    super({
      type: ComponentType.Separator,
      divider: true, // Default Discord behavior
      spacing: 1, // Default Discord behavior
      ...data,
    });
  }

  /**
   * @description Creates a separator builder from existing data.
   * @param data - Existing separator entity data
   * @returns New separator builder instance
   */
  static from(data: SeparatorEntity): SeparatorBuilder {
    return new SeparatorBuilder(data);
  }

  /**
   * @description Sets whether to display a visual divider line.
   * @param divider - Whether to show divider line (defaults to true)
   * @returns This builder instance for method chaining
   */
  setDivider(divider = true): this {
    return this.set("divider", divider);
  }

  /**
   * @description Sets the padding size around the separator.
   * @param spacing - Spacing size (1 for small, 2 for large)
   * @returns This builder instance for method chaining
   */
  setSpacing(spacing: 1 | 2): this {
    return this.set("spacing", spacing);
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
   * @description Creates a separator with divider line and small spacing.
   * @returns This builder instance for method chaining
   */
  setSmallWithDivider(): this {
    return this.setDivider(true).setSpacing(1);
  }

  /**
   * @description Creates a separator with divider line and large spacing.
   * @returns This builder instance for method chaining
   */
  setLargeWithDivider(): this {
    return this.setDivider(true).setSpacing(2);
  }

  /**
   * @description Creates a separator with only small spacing (no divider line).
   * @returns This builder instance for method chaining
   */
  setSmallSpacingOnly(): this {
    return this.setDivider(false).setSpacing(1);
  }

  /**
   * @description Creates a separator with only large spacing (no divider line).
   * @returns This builder instance for method chaining
   */
  setLargeSpacingOnly(): this {
    return this.setDivider(false).setSpacing(2);
  }

  /**
   * @description Validates separator data before building.
   * @throws {Error} When separator configuration is invalid
   */
  protected validate(): void {
    // Validate spacing value
    if (
      this.rawData.spacing !== undefined &&
      this.rawData.spacing !== 1 &&
      this.rawData.spacing !== 2
    ) {
      throw new Error("Separator spacing must be 1 (small) or 2 (large)");
    }
  }
}
