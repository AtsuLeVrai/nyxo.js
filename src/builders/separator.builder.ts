import { BaseBuilder } from "../../bases/index.js";
import { ComponentType, type SeparatorEntity } from "./components.entity.js";

export class SeparatorBuilder extends BaseBuilder<SeparatorEntity> {
  constructor(data?: Partial<SeparatorEntity>) {
    super({
      type: ComponentType.Separator,
      divider: true, // Default Discord behavior
      spacing: 1, // Default Discord behavior
      ...data,
    });
  }

  static from(data: SeparatorEntity): SeparatorBuilder {
    return new SeparatorBuilder(data);
  }

  setDivider(divider = true): this {
    return this.set("divider", divider);
  }

  setSpacing(spacing: 1 | 2): this {
    return this.set("spacing", spacing);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setSmallWithDivider(): this {
    return this.setDivider(true).setSpacing(1);
  }

  setLargeWithDivider(): this {
    return this.setDivider(true).setSpacing(2);
  }

  setSmallSpacingOnly(): this {
    return this.setDivider(false).setSpacing(1);
  }

  setLargeSpacingOnly(): this {
    return this.setDivider(false).setSpacing(2);
  }

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
