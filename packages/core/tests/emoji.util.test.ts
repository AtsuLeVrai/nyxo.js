import { describe, expect, it } from "vitest";
import {
  type EmojiResolvable,
  decodeEmoji,
  encodeEmoji,
  resolveEmoji,
} from "../src/index.js";

describe("Emoji Utilities", () => {
  describe("resolveEmoji", () => {
    it("should resolve standard unicode emojis", () => {
      const result = resolveEmoji("🔥");
      expect(result).toEqual({
        name: "🔥",
        id: null,
        animated: false,
      });
    });

    it("should resolve custom emojis in Discord format", () => {
      const result = resolveEmoji("<:discord:1234567890>");
      expect(result).toEqual({
        name: "discord",
        id: "1234567890",
        animated: false,
      });
    });

    it("should resolve animated custom emojis", () => {
      const result = resolveEmoji("<a:blob:9876543210>");
      expect(result).toEqual({
        name: "blob",
        id: "9876543210",
        animated: true,
      });
    });

    it("should resolve emoji objects", () => {
      const emoji = {
        name: "test",
        id: "12345",
        animated: true,
      };
      const result = resolveEmoji(emoji);
      expect(result).toEqual(emoji);
    });

    it("should resolve partial emoji objects", () => {
      const partialEmoji = { name: "partial" };
      const result = resolveEmoji(partialEmoji);
      expect(result).toEqual({
        name: "partial",
        id: null,
        animated: false,
      });
    });

    it("should resolve emojis in name:id format", () => {
      const result = resolveEmoji("emoji:5551234");
      expect(result).toEqual({
        name: "emoji",
        id: "5551234",
        animated: false,
      });
    });

    it("should throw error for invalid emoji formats", () => {
      expect(() => resolveEmoji({} as EmojiResolvable)).toThrow(
        "Invalid emoji format",
      );
      expect(() => resolveEmoji(null as unknown as EmojiResolvable)).toThrow(
        "Cannot use 'in' operator to search for 'name' in null",
      );
      expect(() =>
        resolveEmoji(undefined as unknown as EmojiResolvable),
      ).toThrow("Cannot use 'in' operator to search for 'name' in undefined");
    });
  });

  describe("encodeEmoji", () => {
    it("should encode unicode emojis", () => {
      expect(encodeEmoji("🔥")).toBe("%F0%9F%94%A5");
      expect(encodeEmoji("👍")).toBe("%F0%9F%91%8D");
    });

    it("should encode custom emojis from Discord format", () => {
      expect(encodeEmoji("<:discord:1234567890>")).toBe("discord%3A1234567890");
    });

    it("should encode animated custom emojis", () => {
      expect(encodeEmoji("<a:blob:9876543210>")).toBe("blob%3A9876543210");
    });

    it("should encode emoji objects", () => {
      expect(encodeEmoji({ name: "test", id: "12345" })).toBe("test%3A12345");
    });

    it("should encode unicode emoji objects", () => {
      expect(encodeEmoji({ name: "🎉", id: null })).toBe("%F0%9F%8E%89");
    });

    it("should handle emojis with special characters in name", () => {
      expect(encodeEmoji({ name: "cool-emoji", id: "12345" })).toBe(
        "cool-emoji%3A12345",
      );
      expect(encodeEmoji({ name: "emoji_with_underscore", id: "67890" })).toBe(
        "emoji_with_underscore%3A67890",
      );
    });
  });

  describe("decodeEmoji", () => {
    it("should decode encoded unicode emojis", () => {
      const result = decodeEmoji("%F0%9F%94%A5");
      expect(result).toEqual({
        name: "🔥",
        id: null,
        animated: false,
      });
    });

    it("should decode encoded custom emojis", () => {
      const result = decodeEmoji("discord%3A1234567890");
      expect(result).toEqual({
        name: "discord",
        id: "1234567890",
        animated: false,
      });
    });

    it("should handle special characters in decoded names", () => {
      const result = decodeEmoji("cool-emoji%3A12345");
      expect(result).toEqual({
        name: "cool-emoji",
        id: "12345",
        animated: false,
      });
    });

    it("should handle problematic encoded characters", () => {
      // Space in name
      const result = decodeEmoji("cool%20emoji%3A12345");
      expect(result).toEqual({
        name: "cool emoji",
        id: "12345",
        animated: false,
      });
    });

    it("should set animated to false for custom emojis when decoding", () => {
      // Note: The encoded format doesn't contain animation information
      const result = decodeEmoji("animated%3A12345");
      expect(result.animated).toBe(false);
    });
  });

  describe("End-to-end scenarios", () => {
    it("should correctly encode and then decode an emoji", () => {
      const original = "🎮";
      const encoded = encodeEmoji(original);
      const decoded = decodeEmoji(encoded);

      expect(decoded.name).toBe(original);
      expect(decoded.id).toBeNull();
    });

    it("should correctly encode and then decode a custom emoji", () => {
      const original = { name: "discord", id: "1234567890", animated: true };
      const encoded = encodeEmoji(original);
      const decoded = decodeEmoji(encoded);

      expect(decoded.name).toBe(original.name);
      expect(decoded.id).toBe(original.id);
      // Note: Animation information is lost in the encoding process
      expect(decoded.animated).toBe(false);
    });

    it("should correctly resolve, encode and decode a Discord format emoji", () => {
      const original = "<:discord:1234567890>";
      const resolved = resolveEmoji(original);
      const encoded = encodeEmoji(original);
      const decoded = decodeEmoji(encoded);

      expect(resolved.name).toBe("discord");
      expect(resolved.id).toBe("1234567890");
      expect(encoded).toBe("discord%3A1234567890");
      expect(decoded.name).toBe("discord");
      expect(decoded.id).toBe("1234567890");
    });
  });

  describe("Edge cases", () => {
    it("should handle emoji with empty name", () => {
      expect(() => encodeEmoji({ name: "", id: "12345" })).not.toThrow();
      expect(encodeEmoji({ name: "", id: "12345" })).toBe("%3A12345");
    });

    it("should handle emoji without name but with id", () => {
      const partialEmoji = { id: "12345" } as EmojiResolvable;
      expect(() => resolveEmoji(partialEmoji)).toThrow();
    });

    it("should handle emoji with non-string name", () => {
      const badEmoji = { name: 123 } as unknown as EmojiResolvable;
      const result = resolveEmoji(badEmoji);
      expect(result.name).toBe("123");
    });

    it("should handle emoji with id of 0", () => {
      const result = resolveEmoji({ name: "zero", id: "0" });
      expect(result).toEqual({
        name: "zero",
        id: "0",
        animated: false,
      });
      expect(encodeEmoji(result)).toBe("zero%3A0");
    });

    it("should handle malformed Discord format emojis", () => {
      // Missing closing bracket
      expect(() => resolveEmoji("<:broken:12345")).not.toThrow();
      // Should treat it as a regular string
      const result = resolveEmoji("<:broken:12345");
      expect(result).toEqual({
        name: "<:broken:12345",
        id: null,
        animated: false,
      });
    });
  });
});
