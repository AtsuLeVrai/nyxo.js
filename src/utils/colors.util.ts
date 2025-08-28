/**
 * @description Predefined color constants for Discord embeds, roles, and UI elements. All values are hexadecimal integers compatible with Discord's color system.
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object}
 */
export enum Colors {
  /** Discord's signature blurple brand color */
  Default = 0x5865f2,
  /** Pure white for high contrast elements */
  White = 0xffffff,
  /** Pure black for dark themes */
  Black = 0x000000,
  /** Standard error/danger red */
  Red = 0xed4245,
  /** Success/positive action green */
  Green = 0x57f287,
  /** Information/neutral blue */
  Blue = 0x3498db,
  /** Warning/caution yellow */
  Yellow = 0xfee75c,
  /** Alert/notification orange */
  Orange = 0xe67e22,
  /** Premium/special purple */
  Purple = 0x9b59b6,
  /** Accent/highlight pink */
  Pink = 0xeb459e,
  /** Achievement/reward gold */
  Gold = 0xf1c40f,
  /** Professional/corporate navy */
  Navy = 0x34495e,
  /** Darker aqua variant */
  DarkAqua = 0x11806a,
  /** Darker success green */
  DarkGreen = 0x1f8b4c,
  /** Darker information blue */
  DarkBlue = 0x206694,
  /** Darker premium purple */
  DarkPurple = 0x71368a,
  /** Darker alert orange */
  DarkOrange = 0xa84300,
  /** Darker error red */
  DarkRed = 0x992d22,
  /** Standard neutral gray */
  Gray = 0x95a5a6,
  /** Darker neutral gray */
  DarkGray = 0x979c9f,
  /** Lighter neutral gray */
  LightGray = 0xbcc0c0,
  /** Discord's signature blurple (alias) */
  Blurple = 0x5865f2,
  /** Discord's secondary gray color */
  Greyple = 0x99aab5,
  /** Discord dark theme background */
  DarkTheme = 0x36393f,
  /** Bright fuchsia accent (alias for Pink) */
  Fuchsia = 0xeb459e,
  /** Official Discord brand color (alias) */
  DiscordBrand = 0x5865f2,
}

/**
 * @description Flexible input type for Discord color resolution, supporting multiple formats including hex numbers, hex strings, RGB tuples, and predefined color constants.
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object}
 */
export type ColorResolvable = number | string | [red: number, green: number, blue: number] | Colors;

/**
 * @description Converts various color input formats to Discord-compatible hexadecimal integer format. Supports direct numbers, hex strings with or without hash prefix, RGB tuples, and predefined color constants.
 * @see {@link https://discord.com/developers/docs/resources/channel#embed-object}
 *
 * @param color - Color input in any supported format (number, hex string, RGB tuple, or Colors enum)
 * @returns Hexadecimal integer value compatible with Discord's color system (0x000000 to 0xFFFFFF)
 * @throws {Error} When color format is invalid or cannot be resolved
 */
export function resolveColor(color: ColorResolvable): number {
  if (typeof color === "number") {
    return color;
  }
  if (Array.isArray(color)) {
    // Convert RGB tuple to hex using bitwise operations
    return (color[0] << 16) + (color[1] << 8) + color[2];
  }
  if (color.startsWith("#")) {
    return Number.parseInt(color.slice(1), 16);
  }
  if (color in Colors) {
    return Colors[color as keyof typeof Colors];
  }
  throw new Error(`Invalid color: ${color}`);
}
