import type { Integer } from "@nyxjs/core";

export type RGB = [red: Integer, green: Integer, blue: Integer];
export type HexColorString = `#${string}`;
export type ColorResolvable = HexColorString | Integer | RGB;

export class Colors {
    public static AliceBlue = 0xf0f8ff;

    public static AntiqueWhite = 0xfaebd7;

    public static Aqua = 0x00ffff;

    public static Aquamarine = 0x7fffd4;

    public static Azure = 0xf0ffff;

    public static Beige = 0xf5f5dc;

    public static Bisque = 0xffe4c4;

    public static Black = 0x000000;

    public static BlanchedAlmond = 0xffebcd;

    public static Blue = 0x5865f2;

    public static BlueViolet = 0x8a2be2;

    public static Brown = 0xa52a2a;

    public static BurlyWood = 0xdeb887;

    public static CadetBlue = 0x5f9ea0;

    public static Chartreuse = 0x7fff00;

    public static Chocolate = 0xd2691e;

    public static Coral = 0xff7f50;

    public static CornflowerBlue = 0x6495ed;

    public static Cornsilk = 0xfff8dc;

    public static Crimson = 0xdc143c;

    public static DarkBlue = 0x00008b;

    public static DarkCyan = 0x008b8b;

    public static DarkGoldenRod = 0xb8860b;

    public static DarkGray = 0xa9a9a9;

    public static DarkGreen = 0x006400;

    public static DarkKhaki = 0xbdb76b;

    public static DarkMagenta = 0x8b008b;

    public static DarkOliveGreen = 0x556b2f;

    public static DarkOrange = 0xff8c00;

    public static DarkOrchid = 0x9932cc;

    public static DarkRed = 0x8b0000;

    public static DarkSalmon = 0xe9967a;

    public static DarkSeaGreen = 0x8fbc8f;

    public static DarkSlateBlue = 0x483d8b;

    public static DarkSlateGray = 0x2f4f4f;

    public static DarkTurquoise = 0x00ced1;

    public static DarkViolet = 0x9400d3;

    public static DeepPink = 0xff1493;

    public static DeepSkyBlue = 0x00bfff;

    public static DimGray = 0x696969;

    public static DodgerBlue = 0x1e90ff;

    public static FireBrick = 0xb22222;

    public static FloralWhite = 0xfffaf0;

    public static ForestGreen = 0x228b22;

    public static Fuchsia = 0xeb459e;

    public static Gainsboro = 0xdcdcdc;

    public static GhostWhite = 0xf8f8ff;

    public static Gold = 0xffd700;

    public static GoldenRod = 0xdaa520;

    public static Gray = 0x808080;

    public static Green = 0x57f287;

    public static GreenYellow = 0xadff2f;

    public static HoneyDew = 0xf0fff0;

    public static HotPink = 0xff69b4;

    public static IndianRed = 0xcd5c5c;

    public static Indigo = 0x4b0082;

    public static Ivory = 0xfffff0;

    public static Khaki = 0xf0e68c;

    public static Lavender = 0xe6e6fa;

    public static LavenderBlush = 0xfff0f5;

    public static LawnGreen = 0x7cfc00;

    public static LemonChiffon = 0xfffacd;

    public static LightBlue = 0xadd8e6;

    public static LightCoral = 0xf08080;

    public static LightCyan = 0xe0ffff;

    public static LightGoldenRodYellow = 0xfafad2;

    public static LightGray = 0xd3d3d3;

    public static LightGreen = 0x90ee90;

    public static LightPink = 0xffb6c1;

    public static LightSalmon = 0xffa07a;

    public static LightSeaGreen = 0x20b2aa;

    public static LightSkyBlue = 0x87cefa;

    public static LightSlateGray = 0x778899;

    public static LightSteelBlue = 0xb0c4de;

    public static LightYellow = 0xffffe0;

    public static Lime = 0x00ff00;

    public static LimeGreen = 0x32cd32;

    public static Linen = 0xfaf0e6;

    public static Magenta = 0xff00ff;

    public static Maroon = 0x800000;

    public static MediumAquaMarine = 0x66cdaa;

    public static MediumBlue = 0x0000cd;

    public static MediumOrchid = 0xba55d3;

    public static MediumPurple = 0x9370db;

    public static MediumSeaGreen = 0x3cb371;

    public static MediumSlateBlue = 0x7b68ee;

    public static MediumSpringGreen = 0x00fa9a;

    public static MediumTurquoise = 0x48d1cc;

    public static MediumVioletRed = 0xc71585;

    public static MidnightBlue = 0x191970;

    public static MintCream = 0xf5fffa;

    public static MistyRose = 0xffe4e1;

    public static Moccasin = 0xffe4b5;

    public static NavajoWhite = 0xffdead;

    public static Navy = 0x000080;

    public static OldLace = 0xfdf5e6;

    public static Olive = 0x808000;

    public static OliveDrab = 0x6b8e23;

    public static Orange = 0xffa500;

    public static OrangeRed = 0xff4500;

    public static Orchid = 0xda70d6;

    public static PaleGoldenRod = 0xeee8aa;

    public static PaleGreen = 0x98fb98;

    public static PaleTurquoise = 0xafeeee;

    public static PaleVioletRed = 0xdb7093;

    public static PapayaWhip = 0xffefd5;

    public static PeachPuff = 0xffdab9;

    public static Peru = 0xcd853f;

    public static Pink = 0xffc0cb;

    public static Plum = 0xdda0dd;

    public static PowderBlue = 0xb0e0e6;

    public static Purple = 0x800080;

    public static RebeccaPurple = 0x663399;

    public static Red = 0xed4245;

    public static RosyBrown = 0xbc8f8f;

    public static RoyalBlue = 0x4169e1;

    public static SaddleBrown = 0x8b4513;

    public static Salmon = 0xfa8072;

    public static SandyBrown = 0xf4a460;

    public static SeaGreen = 0x2e8b57;

    public static SeaShell = 0xfff5ee;

    public static Sienna = 0xa0522d;

    public static Silver = 0xc0c0c0;

    public static SkyBlue = 0x87ceeb;

    public static SlateBlue = 0x6a5acd;

    public static SlateGray = 0x708090;

    public static Snow = 0xfffafa;

    public static SpringGreen = 0x00ff7f;

    public static SteelBlue = 0x4682b4;

    public static Tan = 0xd2b48c;

    public static Teal = 0x008080;

    public static Thistle = 0xd8bfd8;

    public static Tomato = 0xff6347;

    public static Turquoise = 0x40e0d0;

    public static Violet = 0xee82ee;

    public static Wheat = 0xf5deb3;

    public static White = 0xffffff;

    public static WhiteSmoke = 0xf5f5f5;

    public static Yellow = 0xfee75c;

    public static YellowGreen = 0x9acd32;

    public static resolve(color: ColorResolvable): Integer {
        if (typeof color === "string") {
            if (color.startsWith("#")) {
                return Number.parseInt(color.slice(1), 16);
            }

            throw new TypeError("Invalid color string.");
        }

        if (Array.isArray(color)) {
            return (color[0] << 16) + (color[1] << 8) + color[2];
        }

        return color;
    }
}
