export type ColorResolvable = number | string | [red: number, green: number, blue: number] | Colors;

export enum Colors {
  Default = 0x5865f2,
  White = 0xffffff,
  Black = 0x000000,
  Red = 0xed4245,
  Green = 0x57f287,
  Blue = 0x3498db,
  Yellow = 0xfee75c,
  Orange = 0xe67e22,
  Purple = 0x9b59b6,
  Pink = 0xeb459e,
  Gold = 0xf1c40f,
  Navy = 0x34495e,
  DarkAqua = 0x11806a,
  DarkGreen = 0x1f8b4c,
  DarkBlue = 0x206694,
  DarkPurple = 0x71368a,
  DarkOrange = 0xa84300,
  DarkRed = 0x992d22,
  Gray = 0x95a5a6,
  DarkGray = 0x979c9f,
  LightGray = 0xbcc0c0,
  Blurple = 0x5865f2,
  Greyple = 0x99aab5,
  DarkTheme = 0x36393f,
  Fuchsia = 0xeb459e,
  DiscordBrand = 0x5865f2,
}

export function resolveColor(color: ColorResolvable): number {
  if (typeof color === "number") {
    return color;
  }
  if (Array.isArray(color)) {
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
