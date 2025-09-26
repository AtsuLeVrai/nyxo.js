/**
 * Flexible color input type supporting multiple formats for maximum compatibility.
 * Accepts hex numbers, hex strings, RGB tuples, or predefined Colors enum values.
 *
 * @see {@link Colors} for predefined color constants
 * @see {@link resolveColor} for color resolution implementation
 */
export type ColorResolvable = number | string | [red: number, green: number, blue: number] | Colors;

/**
 * Comprehensive color palette with Discord-inspired colors and common web colors.
 * All values are hexadecimal numbers for direct use in styling and graphics APIs.
 *
 * @see {@link https://discord.com/branding} for Discord brand color guidelines
 */
export enum Colors {
  /** Default Discord blurple color */
  Default = 0x5865f2,
  /** Pure white */
  White = 0xffffff,
  /** Pure black */
  Black = 0x000000,
  /** Bright red for errors and warnings */
  Red = 0xed4245,
  /** Success green color */
  Green = 0x57f287,
  /** Primary blue color */
  Blue = 0x3498db,
  /** Warning yellow color */
  Yellow = 0xfee75c,
  /** Orange accent color */
  Orange = 0xe67e22,
  /** Purple accent color */
  Purple = 0x9b59b6,
  /** Pink accent color */
  Pink = 0xeb459e,
  /** Gold/yellow variant */
  Gold = 0xf1c40f,
  /** Dark navy blue */
  Navy = 0x34495e,
  /** Dark aqua/teal color */
  DarkAqua = 0x11806a,
  /** Dark green variant */
  DarkGreen = 0x1f8b4c,
  /** Dark blue variant */
  DarkBlue = 0x206694,
  /** Dark purple variant */
  DarkPurple = 0x71368a,
  /** Dark orange variant */
  DarkOrange = 0xa84300,
  /** Dark red variant */
  DarkRed = 0x992d22,
  /** Standard gray */
  Gray = 0x95a5a6,
  /** Dark gray variant */
  DarkGray = 0x979c9f,
  /** Light gray variant */
  LightGray = 0xbcc0c0,
  /** Discord's signature blurple */
  Blurple = 0x5865f2,
  /** Discord's greyple color */
  Greyple = 0x99aab5,
  /** Discord dark theme background */
  DarkTheme = 0x36393f,
  /** Fuchsia/magenta color */
  Fuchsia = 0xeb459e,
  /** Official Discord brand color */
  DiscordBrand = 0x5865f2,
}

/**
 * Resolves various color input formats into a standardized hexadecimal number.
 * Supports hex numbers, hex strings (with or without #), RGB tuples, and Colors enum values.
 *
 * @param color - Color input in any supported format
 * @returns Resolved color as hexadecimal number (0x000000 to 0xFFFFFF)
 * @throws {Error} When color format is invalid or unrecognized
 *
 * @see {@link ColorResolvable} for supported input formats
 * @see {@link Colors} for predefined color constants
 */
export function resolveColor(color: ColorResolvable): number {
  // Handle direct hex number input
  if (typeof color === "number") {
    return color;
  }

  // Handle RGB tuple [r, g, b] format
  if (Array.isArray(color)) {
    // Convert RGB tuple to hex using bitwise operations
    const [red, green, blue] = color;
    return (red << 16) + (green << 8) + blue;
  }

  // Handle hex string format (e.g., "#FF0000" or "FF0000")
  if (typeof color === "string") {
    if (color.startsWith("#")) {
      return Number.parseInt(color.slice(1), 16);
    }

    // Check if it's a valid Colors enum key
    if (color in Colors) {
      return Colors[color as keyof typeof Colors];
    }
  }

  // Invalid color format
  throw new Error(
    `Invalid color format: ${color}. Expected hex number, hex string, RGB tuple, or Colors enum value.`,
  );
}
