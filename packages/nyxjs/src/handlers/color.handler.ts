const RGBA_REGEX = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/;
const HSLA_REGEX = /^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)$/;
const HEX_REGEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const HEX_SHORT_REGEX = /^#?([A-Fa-f0-9]{3})$/;
const HEX_REPLACE_REGEX = /^#/;

export interface Rgb {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
  a?: number;
}

export interface Hsv {
  h: number;
  s: number;
  v: number;
  a?: number;
}

export interface Cmyk {
  c: number;
  m: number;
  y: number;
  k: number;
}

export type ColorInput =
  | string
  | number
  | [number, number, number]
  | Rgb
  | Hsl
  | Hsv
  | Cmyk
  | ColorHandler
  | ColorSpace;

export enum ColorSpace {
  Blurple = 0x5865f2,
  Green = 0x57f287,
  Yellow = 0xfee75c,
  Fuchsia = 0xeb459e,
  Red = 0xed4245,
  White = 0xffffff,
  Black = 0x000000,
}

export class ColorHandler {
  #r = 0;
  #g = 0;
  #b = 0;
  #a = 1;

  constructor(color?: ColorInput) {
    if (!color) {
      return;
    }

    if (!ColorHandler.isColorInput(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }

    if (ColorHandler.isColorBuilder(color)) {
      this.#r = color.#r;
      this.#g = color.#g;
      this.#b = color.#b;
      this.#a = color.#a;
      return;
    }

    if (ColorHandler.isColorSpace(color)) {
      this.setRgb((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      return;
    }

    if (ColorHandler.isString(color)) {
      const rgbMatch = color.match(RGBA_REGEX);
      if (rgbMatch) {
        const [, r, g, b, a] = rgbMatch;
        this.setRgb(Number(r), Number(g), Number(b));
        if (a !== undefined) {
          this.setAlpha(Number(a));
        }
        return;
      }

      const hslMatch = color.match(HSLA_REGEX);
      if (hslMatch) {
        const [, h, s, l, a] = hslMatch;
        this.setHsl(Number(h), Number(s), Number(l));
        if (a !== undefined) {
          this.setAlpha(Number(a));
        }
        return;
      }

      if (HEX_REGEX.test(color)) {
        let hex = color.replace("#", "");
        if (hex.length === 3) {
          hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
        }
        this.setHex(`#${hex}`);
        return;
      }

      throw new Error(`Invalid color string format: ${color}`);
    }

    if (ColorHandler.isNumber(color)) {
      if (color < 0 || color > 0xffffff) {
        throw new Error("Color number must be between 0 and 16777215");
      }
      this.setRgb((color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      return;
    }

    if (ColorHandler.isRgbArray(color)) {
      this.setRgb(color[0], color[1], color[2]);
      return;
    }

    if (ColorHandler.isRgbObject(color)) {
      const { r, g, b, a } = color;
      this.setRgb(r, g, b);
      if (a !== undefined) {
        this.setAlpha(a);
      }
      return;
    }

    if (ColorHandler.isHslObject(color)) {
      const { h, s, l, a } = color;
      this.setHsl(h, s, l);
      if (a !== undefined) {
        this.setAlpha(a);
      }
      return;
    }

    if (ColorHandler.isHsvObject(color)) {
      const { h, s, v, a } = color;
      this.setHsv(h, s, v);
      if (a !== undefined) {
        this.setAlpha(a);
      }
      return;
    }

    if (ColorHandler.isCmykObject(color)) {
      const { c, m, y, k } = color;
      this.setCmyk(c, m, y, k);
      return;
    }

    throw new Error("Invalid color format");
  }

  static fromRgb(r: number, g: number, b: number): ColorHandler {
    return new ColorHandler().setRgb(r, g, b);
  }

  static fromHex(hex: string): ColorHandler {
    return new ColorHandler().setHex(hex);
  }

  static fromHsl(h: number, s: number, l: number): ColorHandler {
    return new ColorHandler().setHsl(h, s, l);
  }

  static fromHsv(h: number, s: number, v: number): ColorHandler {
    return new ColorHandler().setHsv(h, s, v);
  }

  static fromCmyk(c: number, m: number, y: number, k: number): ColorHandler {
    return new ColorHandler().setCmyk(c, m, y, k);
  }

  static random(): ColorHandler {
    return new ColorHandler().setRgb(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
    );
  }

  static isColorSpace(color: unknown): color is ColorSpace {
    return Object.values(ColorSpace).includes(color as ColorSpace);
  }

  static isString(color: unknown): color is string {
    return typeof color === "string";
  }

  static isNumber(color: unknown): color is number {
    return typeof color === "number";
  }

  static isRgbArray(color: unknown): color is [number, number, number] {
    return (
      Array.isArray(color) &&
      color.length === 3 &&
      color.every((v) => typeof v === "number")
    );
  }

  static isRgbObject(color: unknown): color is Rgb {
    return (
      typeof color === "object" &&
      color !== null &&
      "r" in color &&
      "g" in color &&
      "b" in color &&
      typeof color.r === "number" &&
      typeof color.g === "number" &&
      typeof color.b === "number"
    );
  }

  static isHslObject(color: unknown): color is Hsl {
    return (
      typeof color === "object" &&
      color !== null &&
      "h" in color &&
      "s" in color &&
      "l" in color &&
      typeof color.h === "number" &&
      typeof color.s === "number" &&
      typeof color.l === "number"
    );
  }

  static isHsvObject(color: unknown): color is Hsv {
    return (
      typeof color === "object" &&
      color !== null &&
      "h" in color &&
      "s" in color &&
      "v" in color &&
      typeof color.h === "number" &&
      typeof color.s === "number" &&
      typeof color.v === "number"
    );
  }

  static isCmykObject(color: unknown): color is Cmyk {
    return (
      typeof color === "object" &&
      color !== null &&
      "c" in color &&
      "m" in color &&
      "y" in color &&
      "k" in color &&
      typeof color.c === "number" &&
      typeof color.m === "number" &&
      typeof color.y === "number" &&
      typeof color.k === "number"
    );
  }

  static isColorBuilder(color: unknown): color is ColorHandler {
    return color instanceof ColorHandler;
  }

  static isColorInput(color: unknown): color is ColorInput {
    return (
      ColorHandler.isString(color) ||
      ColorHandler.isNumber(color) ||
      ColorHandler.isRgbArray(color) ||
      ColorHandler.isRgbObject(color) ||
      ColorHandler.isHslObject(color) ||
      ColorHandler.isHsvObject(color) ||
      ColorHandler.isCmykObject(color) ||
      ColorHandler.isColorBuilder(color) ||
      ColorHandler.isColorSpace(color)
    );
  }

  setRgb(r: number, g: number, b: number): this {
    this.#validateRgb(r, g, b);
    this.#r = Math.round(r);
    this.#g = Math.round(g);
    this.#b = Math.round(b);
    return this;
  }

  setHex(hex: string): this {
    const normalized = hex.replace(HEX_REPLACE_REGEX, "");
    if (!HEX_SHORT_REGEX.test(normalized)) {
      throw new Error("Invalid hex color format");
    }

    const r = Number.parseInt(normalized.substring(0, 2), 16);
    const g = Number.parseInt(normalized.substring(2, 4), 16);
    const b = Number.parseInt(normalized.substring(4, 6), 16);

    return this.setRgb(r, g, b);
  }

  setHsl(h: number, s: number, l: number): this {
    this.#validateHsl(h, s, l);
    const rgb = this.#hslToRgb({ h, s, l });
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  setHsv(h: number, s: number, v: number): this {
    this.#validateHsv(h, s, v);
    const rgb = this.#hsvToRgb({ h, s, v });
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  setCmyk(c: number, m: number, y: number, k: number): this {
    this.#validateCmyk(c, m, y, k);
    const rgb = this.#cmykToRgb({ c, m, y, k });
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  setAlpha(alpha: number): this {
    if (alpha < 0 || alpha > 1) {
      throw new Error("Alpha must be between 0 and 1");
    }

    this.#a = alpha;
    return this;
  }

  lighten(amount: number): this {
    const hsl = this.toHsl();
    hsl.l = Math.min(100, hsl.l + amount);
    const rgb = this.#hslToRgb(hsl);
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  darken(amount: number): this {
    const hsl = this.toHsl();
    hsl.l = Math.max(0, hsl.l - amount);
    const rgb = this.#hslToRgb(hsl);
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  saturate(amount: number): this {
    const hsl = this.toHsl();
    hsl.s = Math.min(100, hsl.s + amount);
    const rgb = this.#hslToRgb(hsl);
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  desaturate(amount: number): this {
    const hsl = this.toHsl();
    hsl.s = Math.max(0, hsl.s - amount);
    const rgb = this.#hslToRgb(hsl);
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  rotate(degrees: number): this {
    const hsl = this.toHsl();
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) {
      hsl.h += 360;
    }
    const rgb = this.#hslToRgb(hsl);
    return this.setRgb(rgb.r, rgb.g, rgb.b);
  }

  invert(): this {
    return this.setRgb(255 - this.#r, 255 - this.#g, 255 - this.#b);
  }

  grayscale(): this {
    const avg = Math.round((this.#r + this.#g + this.#b) / 3);
    return this.setRgb(avg, avg, avg);
  }

  mix(color: ColorHandler, weight = 0.5): this {
    const w = Math.max(0, Math.min(1, weight));
    const r = Math.round(this.#r * (1 - w) + color.toRgb().r * w);
    const g = Math.round(this.#g * (1 - w) + color.toRgb().g * w);
    const b = Math.round(this.#b * (1 - w) + color.toRgb().b * w);
    return this.setRgb(r, g, b);
  }

  toRgb(): Rgb {
    return { r: this.#r, g: this.#g, b: this.#b };
  }

  toRgbaObject(): { r: number; g: number; b: number; a: number } {
    return { ...this.toRgb(), a: this.#a };
  }

  toHex(): string {
    const componentToHex = (c: number): string => {
      const hex = c.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    return `#${componentToHex(this.#r)}${componentToHex(this.#g)}${componentToHex(this.#b)}`;
  }

  toHsl(): Hsl {
    const r = this.#r / 255;
    const g = this.#g / 255;
    const b = this.#b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          break;
      }

      h *= 60;
    }

    return { h, s: s * 100, l: l * 100 };
  }

  toHsv(): Hsv {
    const r = this.#r / 255;
    const g = this.#g / 255;
    const b = this.#b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          break;
      }
      h *= 60;
    }

    return { h, s: s * 100, v: v * 100 };
  }

  toCmyk(): Cmyk {
    if (this.#r === 0 && this.#g === 0 && this.#b === 0) {
      return { c: 0, m: 0, y: 0, k: 1 };
    }

    const r = this.#r / 255;
    const g = this.#g / 255;
    const b = this.#b / 255;

    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  }

  toRgbString(): string {
    return `rgb(${this.#r}, ${this.#g}, ${this.#b})`;
  }

  toRgbaString(): string {
    return `rgba(${this.#r}, ${this.#g}, ${this.#b}, ${this.#a})`;
  }

  toHslString(): string {
    const { h, s, l } = this.toHsl();
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  toHsvString(): string {
    const { h, s, v } = this.toHsv();
    return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
  }

  toNumber(): number {
    return (this.#r << 16) + (this.#g << 8) + this.#b;
  }

  clone(): ColorHandler {
    return new ColorHandler()
      .setRgb(this.#r, this.#g, this.#b)
      .setAlpha(this.#a);
  }

  equals(other: ColorHandler): boolean {
    return (
      this.#r === other.#r &&
      this.#g === other.#g &&
      this.#b === other.#b &&
      this.#a === other.#a
    );
  }

  getComplementary(): ColorHandler {
    return this.clone().rotate(180);
  }

  getAnalogous(): [ColorHandler, ColorHandler] {
    return [this.clone().rotate(-30), this.clone().rotate(30)];
  }

  getTriadic(): [ColorHandler, ColorHandler] {
    return [this.clone().rotate(120), this.clone().rotate(240)];
  }

  getSplitComplementary(): [ColorHandler, ColorHandler] {
    return [this.clone().rotate(150), this.clone().rotate(-150)];
  }

  getTetradic(): [ColorHandler, ColorHandler, ColorHandler] {
    return [
      this.clone().rotate(90),
      this.clone().rotate(180),
      this.clone().rotate(270),
    ];
  }

  multiply(color: ColorHandler): this {
    const rgb = color.toRgb();
    return this.setRgb(
      (this.#r * rgb.r) / 255,
      (this.#g * rgb.g) / 255,
      (this.#b * rgb.b) / 255,
    );
  }

  screen(color: ColorHandler): this {
    const rgb = color.toRgb();
    return this.setRgb(
      255 - ((255 - this.#r) * (255 - rgb.r)) / 255,
      255 - ((255 - this.#g) * (255 - rgb.g)) / 255,
      255 - ((255 - this.#b) * (255 - rgb.b)) / 255,
    );
  }

  overlay(color: ColorHandler): this {
    const rgb = color.toRgb();
    return this.setRgb(
      this.#r < 128
        ? (2 * this.#r * rgb.r) / 255
        : 255 - (2 * (255 - this.#r) * (255 - rgb.r)) / 255,
      this.#g < 128
        ? (2 * this.#g * rgb.g) / 255
        : 255 - (2 * (255 - this.#g) * (255 - rgb.g)) / 255,
      this.#b < 128
        ? (2 * this.#b * rgb.b) / 255
        : 255 - (2 * (255 - this.#b) * (255 - rgb.b)) / 255,
    );
  }

  isLight(threshold = 128): boolean {
    return (this.#r * 299 + this.#g * 587 + this.#b * 114) / 1000 >= threshold;
  }

  isDark(threshold = 128): boolean {
    return !this.isLight(threshold);
  }

  getBrightness(): number {
    return (this.#r * 299 + this.#g * 587 + this.#b * 114) / 1000;
  }

  getLuminance(): number {
    const [rs = 0, gs = 0, bs = 0] = [
      this.#r / 255,
      this.#g / 255,
      this.#b / 255,
    ].map((val) =>
      val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4,
    );
    return rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
  }

  getContrastRatio(color: ColorHandler): number {
    const l1 = this.getLuminance();
    const l2 = color.getLuminance();
    const lightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (lightest + 0.05) / (darkest + 0.05);
  }

  isRed(): boolean {
    return this.#r > this.#g && this.#r > this.#b;
  }

  isGreen(): boolean {
    return this.#g > this.#r && this.#g > this.#b;
  }

  isBlue(): boolean {
    return this.#b > this.#r && this.#b > this.#g;
  }

  isGray(): boolean {
    const tolerance = 5;
    return (
      Math.abs(this.#r - this.#g) <= tolerance &&
      Math.abs(this.#g - this.#b) <= tolerance &&
      Math.abs(this.#r - this.#b) <= tolerance
    );
  }

  isPure(): boolean {
    const components = [this.#r, this.#g, this.#b].sort((a, b) => b - a);
    return components[0] === 255 && components[1] === 0 && components[2] === 0;
  }

  isWarm(): boolean {
    const { h } = this.toHsl();
    return h >= 0 && h < 180;
  }

  isCool(): boolean {
    const { h } = this.toHsl();
    return h >= 180 && h < 360;
  }

  isTransparent(): boolean {
    return this.#a < 0.5;
  }

  isOpaque(): boolean {
    return this.#a >= 0.5;
  }

  isFullyTransparent(): boolean {
    return this.#a === 0;
  }

  isFullyOpaque(): boolean {
    return this.#a === 1;
  }

  isSaturated(threshold = 60): boolean {
    const { s } = this.toHsl();
    return s >= threshold;
  }

  isDesaturated(threshold = 30): boolean {
    const { s } = this.toHsl();
    return s <= threshold;
  }

  isMonochrome(): boolean {
    return this.#r === this.#g && this.#g === this.#b;
  }

  isPastel(): boolean {
    const { s, l } = this.toHsl();
    return l >= 85 && s >= 10;
  }

  isNeon(): boolean {
    const { s, l } = this.toHsl();
    return s >= 80 && l >= 50 && l <= 70;
  }

  isMetallic(): boolean {
    const { s, l } = this.toHsl();
    return s <= 20 && l >= 40 && l <= 80;
  }

  isDull(): boolean {
    const { s, l } = this.toHsl();
    return s <= 30 && l >= 20 && l <= 80;
  }

  isVibrant(): boolean {
    const { s, l } = this.toHsl();
    return s >= 80 && l >= 40 && l <= 60;
  }

  isDiscordColor(): boolean {
    return [
      ColorSpace.Blurple,
      ColorSpace.Green,
      ColorSpace.Yellow,
      ColorSpace.Fuchsia,
      ColorSpace.Red,
      ColorSpace.White,
      ColorSpace.Black,
    ].some((color) => this.equals(new ColorHandler(color)));
  }

  isBlurple(): boolean {
    return this.equals(new ColorHandler(ColorSpace.Blurple));
  }

  isDiscordGreen(): boolean {
    return this.equals(new ColorHandler(ColorSpace.Green));
  }

  isDiscordYellow(): boolean {
    return this.equals(new ColorHandler(ColorSpace.Yellow));
  }

  isDiscordFuchsia(): boolean {
    return this.equals(new ColorHandler(ColorSpace.Fuchsia));
  }

  isDiscordRed(): boolean {
    return this.equals(new ColorHandler(ColorSpace.Red));
  }

  isWhite(tolerance = 5): boolean {
    return (
      this.#r >= 255 - tolerance &&
      this.#g >= 255 - tolerance &&
      this.#b >= 255 - tolerance
    );
  }

  isBlack(tolerance = 5): boolean {
    return this.#r <= tolerance && this.#g <= tolerance && this.#b <= tolerance;
  }

  isHighContrast(
    backgroundColor: ColorHandler = new ColorHandler(ColorSpace.White),
  ): boolean {
    return this.getContrastRatio(backgroundColor) >= 4.5;
  }

  isAccessible(
    backgroundColor: ColorHandler = new ColorHandler(ColorSpace.White),
  ): boolean {
    return this.getContrastRatio(backgroundColor) >= 7;
  }

  isValidHex(hex: string): boolean {
    return HEX_REGEX.test(hex);
  }

  isValidRgb(r: number, g: number, b: number): boolean {
    return [r, g, b].every((v) => Number.isInteger(v) && v >= 0 && v <= 255);
  }

  isValidHsl(h: number, s: number, l: number): boolean {
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
  }

  isValidHsv(h: number, s: number, v: number): boolean {
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100;
  }

  isValidCmyk(c: number, m: number, y: number, k: number): boolean {
    return [c, m, y, k].every((v) => v >= 0 && v <= 100);
  }

  isValidAlpha(alpha: number): boolean {
    return alpha >= 0 && alpha <= 1;
  }

  #hslToRgb({ h, s, l }: Hsl): Rgb {
    s /= 100;
    l /= 100;
    h %= 360;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c];
    } else if (h >= 300 && h < 360) {
      [r, g, b] = [c, 0, x];
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  #hsvToRgb({ h, s, v }: Hsv): Rgb {
    s /= 100;
    v /= 100;
    h %= 360;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, b] = [x, 0, c];
    } else if (h >= 300 && h < 360) {
      [r, g, b] = [c, 0, x];
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  #cmykToRgb({ c, m, y, k }: Cmyk): Rgb {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
    };
  }

  #validateRgb(r: number, g: number, b: number): void {
    if (!(Number.isInteger(r) && Number.isInteger(g) && Number.isInteger(b))) {
      throw new Error("RGB values must be integers");
    }

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error("RGB values must be between 0 and 255");
    }
  }

  #validateHsl(h: number, s: number, l: number): void {
    if (h < 0 || h > 360) {
      throw new Error("Hue must be between 0 and 360");
    }
    if (s < 0 || s > 100) {
      throw new Error("Saturation must be between 0 and 100");
    }
    if (l < 0 || l > 100) {
      throw new Error("Lightness must be between 0 and 100");
    }
  }

  #validateHsv(h: number, s: number, v: number): void {
    if (h < 0 || h > 360) {
      throw new Error("Hue must be between 0 and 360");
    }
    if (s < 0 || s > 100) {
      throw new Error("Saturation must be between 0 and 100");
    }
    if (v < 0 || v > 100) {
      throw new Error("Value must be between 0 and 100");
    }
  }

  #validateCmyk(c: number, m: number, y: number, k: number): void {
    if (
      c < 0 ||
      c > 100 ||
      m < 0 ||
      m > 100 ||
      y < 0 ||
      y > 100 ||
      k < 0 ||
      k > 100
    ) {
      throw new Error("CMYK values must be between 0 and 100");
    }
  }
}
