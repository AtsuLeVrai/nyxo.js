import { describe, expect, it } from "vitest";
import { BitField } from "../src/index.js";

// Sample enum for testing with the BitField
enum TestFlags {
  None = 0,
  Flag1 = 1 << 0, // 1
  Flag2 = 1 << 1, // 2
  Flag3 = 1 << 2, // 4
  Flag4 = 1 << 3, // 8
  Flag5 = 1 << 4, // 16
  All = Flag1 | Flag2 | Flag3 | Flag4 | Flag5,
}

describe("BitField", () => {
  // Construction and initialization
  describe("constructor", () => {
    it("should create an empty bitfield", () => {
      const bitfield = new BitField();
      expect(bitfield.isEmpty()).toBe(true);
      expect(bitfield.valueOf()).toBe(0n);
    });

    it("should initialize with a single value", () => {
      const bitfield = new BitField<TestFlags>(TestFlags.Flag1);
      expect(bitfield.valueOf()).toBe(1n);
      expect(bitfield.has(TestFlags.Flag1)).toBe(true);
    });

    it("should initialize with multiple values", () => {
      const bitfield = new BitField<TestFlags>(
        TestFlags.Flag1,
        TestFlags.Flag3,
      );
      expect(bitfield.valueOf()).toBe(5n); // 1 + 4 = 5
      expect(bitfield.has(TestFlags.Flag1 | TestFlags.Flag3)).toBe(true);
    });

    it("should initialize with an array of values", () => {
      const bitfield = new BitField<TestFlags>([
        TestFlags.Flag2,
        TestFlags.Flag4,
      ]);
      expect(bitfield.valueOf()).toBe(10n); // 2 + 8 = 10
    });

    it("should initialize with mixed types", () => {
      const bitfield = new BitField(1n, 2, "4");
      expect(bitfield.valueOf()).toBe(7n); // 1 + 2 + 4 = 7
    });
  });

  // Static factory method
  describe("from", () => {
    it("should create a BitField instance from values", () => {
      const bitfield = BitField.from(TestFlags.Flag1, TestFlags.Flag2);
      expect(bitfield.valueOf()).toBe(3n);
    });
  });

  // Value resolution
  describe("resolve", () => {
    it("should resolve a single bigint value", () => {
      expect(BitField.resolve(5n)).toBe(5n);
    });

    it("should resolve a single number value", () => {
      expect(BitField.resolve(3)).toBe(3n);
    });

    it("should resolve a string value", () => {
      expect(BitField.resolve("7")).toBe(7n);
    });

    it("should resolve an array of values", () => {
      expect(BitField.resolve([1n, 2n, 4n])).toBe(7n);
    });

    it("should resolve enum values", () => {
      expect(
        BitField.resolve<TestFlags>(TestFlags.Flag1 | TestFlags.Flag3),
      ).toBe(5n);
    });

    it("should resolve nested arrays", () => {
      expect(BitField.resolve([1n, [2n, [4n]]])).toBe(7n);
    });

    it("should handle null/undefined values gracefully", () => {
      // biome-ignore lint/suspicious/noExplicitAny: For testing purposes
      expect(BitField.resolve(null as any, undefined as any)).toBe(0n);
    });

    it("should throw error for invalid values", () => {
      // biome-ignore lint/suspicious/noExplicitAny: For testing purposes
      expect(() => BitField.resolve({} as any)).toThrow();
      expect(() => BitField.resolve("not a number")).toThrow();
    });
  });

  // Value validation
  describe("isValid", () => {
    it("should return true for valid bigint values", () => {
      expect(BitField.isValid(0n)).toBe(true);
      expect(BitField.isValid(42n)).toBe(true);
    });

    it("should return true for valid number values", () => {
      expect(BitField.isValid(0)).toBe(true);
      expect(BitField.isValid(123)).toBe(true);
    });

    it("should return true for valid string values", () => {
      expect(BitField.isValid("0")).toBe(true);
      expect(BitField.isValid("1234")).toBe(true);
    });

    it("should return true for arrays of valid values", () => {
      expect(BitField.isValid([1n, 2, "3"])).toBe(true);
    });

    it("should return false for invalid values", () => {
      expect(BitField.isValid(-1n)).toBe(false);
      expect(BitField.isValid(-5)).toBe(false);
      expect(BitField.isValid("hello")).toBe(false);
      expect(BitField.isValid({})).toBe(false);
      expect(BitField.isValid(null)).toBe(false);
      expect(BitField.isValid(undefined)).toBe(false);
      expect(BitField.isValid([1n, "invalid"])).toBe(false);
    });
  });

  // Static utility methods
  describe("combine", () => {
    it("should combine multiple bitfields", () => {
      const field1 = new BitField(1n);
      const field2 = new BitField(2n);
      const field3 = new BitField(4n);

      const combined = BitField.combine(field1, field2, field3);
      expect(combined.valueOf()).toBe(7n);
    });
  });

  describe("intersection", () => {
    it("should find common bits between bitfields", () => {
      const field1 = new BitField(3n); // 1 + 2 = 3
      const field2 = new BitField(6n); // 2 + 4 = 6

      const common = BitField.intersection(field1, field2);
      expect(common.valueOf()).toBe(2n); // Only bit 2 is common
    });

    it("should return an empty bitfield if there is no intersection", () => {
      const field1 = new BitField(1n);
      const field2 = new BitField(4n);

      const common = BitField.intersection(field1, field2);
      expect(common.isEmpty()).toBe(true);
    });

    it("should return an empty bitfield for no arguments", () => {
      const result = BitField.intersection();
      expect(result.isEmpty()).toBe(true);
    });
  });

  // Instance methods - queries
  describe("has", () => {
    it("should return true if the bitfield has all specified bits", () => {
      const bitfield = new BitField(7n); // 1 + 2 + 4 = 7

      expect(bitfield.has(1n)).toBe(true);
      expect(bitfield.has(2n)).toBe(true);
      expect(bitfield.has(4n)).toBe(true);
      expect(bitfield.has(3n)).toBe(true); // 1 + 2 = 3
      expect(bitfield.has(7n)).toBe(true); // 1 + 2 + 4 = 7
    });

    it("should return false if the bitfield does not have all specified bits", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      expect(bitfield.has(2n)).toBe(false);
      expect(bitfield.has(3n)).toBe(false); // 1 + 2 = 3
      expect(bitfield.has(6n)).toBe(false); // 2 + 4 = 6
    });
  });

  describe("hasAny", () => {
    it("should return true if the bitfield has any specified bits", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      expect(bitfield.hasAny(1n, 2n)).toBe(true);
      expect(bitfield.hasAny(2n, 4n)).toBe(true);
      expect(bitfield.hasAny(3n, 8n)).toBe(true); // (1+2) or 8
    });

    it("should return false if the bitfield has none of the specified bits", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      expect(bitfield.hasAny(2n, 8n)).toBe(false);
      expect(bitfield.hasAny(16n, 32n)).toBe(false);
    });
  });

  describe("isEmpty", () => {
    it("should return true for an empty bitfield", () => {
      expect(new BitField().isEmpty()).toBe(true);
      expect(new BitField(0n).isEmpty()).toBe(true);
      expect(new BitField(0).isEmpty()).toBe(true);
    });

    it("should return false for a non-empty bitfield", () => {
      expect(new BitField(1n).isEmpty()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for equal bitfields", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      expect(bitfield.equals(5n)).toBe(true);
      // @ts-expect-error For testing purposes
      expect(bitfield.equals(new BitField(5n))).toBe(true);
      expect(bitfield.equals([1n, 4n])).toBe(true);
      expect(bitfield.equals("5")).toBe(true);
    });

    it("should return false for unequal bitfields", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      expect(bitfield.equals(4n)).toBe(false);
      // @ts-expect-error For testing purposes
      expect(bitfield.equals(new BitField(7n))).toBe(false);
    });
  });

  // Instance methods - modifiers
  describe("add", () => {
    it("should add bits to the bitfield", () => {
      const bitfield = new BitField(1n);

      bitfield.add(4n);
      expect(bitfield.valueOf()).toBe(5n); // 1 + 4 = 5

      bitfield.add(2n, 8n);
      expect(bitfield.valueOf()).toBe(15n); // 1 + 2 + 4 + 8 = 15
    });

    it("should support method chaining", () => {
      const bitfield = new BitField();

      bitfield.add(1n).add(2n).add(4n);
      expect(bitfield.valueOf()).toBe(7n);
    });

    it("should handle adding already set bits", () => {
      const bitfield = new BitField(3n); // 1 + 2 = 3

      bitfield.add(2n); // Already set
      expect(bitfield.valueOf()).toBe(3n);
    });
  });

  describe("remove", () => {
    it("should remove bits from the bitfield", () => {
      const bitfield = new BitField(15n); // 1 + 2 + 4 + 8 = 15

      bitfield.remove(4n);
      expect(bitfield.valueOf()).toBe(11n); // 1 + 2 + 8 = 11

      bitfield.remove(1n, 2n);
      expect(bitfield.valueOf()).toBe(8n);
    });

    it("should support method chaining", () => {
      const bitfield = new BitField(15n); // 1 + 2 + 4 + 8 = 15

      bitfield.remove(1n).remove(2n).remove(4n);
      expect(bitfield.valueOf()).toBe(8n);
    });

    it("should handle removing unset bits", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      bitfield.remove(2n); // Not set
      expect(bitfield.valueOf()).toBe(5n);
    });
  });

  describe("toggle", () => {
    it("should toggle bits in the bitfield", () => {
      const bitfield = new BitField(5n); // 1 + 4 = 5

      bitfield.toggle(2n); // Turn on bit 2
      expect(bitfield.valueOf()).toBe(7n); // 1 + 2 + 4 = 7

      bitfield.toggle(1n, 4n); // Turn off bits 1 and 4
      expect(bitfield.valueOf()).toBe(2n);
    });

    it("should support method chaining", () => {
      const bitfield = new BitField(1n);

      bitfield.toggle(2n).toggle(4n).toggle(1n);
      expect(bitfield.valueOf()).toBe(6n); // 2 + 4 = 6
    });
  });

  describe("clear", () => {
    it("should clear all bits", () => {
      const bitfield = new BitField(15n); // 1 + 2 + 4 + 8 = 15

      bitfield.clear();
      expect(bitfield.isEmpty()).toBe(true);
      expect(bitfield.valueOf()).toBe(0n);
    });

    it("should support method chaining", () => {
      const bitfield = new BitField(15n);

      bitfield.clear().add(1n);
      expect(bitfield.valueOf()).toBe(1n);
    });
  });

  describe("clone", () => {
    it("should create a copy with the same bits", () => {
      const original = new BitField(5n); // 1 + 4 = 5
      const copy = original.clone();

      expect(copy.valueOf()).toBe(5n);
      expect(copy).not.toBe(original); // Different object references
    });

    it("should create an independent copy", () => {
      const original = new BitField(5n); // 1 + 4 = 5
      const copy = original.clone();

      copy.add(2n);
      expect(copy.valueOf()).toBe(7n); // 1 + 2 + 4 = 7
      expect(original.valueOf()).toBe(5n); // Original unchanged
    });
  });

  // Conversion methods
  describe("toArray", () => {
    it("should convert to an array of bit flags", () => {
      const bitfield = new BitField(7n); // 1 + 2 + 4 = 7
      const array = bitfield.toArray();

      expect(array).toEqual([1n, 2n, 4n]);
    });

    it("should return an empty array for an empty bitfield", () => {
      const bitfield = new BitField();
      const array = bitfield.toArray();

      expect(array).toEqual([]);
    });
  });

  describe("toString", () => {
    it("should convert to a decimal string by default", () => {
      const bitfield = new BitField(10n); // 2 + 8 = 10
      expect(bitfield.toString()).toBe("10");
    });

    it("should convert to the specified radix", () => {
      const bitfield = new BitField(10n); // 2 + 8 = 10
      expect(bitfield.toString(2)).toBe("1010");
      expect(bitfield.toString(16)).toBe("a");
    });
  });

  describe("valueOf", () => {
    it("should return the raw bigint value", () => {
      const bitfield = new BitField(42n);
      expect(bitfield.valueOf()).toBe(42n);
    });
  });

  // Iteration
  describe("iteration", () => {
    it("should be iterable with set bits as powers of 2", () => {
      const bitfield = new BitField(7n); // 1 + 2 + 4 = 7
      const bits = [...bitfield];

      expect(bits).toEqual([1n, 2n, 4n]);
    });

    it("should work with for...of loops", () => {
      const bitfield = new BitField(11n); // 1 + 2 + 8 = 11
      const bits: bigint[] = [];

      for (const bit of bitfield) {
        bits.push(bit);
      }

      expect(bits).toEqual([1n, 2n, 8n]);
    });
  });

  // Edge cases and error handling
  describe("error handling", () => {
    it("should reject negative values", () => {
      expect(() => new BitField(-1n)).toThrow();
      expect(() => new BitField(-5)).toThrow();
      expect(() => BitField.resolve(-10n)).toThrow();
    });

    it("should reject non-integer numbers", () => {
      expect(() => new BitField(3.14)).toThrow();
      expect(() => BitField.resolve(2.5)).toThrow();
    });

    it("should reject invalid string values", () => {
      expect(() => new BitField("abc")).toThrow();
      expect(() => BitField.resolve("3.14")).toThrow();
    });
  });
});
