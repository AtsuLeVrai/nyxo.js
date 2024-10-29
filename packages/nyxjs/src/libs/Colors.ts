import type { Integer } from "@nyxjs/core";

export type RGB = [red: Integer, green: Integer, blue: Integer];
export type HexColorString = `#${string}`;
export type ColorResolvable = HexColorString | Integer | RGB;

export class Colors {
    static AliceBlue = 0xf0f8ff;

    static AntiqueWhite = 0xfaebd7;

    static Aqua = 0x00ffff;

    static Aquamarine = 0x7fffd4;

    static Black = 0x000000;

    static Blue = 0x5865f2;

    static BlueViolet = 0x8a2be2;

    static Brown = 0xa52a2a;

    static BurlyWood = 0xdeb887;

    static CadetBlue = 0x5f9ea0;

    static Chartreuse = 0x7fff00;

    static Chocolate = 0xd2691e;

    static Coral = 0xff7f50;

    static CornflowerBlue = 0x6495ed;

    static Crimson = 0xdc143c;

    static DarkBlue = 0x00008b;

    static DarkCyan = 0x008b8b;

    static DarkGoldenRod = 0xb8860b;

    static DarkGray = 0xa9a9a9;

    static DarkGreen = 0x006400;

    static DarkKhaki = 0xbdb76b;

    static DarkMagenta = 0x8b008b;

    static DarkOliveGreen = 0x556b2f;

    static DarkOrange = 0xff8c00;

    static DarkRed = 0x8b0000;

    static DarkSalmon = 0xe9967a;

    static DarkSeaGreen = 0x8fbc8f;

    static DarkSlateBlue = 0x483d8b;

    static DarkSlateGray = 0x2f4f4f;

    static DarkTurquoise = 0x00ced1;

    static DarkViolet = 0x9400d3;

    static DeepPink = 0xff1493;

    static DeepSkyBlue = 0x00bfff;

    static DimGray = 0x696969;

    static DodgerBlue = 0x1e90ff;

    static ForestGreen = 0x228b22;

    static Fuchsia = 0xeb459e;

    static Gainsboro = 0xdcdcdc;

    static Gold = 0xffd700;

    static GoldenRod = 0xdaa520;

    static Gray = 0x808080;

    static Green = 0x57f287;

    static GreenYellow = 0xadff2f;

    static HotPink = 0xff69b4;

    static IndianRed = 0xcd5c5c;

    static Indigo = 0x4b0082;

    static Khaki = 0xf0e68c;

    static LightBlue = 0xadd8e6;

    static LightGreen = 0x90ee90;

    static LightPink = 0xffb6c1;

    static LightSeaGreen = 0x20b2aa;

    static LightSkyBlue = 0x87cefa;

    static Lime = 0x00ff00;

    static LimeGreen = 0x32cd32;

    static Magenta = 0xff00ff;

    static MediumAquaMarine = 0x66cdaa;

    static MediumBlue = 0x0000cd;

    static MediumOrchid = 0xba55d3;

    static MediumPurple = 0x9370db;

    static MediumSeaGreen = 0x3cb371;

    static MediumSpringGreen = 0x00fa9a;

    static MediumTurquoise = 0x48d1cc;

    static MediumVioletRed = 0xc71585;

    static MidnightBlue = 0x191970;

    static NavajoWhite = 0xffdead;

    static Olive = 0x808000;

    static OliveDrab = 0x6b8e23;

    static OrangeRed = 0xff4500;

    static Orchid = 0xda70d6;

    static PaleVioletRed = 0xdb7093;

    static Peru = 0xcd853f;

    static Plum = 0xdda0dd;

    static RebeccaPurple = 0x663399;

    static Red = 0xed4245;

    static RosyBrown = 0xbc8f8f;

    static SaddleBrown = 0x8b4513;

    static SandyBrown = 0xf4a460;

    static SeaGreen = 0x2e8b57;

    static Silver = 0xc0c0c0;

    static SlateBlue = 0x6a5acd;

    static SteelBlue = 0x4682b4;

    static Violet = 0xee82ee;

    static Yellow = 0xfee75c;

    static YellowGreen = 0x9acd32;

    static resolve(color: ColorResolvable): Integer {
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

    static toHex(color: Integer): HexColorString {
        return `#${color.toString(16).padStart(6, "0")}`;
    }

    static toRGB(color: Integer): RGB {
        return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
    }

    static invert(color: Integer): Integer {
        return 0xffffff - color;
    }

    static invertRGB(color: RGB): RGB {
        return [255 - color[0], 255 - color[1], 255 - color[2]];
    }

    static lighten(color: Integer, amount: number): Integer {
        const r = Math.min(255, (color >> 16) + 255 * amount);
        const g = Math.min(255, ((color >> 8) & 0xff) + 255 * amount);
        const b = Math.min(255, (color & 0xff) + 255 * amount);
        return (r << 16) + (g << 8) + b;
    }

    static random(): Integer {
        return Math.floor(Math.random() * 0xffffff);
    }
}
