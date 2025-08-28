import { describe, expect, it } from "vitest";
import { type ColorResolvable, Colors, resolveColor } from "./colors.util.js";

describe("Colors Utilities", () => {
  describe("Colors enum", () => {
    it("should have correct hex values for brand colors", () => {
      expect(Colors.Default).toBe(0x5865f2);
      expect(Colors.Blurple).toBe(0x5865f2);
      expect(Colors.DiscordBrand).toBe(0x5865f2);
    });

    it("should have correct basic color values", () => {
      expect(Colors.White).toBe(0xffffff);
      expect(Colors.Black).toBe(0x000000);
      expect(Colors.Red).toBe(0xed4245);
      expect(Colors.Green).toBe(0x57f287);
      expect(Colors.Blue).toBe(0x3498db);
    });

    it("should have correct accent colors", () => {
      expect(Colors.Yellow).toBe(0xfee75c);
      expect(Colors.Orange).toBe(0xe67e22);
      expect(Colors.Purple).toBe(0x9b59b6);
      expect(Colors.Pink).toBe(0xeb459e);
      expect(Colors.Gold).toBe(0xf1c40f);
    });

    it("should have correct dark variants", () => {
      expect(Colors.DarkRed).toBe(0x992d22);
      expect(Colors.DarkGreen).toBe(0x1f8b4c);
      expect(Colors.DarkBlue).toBe(0x206694);
      expect(Colors.DarkPurple).toBe(0x71368a);
      expect(Colors.DarkOrange).toBe(0xa84300);
    });

    it("should have correct gray variants", () => {
      expect(Colors.Gray).toBe(0x95a5a6);
      expect(Colors.DarkGray).toBe(0x979c9f);
      expect(Colors.LightGray).toBe(0xbcc0c0);
      expect(Colors.Greyple).toBe(0x99aab5);
    });

    it("should have correct theme and special colors", () => {
      expect(Colors.Navy).toBe(0x34495e);
      expect(Colors.DarkAqua).toBe(0x11806a);
      expect(Colors.DarkTheme).toBe(0x36393f);
      expect(Colors.Fuchsia).toBe(0xeb459e);
    });

    it("should have consistent aliases", () => {
      expect(Colors.Default).toBe(Colors.Blurple);
      expect(Colors.Blurple).toBe(Colors.DiscordBrand);
      expect(Colors.Pink).toBe(Colors.Fuchsia);
    });
  });

  describe("resolveColor", () => {
    describe("number input", () => {
      it("should return number as-is", () => {
        expect(resolveColor(0x5865f2)).toBe(0x5865f2);
        expect(resolveColor(0xffffff)).toBe(0xffffff);
        expect(resolveColor(0x000000)).toBe(0x000000);
      });

      it("should handle large hex numbers", () => {
        expect(resolveColor(16777215)).toBe(16777215); // 0xFFFFFF
        expect(resolveColor(5793842)).toBe(5793842); // 0x5865F2
      });

      it("should handle zero", () => {
        expect(resolveColor(0)).toBe(0);
      });
    });

    describe("RGB tuple input", () => {
      it("should convert RGB to hex correctly", () => {
        expect(resolveColor([255, 255, 255])).toBe(0xffffff);
        expect(resolveColor([0, 0, 0])).toBe(0x000000);
        expect(resolveColor([255, 0, 0])).toBe(0xff0000);
        expect(resolveColor([0, 255, 0])).toBe(0x00ff00);
        expect(resolveColor([0, 0, 255])).toBe(0x0000ff);
      });

      it("should handle Discord brand color RGB", () => {
        expect(resolveColor([88, 101, 242])).toBe(0x5865f2);
      });

      it("should handle mixed RGB values", () => {
        expect(resolveColor([128, 64, 192])).toBe(0x8040c0);
        expect(resolveColor([237, 66, 69])).toBe(0xed4245); // Discord Red
      });

      it("should handle edge RGB values", () => {
        expect(resolveColor([1, 2, 3])).toBe(0x010203);
        expect(resolveColor([254, 253, 252])).toBe(0xfefdfc);
      });
    });

    describe("hex string input", () => {
      it("should parse hex strings with hash", () => {
        expect(resolveColor("#ffffff")).toBe(0xffffff);
        expect(resolveColor("#000000")).toBe(0x000000);
        expect(resolveColor("#5865f2")).toBe(0x5865f2);
        expect(resolveColor("#FF0000")).toBe(0xff0000);
      });

      it("should handle uppercase and lowercase hex", () => {
        expect(resolveColor("#ABCDEF")).toBe(0xabcdef);
        expect(resolveColor("#abcdef")).toBe(0xabcdef);
        expect(resolveColor("#AbCdEf")).toBe(0xabcdef);
      });

      it("should handle short hex values", () => {
        expect(resolveColor("#123")).toBe(0x123);
        expect(resolveColor("#abc")).toBe(0xabc);
        expect(resolveColor("#000")).toBe(0x000);
      });

      it("should handle hex with leading zeros", () => {
        expect(resolveColor("#000001")).toBe(0x000001);
        expect(resolveColor("#001122")).toBe(0x001122);
      });
    });

    describe("Colors enum input", () => {
      it("should resolve enum values by key", () => {
        expect(resolveColor("Default" as keyof typeof Colors)).toBe(0x5865f2);
        expect(resolveColor("White" as keyof typeof Colors)).toBe(0xffffff);
        expect(resolveColor("Black" as keyof typeof Colors)).toBe(0x000000);
        expect(resolveColor("Red" as keyof typeof Colors)).toBe(0xed4245);
        expect(resolveColor("Green" as keyof typeof Colors)).toBe(0x57f287);
      });

      it("should resolve all enum colors", () => {
        const colorKeys: (keyof typeof Colors)[] = [
          "Default",
          "White",
          "Black",
          "Red",
          "Green",
          "Blue",
          "Yellow",
          "Orange",
          "Purple",
          "Pink",
          "Gold",
          "Navy",
          "DarkAqua",
          "DarkGreen",
          "DarkBlue",
          "DarkPurple",
          "DarkOrange",
          "DarkRed",
          "Gray",
          "DarkGray",
          "LightGray",
          "Blurple",
          "Greyple",
          "DarkTheme",
          "Fuchsia",
          "DiscordBrand",
        ];

        for (const key of colorKeys) {
          const resolved = resolveColor(key);
          expect(resolved).toBe(Colors[key]);
          expect(typeof resolved).toBe("number");
        }
      });

      it("should handle enum aliases correctly", () => {
        expect(resolveColor("Blurple" as keyof typeof Colors)).toBe(Colors.Default);
        expect(resolveColor("DiscordBrand" as keyof typeof Colors)).toBe(Colors.Default);
        expect(resolveColor("Fuchsia" as keyof typeof Colors)).toBe(Colors.Pink);
      });
    });

    describe("error handling", () => {
      it("should throw for invalid hex strings", () => {
        expect(() => resolveColor("invalid")).toThrow(Error);
        expect(() => resolveColor("invalid")).toThrow("Invalid color: invalid");
      });

      it("should throw for hex strings without hash", () => {
        expect(() => resolveColor("ffffff")).toThrow(Error);
        expect(() => resolveColor("5865f2")).toThrow(Error);
      });

      it("should throw for invalid color names", () => {
        expect(() => resolveColor("NotAColor" as keyof typeof Colors)).toThrow(Error);
        expect(() => resolveColor("invalidColor" as keyof typeof Colors)).toThrow(Error);
      });

      it("should throw for empty string", () => {
        expect(() => resolveColor("")).toThrow(Error);
      });

      it("should return NaN for malformed hex", () => {
        expect(resolveColor("#")).toBe(Number.NaN);
        expect(resolveColor("#gg")).toBe(Number.NaN);
        expect(resolveColor("#xyz")).toBe(Number.NaN);
      });

      it("should provide descriptive error messages", () => {
        expect(() => resolveColor("badcolor")).toThrow("Invalid color: badcolor");
        expect(() => resolveColor("notfound")).toThrow("Invalid color: notfound");
      });
    });

    describe("type safety", () => {
      it("should accept all ColorResolvable types", () => {
        const numberColor: ColorResolvable = 0x5865f2;
        const stringColor: ColorResolvable = "#5865f2";
        const tupleColor: ColorResolvable = [88, 101, 242];
        const enumColor: ColorResolvable = Colors.Default;

        expect(() => resolveColor(numberColor)).not.toThrow();
        expect(() => resolveColor(stringColor)).not.toThrow();
        expect(() => resolveColor(tupleColor)).not.toThrow();
        expect(() => resolveColor(enumColor)).not.toThrow();
      });

      it("should return number type", () => {
        const result = resolveColor(Colors.Default);
        expect(typeof result).toBe("number");
        expect(Number.isInteger(result)).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle maximum color value", () => {
        expect(resolveColor([255, 255, 255])).toBe(0xffffff);
        expect(resolveColor("#ffffff")).toBe(0xffffff);
        expect(resolveColor(0xffffff)).toBe(0xffffff);
      });

      it("should handle minimum color value", () => {
        expect(resolveColor([0, 0, 0])).toBe(0x000000);
        expect(resolveColor("#000000")).toBe(0x000000);
        expect(resolveColor(0x000000)).toBe(0x000000);
      });

      it("should maintain precision for specific values", () => {
        // Test Discord's exact brand color
        expect(resolveColor([88, 101, 242])).toBe(5793266); // 0x5865f2
        expect(resolveColor("#5865f2")).toBe(5793266);
        expect(resolveColor(Colors.Default)).toBe(5793266);
      });
    });
  });

  describe("integration tests", () => {
    it("should work with Discord embed colors", () => {
      // Common Discord embed color patterns
      const successColor = resolveColor(Colors.Green);
      const errorColor = resolveColor(Colors.Red);
      const infoColor = resolveColor(Colors.Blue);
      const warningColor = resolveColor(Colors.Yellow);

      expect(successColor).toBe(0x57f287);
      expect(errorColor).toBe(0xed4245);
      expect(infoColor).toBe(0x3498db);
      expect(warningColor).toBe(0xfee75c);
    });

    it("should handle color conversion consistency", () => {
      // Same color in different formats should resolve to same value
      const brandColor = 0x5865f2;

      expect(resolveColor(brandColor)).toBe(brandColor);
      expect(resolveColor("#5865f2")).toBe(brandColor);
      expect(resolveColor([88, 101, 242])).toBe(brandColor);
      expect(resolveColor(Colors.Default)).toBe(brandColor);
    });

    it("should work with role color assignments", () => {
      // Common role colors
      const adminColor = resolveColor(Colors.Red);
      const moderatorColor = resolveColor(Colors.Orange);
      const memberColor = resolveColor(Colors.Blue);
      const botColor = resolveColor(Colors.Blurple);

      expect(adminColor).toBeGreaterThan(0);
      expect(moderatorColor).toBeGreaterThan(0);
      expect(memberColor).toBeGreaterThan(0);
      expect(botColor).toBeGreaterThan(0);
    });

    it("should handle theme color variations", () => {
      const lightTheme = resolveColor(Colors.White);
      const darkTheme = resolveColor(Colors.DarkTheme);

      expect(lightTheme).toBe(0xffffff);
      expect(darkTheme).toBe(0x36393f);
      expect(lightTheme).toBeGreaterThan(darkTheme);
    });
  });
});
