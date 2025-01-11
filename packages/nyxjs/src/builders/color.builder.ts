export interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

export interface ColorRgba extends ColorRgb {
  a: number;
}

export interface ColorInformation {
  hex: string;
  rgb: ColorRgb;
  decimal: number;
}

export enum Colors {
  Default = 0x000000,
  Black = 0x000000,
  Blue = 0x0000ff,
  Pink = 0xff69b4,
  Purple = 0x800080,
  Orange = 0xffa500,
  Gray = 0x808080,
  Navy = 0x000080,
  Gold = 0xffd700,
  Aqua = 0x00ffff,
  White = 0xffffff,
  Blurple = 0x5865f2,
  Green = 0x57f287,
  Yellow = 0xfee75c,
  Fuchsia = 0xeb459e,
  Red = 0xed4245,
  Greyple = 0x99aab5,
  DarkButNotBlack = 0x2c2f33,
  NotQuiteBlack = 0x23272a,
}

export type ColorResolvable =
  | string
  | number
  | [red: number, green: number, blue: number]
  | [red: number, green: number, blue: number, alpha: number]
  | ColorRgb
  | ColorRgba
  | Colors;

export class ColorBuilder {
  static HEX_REGEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  #color: ColorInformation;

  constructor(color: ColorResolvable = Colors.Default) {
    this.#color = ColorBuilder.resolve(color);
  }

  static resolve(color: ColorResolvable): ColorInformation {
    if (typeof color === "string") {
      const formattedHex = color.startsWith("#") ? color : `#${color}`;
      ColorBuilder.validateHex(formattedHex);
      const rgb = ColorBuilder.hexToRgb(formattedHex);
      return {
        hex: formattedHex,
        rgb,
        decimal: ColorBuilder.rgbToDecimal(rgb.r, rgb.g, rgb.b),
      };
    }

    if (typeof color === "number") {
      const rgb = ColorBuilder.decimalToRgb(color);
      return {
        hex: ColorBuilder.rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb,
        decimal: color,
      };
    }

    if (Array.isArray(color)) {
      const [r, g, b] = color;
      ColorBuilder.validateRgb(r, g, b);
      return {
        hex: ColorBuilder.rgbToHex(r, g, b),
        rgb: { r, g, b },
        decimal: ColorBuilder.rgbToDecimal(r, g, b),
      };
    }

    if ("r" in color && "g" in color && "b" in color) {
      const { r, g, b } = color;
      ColorBuilder.validateRgb(r, g, b);
      return {
        hex: ColorBuilder.rgbToHex(r, g, b),
        rgb: { r, g, b },
        decimal: ColorBuilder.rgbToDecimal(r, g, b),
      };
    }

    throw new Error("Invalid color format");
  }

  static from(color: ColorResolvable): ColorBuilder {
    return new ColorBuilder(color);
  }

  static random(): ColorBuilder {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return new ColorBuilder([r, g, b]);
  }

  static validateRgb(r: number, g: number, b: number): void {
    const isValid = (value: number): boolean =>
      Number.isInteger(value) && value >= 0 && value <= 255;

    if (!(isValid(r) && isValid(g) && isValid(b))) {
      throw new Error("RGB values must be integers between 0 and 255");
    }
  }

  static validateHex(hex: string): void {
    if (!ColorBuilder.HEX_REGEX.test(hex)) {
      throw new Error("Invalid hex color format");
    }
  }

  static rgbToDecimal(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b;
  }

  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number): string => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static hexToRgb(hex: string): ColorRgb {
    let subHex = hex.replace(/^#/, "");

    if (subHex.length === 3) {
      subHex = subHex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const bigint = Number.parseInt(subHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  static decimalToRgb(decimal: number): ColorRgb {
    return {
      r: (decimal >> 16) & 255,
      g: (decimal >> 8) & 255,
      b: decimal & 255,
    };
  }

  setColor(color: ColorResolvable): this {
    this.#color = ColorBuilder.resolve(color);
    return this;
  }

  setRgb(r: number, g: number, b: number): this {
    ColorBuilder.validateRgb(r, g, b);
    this.#color = {
      hex: ColorBuilder.rgbToHex(r, g, b),
      rgb: { r, g, b },
      decimal: ColorBuilder.rgbToDecimal(r, g, b),
    };
    return this;
  }

  setHex(hex: string): this {
    this.#color = ColorBuilder.resolve(hex);
    return this;
  }

  setDecimal(decimal: number): this {
    this.#color = ColorBuilder.resolve(decimal);
    return this;
  }

  toHex(): string {
    return this.#color.hex;
  }

  toRgb(): ColorRgb {
    return { ...this.#color.rgb };
  }

  toDecimal(): number {
    return this.#color.decimal;
  }

  toJson(): ColorInformation {
    return { ...this.#color };
  }

  mix(color: ColorResolvable, ratio = 0.5): ColorBuilder {
    const otherColor = ColorBuilder.resolve(color);
    const r = Math.round(
      this.#color.rgb.r * (1 - ratio) + otherColor.rgb.r * ratio,
    );
    const g = Math.round(
      this.#color.rgb.g * (1 - ratio) + otherColor.rgb.g * ratio,
    );
    const b = Math.round(
      this.#color.rgb.b * (1 - ratio) + otherColor.rgb.b * ratio,
    );
    return new ColorBuilder([r, g, b]);
  }

  lighten(percentage = 0.1): ColorBuilder {
    return this.mix(Colors.White, percentage);
  }

  darken(percentage = 0.1): ColorBuilder {
    return this.mix(Colors.Black, percentage);
  }

  invert(): ColorBuilder {
    const { r, g, b } = this.#color.rgb;
    return new ColorBuilder([255 - r, 255 - g, 255 - b]);
  }
}
