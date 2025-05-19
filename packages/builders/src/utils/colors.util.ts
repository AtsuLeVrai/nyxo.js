import { z } from "zod/v4";

/**
 * Type representing valid color formats accepted by the EmbedBuilder.
 * Colors can be provided as numbers, hex strings, RGB arrays, or named colors.
 */
export type ColorResolvable =
  | number
  | string
  | [red: number, green: number, blue: number]
  | Colors;

/**
 * Common color constants to use with embeds.
 * Provides named color values that can be used when setting embed colors.
 */
export enum Colors {
  /** Default embed color - Discord blurple */
  Default = 0x5865f2,

  /** White color */
  White = 0xffffff,

  /** Black color */
  Black = 0x000000,

  /** Red color */
  Red = 0xed4245,

  /** Green color */
  Green = 0x57f287,

  /** Blue color */
  Blue = 0x3498db,

  /** Yellow color */
  Yellow = 0xfee75c,

  /** Orange color */
  Orange = 0xe67e22,

  /** Purple color */
  Purple = 0x9b59b6,

  /** Pink color */
  Pink = 0xeb459e,

  /** Gold color */
  Gold = 0xf1c40f,

  /** Navy color */
  Navy = 0x34495e,

  /** Dark Aqua color */
  DarkAqua = 0x11806a,

  /** Dark Green color */
  DarkGreen = 0x1f8b4c,

  /** Dark Blue color */
  DarkBlue = 0x206694,

  /** Dark Purple color */
  DarkPurple = 0x71368a,

  /** Dark Orange color */
  DarkOrange = 0xa84300,

  /** Dark Red color */
  DarkRed = 0x992d22,

  /** Gray color */
  Gray = 0x95a5a6,

  /** Dark Gray color */
  DarkGray = 0x979c9f,

  /** Light Gray color */
  LightGray = 0xbcc0c0,

  /** Blurple color - Discord's brand color */
  Blurple = 0x5865f2,

  /** Greyple color - Discord's secondary color */
  Greyple = 0x99aab5,

  /** Dark Theme background color */
  DarkTheme = 0x36393f,

  /** Fuchsia color */
  Fuchsia = 0xeb459e,

  /** Discord brand color */
  DiscordBrand = 0x5865f2,
}

/**
 * Zod validator for a color value.
 * Accepts various color formats and converts them to a numeric representation.
 */
export const ColorSchema = z.union([
  z.number().int().nonnegative().max(0xffffff),
  z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  z.tuple([
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
  ]),
  z.enum(Colors),
]) satisfies z.ZodType<ColorResolvable, ColorResolvable>;

/**
 * Resolves a color to a numerical value.
 *
 * @param color The color to resolve. Can be a number, a hex string, an RGB array, or a predefined color name.
 * @returns The numerical representation of the color.
 * @throws {Error} If the provided color is invalid after Zod validation.
 * @throws {Error} If a Zod error occurs during validation, a formatted error is thrown.
 */
export function resolveColor(color: ColorResolvable): number {
  // Use colorSchema to validate but handle the conversions manually
  try {
    ColorSchema.parse(color);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Re-throw a more readable error if Zod validation fails
      throw new Error(z.prettifyError(error));
    }

    // Re-throw any other error
    throw error;
  }

  // If the color is already a number, return it directly
  if (typeof color === "number") {
    return color;
  }

  // If the color is an [R, G, B] array
  if (Array.isArray(color)) {
    // Convert RGB array to numeric value
    return (color[0] << 16) + (color[1] << 8) + color[2];
  }

  // If the color is a hex string (e.g., "#RRGGBB")
  if (color.startsWith("#")) {
    // Convert hex string to numeric value
    return Number.parseInt(color.slice(1), 16);
  }

  // Handle named colors (members of the Colors enum)
  if (color in Colors) {
    return Colors[color as keyof typeof Colors];
  }

  // This case should never be reached due to the Zod validation above.
  // Included for safety to cover all possible code paths.
  throw new Error(`Invalid color: ${color}`);
}
