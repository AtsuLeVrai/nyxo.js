import type { Integer } from "@nyxjs/core";

/**
 * Represents color values as RGB tuples
 */
export type Rgb = [red: Integer, green: Integer, blue: Integer];

/**
 * Represents colors as hexadecimal strings
 */
export type HexColorString = `#${string}`;

/**
 * Represents Discord colors as enumerated values
 */
export enum ColorValues {
    AliceBlue = 0xf0f8ff,
    AntiqueWhite = 0xfaebd7,
    Aqua = 0x00ffff,
    Aquamarine = 0x7fffd4,
    Black = 0x000000,
    Blue = 0x5865f2,
    BlueViolet = 0x8a2be2,
    Brown = 0xa52a2a,
    BurlyWood = 0xdeb887,
    CadetBlue = 0x5f9ea0,
    Chartreuse = 0x7fff00,
    Chocolate = 0xd2691e,
    Coral = 0xff7f50,
    CornflowerBlue = 0x6495ed,
    Crimson = 0xdc143c,
    DarkBlue = 0x00008b,
    DarkCyan = 0x008b8b,
    DarkGoldenRod = 0xb8860b,
    DarkGray = 0xa9a9a9,
    DarkGreen = 0x006400,
    DarkKhaki = 0xbdb76b,
    DarkMagenta = 0x8b008b,
    DarkOliveGreen = 0x556b2f,
    DarkOrange = 0xff8c00,
    DarkRed = 0x8b0000,
    DarkSalmon = 0xe9967a,
    DarkSeaGreen = 0x8fbc8f,
    DarkSlateBlue = 0x483d8b,
    DarkSlateGray = 0x2f4f4f,
    DarkTurquoise = 0x00ced1,
    DarkViolet = 0x9400d3,
    DeepPink = 0xff1493,
    DeepSkyBlue = 0x00bfff,
    DimGray = 0x696969,
    DodgerBlue = 0x1e90ff,
    ForestGreen = 0x228b22,
    Fuchsia = 0xeb459e,
    Gainsboro = 0xdcdcdc,
    Gold = 0xffd700,
    GoldenRod = 0xdaa520,
    Gray = 0x808080,
    Green = 0x57f287,
    GreenYellow = 0xadff2f,
    HotPink = 0xff69b4,
    IndianRed = 0xcd5c5c,
    Indigo = 0x4b0082,
    Khaki = 0xf0e68c,
    LightBlue = 0xadd8e6,
    LightGreen = 0x90ee90,
    LightPink = 0xffb6c1,
    LightSeaGreen = 0x20b2aa,
    LightSkyBlue = 0x87cefa,
    Lime = 0x00ff00,
    LimeGreen = 0x32cd32,
    Magenta = 0xff00ff,
    MediumAquaMarine = 0x66cdaa,
    MediumBlue = 0x0000cd,
    MediumOrchid = 0xba55d3,
    MediumPurple = 0x9370db,
    MediumSeaGreen = 0x3cb371,
    MediumSpringGreen = 0x00fa9a,
    MediumTurquoise = 0x48d1cc,
    MediumVioletRed = 0xc71585,
    MidnightBlue = 0x191970,
    NavajoWhite = 0xffdead,
    Olive = 0x808000,
    OliveDrab = 0x6b8e23,
    OrangeRed = 0xff4500,
    Orchid = 0xda70d6,
    PaleVioletRed = 0xdb7093,
    Peru = 0xcd853f,
    Plum = 0xdda0dd,
    RebeccaPurple = 0x663399,
    Red = 0xed4245,
    RosyBrown = 0xbc8f8f,
    SaddleBrown = 0x8b4513,
    SandyBrown = 0xf4a460,
    SeaGreen = 0x2e8b57,
    Silver = 0xc0c0c0,
    SlateBlue = 0x6a5acd,
    SteelBlue = 0x4682b4,
    Violet = 0xee82ee,
    Yellow = 0xfee75c,
    YellowGreen = 0x9acd32,
}

/**
 * Type for color names from the enum
 */
export type ColorNames = keyof typeof ColorValues;

/**
 * Represents all possible ways to specify a color
 */
export type ColorResolvable = HexColorString | Integer | Rgb | ColorValues | ColorNames;

/**
 * Utility functions for working with colors
 */
export const Colors = {
    /**
     * Resolves various color formats into a numeric color value
     * @param color - The color to resolve
     * @returns The resolved numeric color value
     */
    resolve(color: ColorResolvable): Integer {
        if (typeof color === "string") {
            if (color.startsWith("#")) {
                return Number.parseInt(color.slice(1), 16);
            }
            if (this.isColorName(color)) {
                return ColorValues[color];
            }
            throw new TypeError("Invalid color string. Must be a hex color or a valid color name.");
        }

        if (Array.isArray(color)) {
            return (color[0] << 16) + (color[1] << 8) + color[2];
        }

        if (this.isColorValue(color)) {
            return color;
        }

        if (typeof color === "number") {
            return color;
        }

        throw new TypeError("Invalid color value. Expected a hex string, RGB array, color name, or number.");
    },

    /**
     * Type guard to check if a value is a ColorValues enum value
     */
    isColorValue(value: unknown): value is ColorValues {
        return typeof value === "number" && Object.values(ColorValues).includes(value);
    },

    /**
     * Converts a numeric color to its hexadecimal representation
     */
    toHex(color: Integer): HexColorString {
        return `#${color.toString(16).padStart(6, "0")}`;
    },

    /**
     * Converts a numeric color to its RGB components
     */
    toRgb(color: Integer): Rgb {
        return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
    },

    /**
     * Inverts a numeric color
     */
    invert(color: Integer): Integer {
        return 0xffffff - color;
    },

    /**
     * Inverts RGB color components
     */
    invertRgb(color: Rgb): Rgb {
        return [255 - color[0], 255 - color[1], 255 - color[2]];
    },

    /**
     * Lightens a color by a specified amount
     */
    lighten(color: Integer, amount: number): Integer {
        const r = Math.min(255, (color >> 16) + 255 * amount);
        const g = Math.min(255, ((color >> 8) & 0xff) + 255 * amount);
        const b = Math.min(255, (color & 0xff) + 255 * amount);
        return (r << 16) + (g << 8) + b;
    },

    /**
     * Generates a random color
     */
    random(): Integer {
        return Math.floor(Math.random() * 0xffffff);
    },

    /**
     * Type guard to check if a value is a valid color name
     */
    isColorName(value: unknown): value is ColorNames {
        return typeof value === "string" && value in ColorValues;
    },

    /**
     * Type guard to check if a value is a valid RGB array
     */
    isRgb(value: unknown): value is Rgb {
        return (
            Array.isArray(value) &&
            value.length === 3 &&
            value.every((v) => typeof v === "number" && v >= 0 && v <= 255)
        );
    },

    /**
     * Type guard to check if a value is a valid hex color string
     */
    isHexColor(value: unknown): value is HexColorString {
        return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
    },

    /**
     * Gets a named color value
     */
    get(name: ColorNames): Integer {
        return ColorValues[name];
    },

    /**
     * Gets all available color names
     */
    names(): ColorNames[] {
        return Object.keys(ColorValues).filter((key) => Number.isNaN(Number(key))) as ColorNames[];
    },
};
