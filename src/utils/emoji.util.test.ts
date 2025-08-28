import { describe, expect, it } from "vitest";
import type { EmojiEntity } from "../resources/index.js";
import {
  decodeEmojiFromReaction,
  type EmojiResolvable,
  encodeEmojiForReaction,
  resolveEmoji,
} from "./emoji.util.js";

describe("Emoji Utilities", () => {
  describe("resolveEmoji", () => {
    it("should resolve Discord format custom emoji", () => {
      const result = resolveEmoji("<:thumbsup:123456789012345678>");
      expect(result).toEqual({
        name: "thumbsup",
        id: "123456789012345678",
        animated: false,
      });
    });

    it("should resolve animated Discord format emoji", () => {
      const result = resolveEmoji("<a:party:987654321098765432>");
      expect(result).toEqual({
        name: "party",
        id: "987654321098765432",
        animated: true,
      });
    });

    it("should resolve plain format custom emoji", () => {
      const result = resolveEmoji("thumbsup:123456789012345678");
      expect(result).toEqual({
        name: "thumbsup",
        id: "123456789012345678",
        animated: false,
      });
    });

    it("should resolve Unicode emoji", () => {
      const result = resolveEmoji("👍");
      expect(result).toEqual({
        name: "👍",
        id: null,
        animated: false,
      });
    });

    it("should resolve plain text", () => {
      const result = resolveEmoji("hello");
      expect(result).toEqual({
        name: "hello",
        id: null,
        animated: false,
      });
    });

    it("should resolve emoji object", () => {
      const emoji: Pick<EmojiEntity, "id" | "name" | "animated"> = {
        id: "123456789012345678",
        name: "smile",
        animated: true,
      };
      const result = resolveEmoji(emoji);
      expect(result).toEqual({
        name: "smile",
        id: "123456789012345678",
        animated: true,
      });
    });

    it("should resolve partial emoji object", () => {
      const emoji = { name: "smile" } as Partial<Pick<EmojiEntity, "id" | "name" | "animated">>;
      const result = resolveEmoji(emoji);
      expect(result).toEqual({
        name: "smile",
        id: null,
        animated: false,
      });
    });

    it("should throw for empty string", () => {
      expect(() => resolveEmoji("")).toThrow(TypeError);
    });

    it("should throw for invalid input", () => {
      expect(() => resolveEmoji(null as unknown as EmojiResolvable)).toThrow(TypeError);
      expect(() => resolveEmoji(undefined as unknown as EmojiResolvable)).toThrow(TypeError);
    });

    it("should treat malformed Discord format as plain text", () => {
      // These don't match the strict regex, so are treated as Unicode/plain text
      expect(resolveEmoji("<:invalid>")).toEqual({
        name: "<:invalid>",
        id: null,
        animated: false,
      });
      expect(resolveEmoji("<:name:>")).toEqual({
        name: "<:name:>",
        id: null,
        animated: false,
      });
      expect(resolveEmoji("<::123>")).toEqual({
        name: "<::123>",
        id: null,
        animated: false,
      });
    });
  });

  describe("encodeEmojiForReaction", () => {
    it("should encode custom emoji", () => {
      const emoji: Pick<EmojiEntity, "id" | "name" | "animated"> = {
        id: "123456789012345678",
        name: "thumbsup",
        animated: false,
      };
      const result = encodeEmojiForReaction(emoji);
      expect(result).toBe("thumbsup%3A123456789012345678");
    });

    it("should encode Unicode emoji", () => {
      const result = encodeEmojiForReaction("👍");
      expect(result).toBe("%F0%9F%91%8D");
    });

    it("should encode plain text", () => {
      const result = encodeEmojiForReaction("hello world");
      expect(result).toBe("hello%20world");
    });

    it("should encode emoji with special characters", () => {
      const emoji: Pick<EmojiEntity, "id" | "name" | "animated"> = {
        id: "123456789012345678",
        name: "emoji!@#",
        animated: false,
      };
      const result = encodeEmojiForReaction(emoji);
      // Only some characters get encoded by encodeURIComponent
      expect(result).toBe("emoji!%40%23%3A123456789012345678");
    });

    it("should encode Unicode emoji from object with null id", () => {
      const emoji: Pick<EmojiEntity, "id" | "name" | "animated"> = {
        id: null,
        name: "👍",
        animated: false,
      };
      const result = encodeEmojiForReaction(emoji);
      expect(result).toBe("%F0%9F%91%8D");
    });
  });

  describe("decodeEmojiFromReaction", () => {
    it("should decode custom emoji", () => {
      const result = decodeEmojiFromReaction("thumbsup%3A123456789012345678");
      expect(result).toEqual({
        name: "thumbsup",
        id: "123456789012345678",
        animated: false,
      });
    });

    it("should decode Unicode emoji", () => {
      const result = decodeEmojiFromReaction("%F0%9F%91%8D");
      expect(result).toEqual({
        name: "👍",
        id: null,
        animated: false,
      });
    });

    it("should decode plain text", () => {
      const result = decodeEmojiFromReaction("hello%20world");
      expect(result).toEqual({
        name: "hello world",
        id: null,
        animated: false,
      });
    });

    it("should decode emoji with special characters", () => {
      const result = decodeEmojiFromReaction("emoji!%40%23%3A123456789012345678");
      expect(result).toEqual({
        name: "emoji!@#",
        id: "123456789012345678",
        animated: false,
      });
    });

    it("should handle empty string", () => {
      const result = decodeEmojiFromReaction("");
      expect(result).toEqual({
        name: "",
        id: null,
        animated: false,
      });
    });

    it("should handle malformed format as Unicode", () => {
      const result = decodeEmojiFromReaction("malformed");
      expect(result).toEqual({
        name: "malformed",
        id: null,
        animated: false,
      });
    });
  });

  describe("integration tests", () => {
    it("should handle encode/decode roundtrip for custom emoji", () => {
      const original: Pick<EmojiEntity, "id" | "name" | "animated"> = {
        id: "123456789012345678",
        name: "party",
        animated: true,
      };

      const encoded = encodeEmojiForReaction(original);
      const decoded = decodeEmojiFromReaction(encoded);

      expect(decoded).toEqual({
        name: "party",
        id: "123456789012345678",
        animated: false, // Animation lost in reactions
      });
    });

    it("should handle encode/decode roundtrip for Unicode emoji", () => {
      const original = "👍";

      const encoded = encodeEmojiForReaction(original);
      const decoded = decodeEmojiFromReaction(encoded);

      expect(decoded).toEqual({
        name: "👍",
        id: null,
        animated: false,
      });
    });

    it("should handle full workflow", () => {
      const input = "<a:party:123456789012345678>";

      const resolved = resolveEmoji(input);
      const encoded = encodeEmojiForReaction(resolved);
      const decoded = decodeEmojiFromReaction(encoded);

      expect(resolved).toEqual({
        name: "party",
        id: "123456789012345678",
        animated: true,
      });
      expect(encoded).toBe("party%3A123456789012345678");
      expect(decoded).toEqual({
        name: "party",
        id: "123456789012345678",
        animated: false,
      });
    });
  });
});
