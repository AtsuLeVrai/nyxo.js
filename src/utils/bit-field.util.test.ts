// @ts-nocheck

import { describe, expect, it } from "vitest";
import { BitField } from "./bit-field.util.js";

describe("BitField Utilities", () => {
  describe("constructor", () => {
    it("should create empty BitField with no arguments", () => {
      const bf = new BitField();
      expect(bf.valueOf()).toBe(0n);
    });

    it("should create BitField with single number", () => {
      const bf = new BitField(5);
      expect(bf.valueOf()).toBe(5n);
    });

    it("should create BitField with single bigint", () => {
      const bf = new BitField(42n);
      expect(bf.valueOf()).toBe(42n);
    });

    it("should create BitField with multiple values", () => {
      const bf = new BitField(1, 4, 8);
      expect(bf.valueOf()).toBe(13n); // 1 | 4 | 8 = 13
    });

    it("should create BitField with mixed number and bigint", () => {
      const bf = new BitField(1, 4n, 8);
      expect(bf.valueOf()).toBe(13n);
    });

    it("should handle undefined values gracefully", () => {
      const bf = new BitField(1, undefined, 4);
      expect(bf.valueOf()).toBe(5n); // 1 | 4 = 5
    });

    it("should create BitField with only undefined values", () => {
      const bf = new BitField(undefined, undefined);
      expect(bf.valueOf()).toBe(0n);
    });

    it("should handle large bigint values", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit);
      expect(bf.valueOf()).toBe(largeBit);
    });

    it("should combine multiple bits correctly", () => {
      const bf = new BitField(1, 2, 4, 8, 16);
      expect(bf.valueOf()).toBe(31n); // 1+2+4+8+16
    });
  });

  describe("combine static method", () => {
    it("should combine single value", () => {
      const bf = BitField.combine(5);
      expect(bf.valueOf()).toBe(5n);
    });

    it("should combine multiple numbers", () => {
      const bf = BitField.combine(1, 2, 4);
      expect(bf.valueOf()).toBe(7n);
    });

    it("should combine multiple bigints", () => {
      const bf = BitField.combine(1n, 2n, 4n);
      expect(bf.valueOf()).toBe(7n);
    });

    it("should combine mixed types", () => {
      const bf = BitField.combine(1, 2n, 4);
      expect(bf.valueOf()).toBe(7n);
    });

    it("should handle empty combination", () => {
      const bf = BitField.combine();
      expect(bf.valueOf()).toBe(0n);
    });

    it("should handle duplicate bits", () => {
      const bf = BitField.combine(4, 4, 8, 8);
      expect(bf.valueOf()).toBe(12n); // 4 | 8 = 12
    });
  });

  describe("has method", () => {
    it("should detect single bit presence", () => {
      const bf = new BitField(5); // binary: 101
      expect(bf.has(1)).toBe(true); // bit 0
      expect(bf.has(4)).toBe(true); // bit 2
      expect(bf.has(2)).toBe(false); // bit 1
    });

    it("should detect multiple bits presence", () => {
      const bf = new BitField(15); // binary: 1111
      expect(bf.has(3)).toBe(true); // bits 0,1
      expect(bf.has(12)).toBe(true); // bits 2,3
      expect(bf.has(15)).toBe(true); // all bits
    });

    it("should return false for missing bits", () => {
      const bf = new BitField(5); // binary: 101
      expect(bf.has(8)).toBe(false);
      expect(bf.has(16)).toBe(false);
    });

    it("should work with bigint values", () => {
      const bf = new BitField(5n);
      expect(bf.has(1n)).toBe(true);
      expect(bf.has(4n)).toBe(true);
      expect(bf.has(2n)).toBe(false);
    });

    it("should handle zero bit check", () => {
      const bf = new BitField(5);
      expect(bf.has(0)).toBe(true); // 0 means no bits, always present
    });

    it("should handle large bit values", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit);
      expect(bf.has(largeBit)).toBe(true);
    });
  });

  describe("hasAny method", () => {
    it("should detect any single bit", () => {
      const bf = new BitField(5); // binary: 101
      expect(bf.hasAny(1)).toBe(true);
      expect(bf.hasAny(2)).toBe(false);
      expect(bf.hasAny(4)).toBe(true);
    });

    it("should detect any of multiple bits", () => {
      const bf = new BitField(5); // binary: 101
      expect(bf.hasAny(1, 2)).toBe(true); // has bit 0
      expect(bf.hasAny(2, 8)).toBe(false); // has neither
      expect(bf.hasAny(4, 8)).toBe(true); // has bit 2
    });

    it("should work with bigint values", () => {
      const bf = new BitField(5n);
      expect(bf.hasAny(1n, 2n)).toBe(true);
      expect(bf.hasAny(8n, 16n)).toBe(false);
    });

    it("should work with mixed types", () => {
      const bf = new BitField(5);
      expect(bf.hasAny(1n, 2)).toBe(true);
      expect(bf.hasAny(8, 16n)).toBe(false);
    });

    it("should handle empty check", () => {
      const bf = new BitField(5);
      expect(bf.hasAny()).toBe(false);
    });

    it("should handle large bit combinations", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit | 1n);
      expect(bf.hasAny(1, 2)).toBe(true);
      expect(bf.hasAny(largeBit)).toBe(true);
    });
  });

  describe("equals method", () => {
    it("should compare with number", () => {
      const bf = new BitField(5);
      expect(bf.equals(5)).toBe(true);
      expect(bf.equals(6)).toBe(false);
    });

    it("should compare with bigint", () => {
      const bf = new BitField(5);
      expect(bf.equals(5n)).toBe(true);
      expect(bf.equals(6n)).toBe(false);
    });

    it("should handle zero comparison", () => {
      const bf = new BitField();
      expect(bf.equals(0)).toBe(true);
      expect(bf.equals(0n)).toBe(true);
      expect(bf.equals(1)).toBe(false);
    });

    it("should handle large value comparison", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit);
      expect(bf.equals(largeBit)).toBe(true);
      expect(bf.equals(largeBit + 1n)).toBe(false);
    });
  });

  describe("add method", () => {
    it("should add single bit", () => {
      const bf = new BitField(1);
      bf.add(4);
      expect(bf.valueOf()).toBe(5n); // 1 | 4 = 5
    });

    it("should add multiple bits", () => {
      const bf = new BitField(1);
      bf.add(2, 4);
      expect(bf.valueOf()).toBe(7n); // 1 | 2 | 4 = 7
    });

    it("should handle adding existing bits", () => {
      const bf = new BitField(5); // 1 | 4
      bf.add(1); // already present
      expect(bf.valueOf()).toBe(5n);
    });

    it("should return this for chaining", () => {
      const bf = new BitField(1);
      const result = bf.add(2);
      expect(result).toBe(bf);
      expect(bf.valueOf()).toBe(3n);
    });

    it("should work with bigint values", () => {
      const bf = new BitField(1n);
      bf.add(4n);
      expect(bf.valueOf()).toBe(5n);
    });

    it("should work with mixed types", () => {
      const bf = new BitField(1);
      bf.add(2n, 4);
      expect(bf.valueOf()).toBe(7n);
    });

    it("should handle large bit additions", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(1);
      bf.add(largeBit);
      expect(bf.valueOf()).toBe(1n | largeBit);
    });
  });

  describe("remove method", () => {
    it("should remove single bit", () => {
      const bf = new BitField(7); // 1 | 2 | 4
      bf.remove(2);
      expect(bf.valueOf()).toBe(5n); // 1 | 4
    });

    it("should remove multiple bits", () => {
      const bf = new BitField(15); // 1 | 2 | 4 | 8
      bf.remove(2, 8);
      expect(bf.valueOf()).toBe(5n); // 1 | 4
    });

    it("should handle removing non-existent bits", () => {
      const bf = new BitField(5); // 1 | 4
      bf.remove(2); // not present
      expect(bf.valueOf()).toBe(5n);
    });

    it("should return this for chaining", () => {
      const bf = new BitField(7);
      const result = bf.remove(2);
      expect(result).toBe(bf);
      expect(bf.valueOf()).toBe(5n);
    });

    it("should work with bigint values", () => {
      const bf = new BitField(5n);
      bf.remove(1n);
      expect(bf.valueOf()).toBe(4n);
    });

    it("should work with mixed types", () => {
      const bf = new BitField(7);
      bf.remove(1n, 2);
      expect(bf.valueOf()).toBe(4n);
    });

    it("should handle removing all bits", () => {
      const bf = new BitField(7);
      bf.remove(1, 2, 4);
      expect(bf.valueOf()).toBe(0n);
    });

    it("should handle large bit removal", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(1n | largeBit);
      bf.remove(largeBit);
      expect(bf.valueOf()).toBe(1n);
    });
  });

  describe("toggle method", () => {
    it("should toggle single bit on", () => {
      const bf = new BitField(1);
      bf.toggle(2);
      expect(bf.valueOf()).toBe(3n); // 1 | 2
    });

    it("should toggle single bit off", () => {
      const bf = new BitField(3); // 1 | 2
      bf.toggle(2);
      expect(bf.valueOf()).toBe(1n);
    });

    it("should toggle multiple bits", () => {
      const bf = new BitField(5); // 1 | 4
      bf.toggle(1, 2); // turn off 1, turn on 2
      expect(bf.valueOf()).toBe(6n); // 2 | 4
    });

    it("should return this for chaining", () => {
      const bf = new BitField(1);
      const result = bf.toggle(2);
      expect(result).toBe(bf);
      expect(bf.valueOf()).toBe(3n);
    });

    it("should work with bigint values", () => {
      const bf = new BitField(1n);
      bf.toggle(2n);
      expect(bf.valueOf()).toBe(3n);
    });

    it("should work with mixed types", () => {
      const bf = new BitField(1);
      bf.toggle(2n, 4);
      expect(bf.valueOf()).toBe(7n);
    });

    it("should handle toggle back to original", () => {
      const bf = new BitField(5);
      bf.toggle(2); // add 2
      expect(bf.valueOf()).toBe(7n);
      bf.toggle(2); // remove 2
      expect(bf.valueOf()).toBe(5n);
    });

    it("should handle large bit toggling", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(1);
      bf.toggle(largeBit);
      expect(bf.valueOf()).toBe(1n | largeBit);
      bf.toggle(largeBit);
      expect(bf.valueOf()).toBe(1n);
    });
  });

  describe("clone method", () => {
    it("should create independent copy", () => {
      const original = new BitField(5);
      const cloned = original.clone();

      expect(cloned.valueOf()).toBe(5n);
      expect(cloned).not.toBe(original);
    });

    it("should not affect original when modifying clone", () => {
      const original = new BitField(5);
      const cloned = original.clone();

      cloned.add(8);
      expect(original.valueOf()).toBe(5n);
      expect(cloned.valueOf()).toBe(13n);
    });

    it("should handle empty BitField clone", () => {
      const original = new BitField();
      const cloned = original.clone();
      expect(cloned.valueOf()).toBe(0n);
    });

    it("should handle large value clone", () => {
      const largeBit = 1n << 32n;
      const original = new BitField(largeBit);
      const cloned = original.clone();
      expect(cloned.valueOf()).toBe(largeBit);
    });
  });

  describe("toString method", () => {
    it("should convert to decimal string by default", () => {
      const bf = new BitField(5);
      expect(bf.toString()).toBe("5");
    });

    it("should convert to binary string", () => {
      const bf = new BitField(5);
      expect(bf.toString(2)).toBe("101");
    });

    it("should convert to hexadecimal string", () => {
      const bf = new BitField(255);
      expect(bf.toString(16)).toBe("ff");
    });

    it("should handle zero value", () => {
      const bf = new BitField();
      expect(bf.toString()).toBe("0");
      expect(bf.toString(2)).toBe("0");
      expect(bf.toString(16)).toBe("0");
    });

    it("should handle large values", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit);
      expect(bf.toString()).toBe(largeBit.toString());
      expect(bf.toString(16)).toBe(largeBit.toString(16));
    });

    it("should handle different radix values", () => {
      const bf = new BitField(64);
      expect(bf.toString(8)).toBe("100"); // octal
      expect(bf.toString(16)).toBe("40"); // hex
      expect(bf.toString(2)).toBe("1000000"); // binary
    });
  });

  describe("valueOf method", () => {
    it("should return bigint value", () => {
      const bf = new BitField(5);
      const value = bf.valueOf();
      expect(value).toBe(5n);
      expect(typeof value).toBe("bigint");
    });

    it("should return zero for empty BitField", () => {
      const bf = new BitField();
      expect(bf.valueOf()).toBe(0n);
    });

    it("should return large values correctly", () => {
      const largeBit = 1n << 32n;
      const bf = new BitField(largeBit);
      expect(bf.valueOf()).toBe(largeBit);
    });

    it("should work with primitive conversion", () => {
      const bf = new BitField(5);
      expect(Number(bf)).toBe(5);
      expect(String(bf)).toBe("5");
    });
  });

  describe("method chaining", () => {
    it("should support fluent interface", () => {
      const bf = new BitField(1);
      const result = bf.add(2).remove(1).toggle(4).add(8);

      expect(result).toBe(bf);
      expect(bf.valueOf()).toBe(14n); // 2 | 4 | 8
    });

    it("should work with complex chaining", () => {
      const bf = new BitField().add(1, 2, 4).remove(2).toggle(8, 16).add(32);

      expect(bf.valueOf()).toBe(61n); // 1 | 4 | 8 | 16 | 32
    });

    it("should maintain correct state through chain", () => {
      const bf = new BitField(15); // all bits 1,2,4,8
      bf.remove(2, 8) // leaves 1,4 = 5
        .add(16) // adds 16 = 21
        .toggle(1, 32); // removes 1, adds 32 = 52

      expect(bf.valueOf()).toBe(52n); // 4 | 16 | 32
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle maximum safe integer", () => {
      const bf = new BitField(Number.MAX_SAFE_INTEGER);
      expect(bf.valueOf()).toBe(BigInt(Number.MAX_SAFE_INTEGER));
    });

    it("should handle zero operations", () => {
      const bf = new BitField(5);
      bf.add(0);
      bf.remove(0);
      bf.toggle(0);
      expect(bf.valueOf()).toBe(5n);
    });

    it("should work with Discord permission-like values", () => {
      // Simulate Discord permissions
      const VIEW_CHANNELS = 1n << 10n;
      const SEND_MESSAGES = 1n << 11n;
      const MANAGE_MESSAGES = 1n << 13n;

      const permissions = new BitField(VIEW_CHANNELS, SEND_MESSAGES);
      expect(permissions.has(VIEW_CHANNELS)).toBe(true);
      expect(permissions.has(SEND_MESSAGES)).toBe(true);
      expect(permissions.has(MANAGE_MESSAGES)).toBe(false);

      permissions.add(MANAGE_MESSAGES);
      expect(permissions.has(MANAGE_MESSAGES)).toBe(true);
    });

    it("should handle Discord intent-like values", () => {
      // Simulate Discord intents
      const GUILD_MESSAGES = 1n << 9n;
      const GUILD_MEMBERS = 1n << 1n;
      const MESSAGE_CONTENT = 1n << 15n;

      const intents = BitField.combine(GUILD_MESSAGES, MESSAGE_CONTENT);
      expect(intents.hasAny(GUILD_MESSAGES, GUILD_MEMBERS)).toBe(true);
      expect(intents.has(GUILD_MEMBERS)).toBe(false);
    });
  });

  describe("type safety", () => {
    it("should maintain type constraints", () => {
      const numberBF = new BitField<number>(1, 2, 4);
      const bigintBF = new BitField<bigint>(1n, 2n, 4n);

      expect(numberBF.valueOf()).toBe(7n);
      expect(bigintBF.valueOf()).toBe(7n);
    });

    it("should work with mixed number and bigint generics", () => {
      type MixedBitField = BitField<number | bigint>;
      const bf: MixedBitField = new BitField(1, 2n);
      expect(bf.valueOf()).toBe(3n);
    });

    it("should return correct types from static methods", () => {
      const combined = BitField.combine(1, 2, 4);
      expect(combined).toBeInstanceOf(BitField);
      expect(combined.valueOf()).toBe(7n);
    });
  });

  describe("integration tests", () => {
    it("should work as Discord permission system", () => {
      // Real Discord permission values
      const SEND_MESSAGES = 1n << 11n; // 2048
      const MANAGE_MESSAGES = 1n << 13n; // 8192
      const EMBED_LINKS = 1n << 14n; // 16384

      const userPerms = new BitField(SEND_MESSAGES, EMBED_LINKS);
      const requiredPerms = BitField.combine(SEND_MESSAGES, MANAGE_MESSAGES);

      expect(userPerms.has(SEND_MESSAGES)).toBe(true);
      expect(userPerms.has(MANAGE_MESSAGES)).toBe(false);
      expect(userPerms.hasAny(SEND_MESSAGES, MANAGE_MESSAGES)).toBe(true);

      // Grant admin permissions
      userPerms.add(MANAGE_MESSAGES);
      expect(userPerms.has(requiredPerms.valueOf())).toBe(true); // now has ALL required
      expect(userPerms.hasAny(requiredPerms.valueOf())).toBe(true); // has SOME required
    });

    it("should work as Discord gateway intents", () => {
      const GUILDS = 1n << 0n;
      const GUILD_MESSAGES = 1n << 9n;
      const MESSAGE_CONTENT = 1n << 15n;

      const botIntents = new BitField().add(GUILDS).add(GUILD_MESSAGES).add(MESSAGE_CONTENT);

      expect(botIntents.valueOf()).toBe(GUILDS | GUILD_MESSAGES | MESSAGE_CONTENT);

      // Convert to number for Discord API
      const intentValue = Number(botIntents.valueOf());
      expect(typeof intentValue).toBe("number");
      expect(intentValue).toBeGreaterThan(0);
    });

    it("should handle bit manipulation operations", () => {
      const bf1 = new BitField(0b1010); // 10
      const bf2 = new BitField(0b1100); // 12

      // Union (OR) - combine both
      const union = BitField.combine(bf1.valueOf(), bf2.valueOf());
      expect(union.valueOf()).toBe(0b1110n); // 14

      // Check intersection manually
      expect(bf1.hasAny(bf2.valueOf())).toBe(true); // they share bit 3

      // XOR-like toggle
      const bf3 = bf1.clone();
      bf3.toggle(bf2.valueOf());
      expect(bf3.valueOf()).toBe(0b0110n); // 6 (XOR result)
    });
  });
});
