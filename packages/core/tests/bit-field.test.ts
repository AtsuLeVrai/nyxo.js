import { describe, expect, it } from "vitest";
import { BitField, type BitFieldResolvable } from "../src/index.js";

/**
 * Test enum to use with BitField tests
 */
enum TestFlags {
  None = 0,
  First = 1 << 0, // 1
  Second = 1 << 1, // 2
  Third = 1 << 2, // 4
  Fourth = 1 << 3, // 8
  Fifth = 1 << 4, // 16
  Sixth = 1 << 5, // 32
  All = First | Second | Third | Fourth | Fifth | Sixth, // 63
}

describe("BitField", () => {
  describe("Constructor", () => {
    it("creates an empty BitField when no arguments are passed", () => {
      const bitfield = new BitField();
      expect(bitfield.valueOf()).toBe(0n);
      expect(bitfield.isEmpty()).toBe(true);
    });

    it("creates a BitField with a single bigint value", () => {
      const bitfield = new BitField(5n);
      expect(bitfield.valueOf()).toBe(5n);
    });

    it("creates a BitField with a single number value", () => {
      const bitfield = new BitField(5);
      expect(bitfield.valueOf()).toBe(5n);
    });

    it("creates a BitField with a single string value", () => {
      const bitfield = new BitField("5");
      expect(bitfield.valueOf()).toBe(5n);
    });

    it("creates a BitField with multiple values", () => {
      const bitfield = new BitField(1n, 2n, 4n);
      expect(bitfield.valueOf()).toBe(7n);
    });

    it("creates a BitField with an array of values", () => {
      const bitfield = new BitField([1n, 2n, 4n]);
      expect(bitfield.valueOf()).toBe(7n);
    });

    it("creates a BitField with enum values", () => {
      const bitfield = new BitField<TestFlags>(
        TestFlags.First,
        TestFlags.Second,
      );
      expect(bitfield.valueOf()).toBe(3n);
    });

    it("creates a BitField with mixed types", () => {
      const bitfield = new BitField(1n, 2, "4");
      expect(bitfield.valueOf()).toBe(7n);
    });
  });

  describe("Static Methods", () => {
    describe("from", () => {
      it("creates a BitField from a single value", () => {
        const bitfield = BitField.from(5n);
        expect(bitfield.valueOf()).toBe(5n);
      });

      it("creates a BitField from multiple values", () => {
        const bitfield = BitField.from(1n, 2n, 4n);
        expect(bitfield.valueOf()).toBe(7n);
      });

      it("creates a BitField from an array of values", () => {
        const bitfield = BitField.from([1n, 2n, 4n]);
        expect(bitfield.valueOf()).toBe(7n);
      });
    });

    describe("safeBigInt", () => {
      it("converts a number to a bigint", () => {
        const result = BitField.safeBigInt(5);
        expect(result).toBe(5n);
      });

      it("returns a bigint as is", () => {
        const result = BitField.safeBigInt(5n);
        expect(result).toBe(5n);
      });

      it("converts a string to a bigint", () => {
        const result = BitField.safeBigInt("5");
        expect(result).toBe(5n);
      });

      it("throws an error for negative bigints", () => {
        expect(() => BitField.safeBigInt(-5n)).toThrow();
      });

      it("throws an error for negative numbers", () => {
        expect(() => BitField.safeBigInt(-5)).toThrow();
      });

      it("throws an error for non-integer numbers", () => {
        expect(() => BitField.safeBigInt(5.5)).toThrow();
      });

      it("throws an error for invalid strings", () => {
        expect(() => BitField.safeBigInt("not a number")).toThrow();
      });

      it("throws an error for objects", () => {
        expect(() => BitField.safeBigInt({} as never)).toThrow();
      });
    });

    describe("resolve", () => {
      it("resolves a single bigint", () => {
        const result = BitField.resolve(5n);
        expect(result).toBe(5n);
      });

      it("resolves a single number", () => {
        const result = BitField.resolve(5);
        expect(result).toBe(5n);
      });

      it("resolves a single string", () => {
        const result = BitField.resolve("5");
        expect(result).toBe(5n);
      });

      it("resolves multiple values", () => {
        const result = BitField.resolve(1n, 2n, 4n);
        expect(result).toBe(7n);
      });

      it("resolves an array of values", () => {
        const result = BitField.resolve([1n, 2n, 4n]);
        expect(result).toBe(7n);
      });

      it("resolves enum values", () => {
        const result = BitField.resolve<TestFlags>(
          TestFlags.First,
          TestFlags.Second,
        );
        expect(result).toBe(3n);
      });

      it("resolves a BitField instance", () => {
        const bitfield = new BitField(5n);
        const result = BitField.resolve(bitfield);
        expect(result).toBe(5n);
      });

      it("resolves null as 0n", () => {
        const result = BitField.resolve(null as unknown as BitFieldResolvable);
        expect(result).toBe(0n);
      });

      it("resolves undefined as 0n", () => {
        const result = BitField.resolve(
          undefined as unknown as BitFieldResolvable,
        );
        expect(result).toBe(0n);
      });

      it("throws for invalid values", () => {
        expect(() => BitField.resolve({} as never)).toThrow();
      });
    });

    describe("isValid", () => {
      it("returns true for valid bigints", () => {
        expect(BitField.isValid(5n)).toBe(true);
      });

      it("returns true for valid numbers", () => {
        expect(BitField.isValid(5)).toBe(true);
      });

      it("returns true for valid strings", () => {
        expect(BitField.isValid("5")).toBe(true);
      });

      it("returns true for arrays of valid values", () => {
        expect(BitField.isValid([1n, 2, "3"])).toBe(true);
      });

      it("returns false for negative bigints", () => {
        expect(BitField.isValid(-5n)).toBe(false);
      });

      it("returns false for negative numbers", () => {
        expect(BitField.isValid(-5)).toBe(false);
      });

      it("returns false for non-integer numbers", () => {
        expect(BitField.isValid(5.5)).toBe(false);
      });

      it("returns false for invalid strings", () => {
        expect(BitField.isValid("not a number")).toBe(false);
      });

      it("returns false for objects", () => {
        expect(BitField.isValid({} as never)).toBe(false);
      });

      it("returns false for null", () => {
        expect(BitField.isValid(null)).toBe(false);
      });

      it("returns false for undefined", () => {
        expect(BitField.isValid(undefined)).toBe(false);
      });
    });

    describe("combine", () => {
      it("combines multiple BitField instances", () => {
        const bf1 = new BitField(1n);
        const bf2 = new BitField(2n);
        const bf3 = new BitField(4n);
        const result = BitField.combine(bf1, bf2, bf3);
        expect(result.valueOf()).toBe(7n);
      });

      it("combines BitField instances and raw values", () => {
        const bf1 = new BitField(1n);
        const result = BitField.combine(bf1, 2n, 4);
        expect(result.valueOf()).toBe(7n);
      });

      it("returns an empty BitField with no arguments", () => {
        const result = BitField.combine();
        expect(result.valueOf()).toBe(0n);
      });
    });

    describe("intersection", () => {
      it("finds the intersection of multiple BitField instances", () => {
        const bf1 = new BitField(3n); // 1 + 2
        const bf2 = new BitField(6n); // 2 + 4
        const result = BitField.intersection(bf1, bf2);
        expect(result.valueOf()).toBe(2n); // Only the second bit is common
      });

      it("finds the intersection of BitField instances and raw values", () => {
        const bf1 = new BitField(3n); // 1 + 2
        const result = BitField.intersection(bf1, 6n);
        expect(result.valueOf()).toBe(2n); // Only the second bit is common
      });

      it("returns an empty BitField with no arguments", () => {
        const result = BitField.intersection();
        expect(result.valueOf()).toBe(0n);
      });

      it("returns the value itself with one argument", () => {
        const result = BitField.intersection(5n);
        expect(result.valueOf()).toBe(5n);
      });
    });
  });

  describe("Instance Methods", () => {
    describe("has", () => {
      it("returns true when all bits are present", () => {
        const bitfield = new BitField(7n); // 1 + 2 + 4
        expect(bitfield.has(1n)).toBe(true);
        expect(bitfield.has(2n)).toBe(true);
        expect(bitfield.has(4n)).toBe(true);
        expect(bitfield.has(3n)).toBe(true); // 1 + 2
        expect(bitfield.has(6n)).toBe(true); // 2 + 4
        expect(bitfield.has(7n)).toBe(true); // 1 + 2 + 4
      });

      it("returns false when any bit is missing", () => {
        const bitfield = new BitField(3n); // 1 + 2
        expect(bitfield.has(4n)).toBe(false);
        expect(bitfield.has(7n)).toBe(false); // 1 + 2 + 4
      });

      it("works with enum values", () => {
        const bitfield = new BitField<TestFlags>(
          TestFlags.First | TestFlags.Second,
        );
        expect(bitfield.has(TestFlags.First)).toBe(true);
        expect(bitfield.has(TestFlags.Third)).toBe(false);
      });
    });

    describe("hasAny", () => {
      it("returns true when any bit is present", () => {
        const bitfield = new BitField(1n);
        expect(bitfield.hasAny(1n, 2n, 4n)).toBe(true);
      });

      it("returns false when no bits are present", () => {
        const bitfield = new BitField(8n);
        expect(bitfield.hasAny(1n, 2n, 4n)).toBe(false);
      });

      it("works with enum values", () => {
        const bitfield = new BitField<TestFlags>(TestFlags.First);
        expect(bitfield.hasAny(TestFlags.First, TestFlags.Third)).toBe(true);
        expect(bitfield.hasAny(TestFlags.Second, TestFlags.Third)).toBe(false);
      });
    });

    describe("isEmpty", () => {
      it("returns true for empty BitField", () => {
        const bitfield = new BitField();
        expect(bitfield.isEmpty()).toBe(true);
      });

      it("returns false for non-empty BitField", () => {
        const bitfield = new BitField(1n);
        expect(bitfield.isEmpty()).toBe(false);
      });
    });

    describe("equals", () => {
      it("returns true for equal BitField", () => {
        const bitfield = new BitField(5n);
        expect(bitfield.equals(5n)).toBe(true);
        expect(bitfield.equals(new BitField(5n))).toBe(true);
      });

      it("returns false for different BitField", () => {
        const bitfield = new BitField(5n);
        expect(bitfield.equals(7n)).toBe(false);
        expect(bitfield.equals(new BitField(7n))).toBe(false);
      });
    });

    describe("add", () => {
      it("adds bits to the BitField", () => {
        const bitfield = new BitField(1n);
        bitfield.add(2n);
        expect(bitfield.valueOf()).toBe(3n);
      });

      it("adds multiple bits at once", () => {
        const bitfield = new BitField(1n);
        bitfield.add(2n, 4n);
        expect(bitfield.valueOf()).toBe(7n);
      });

      it("is idempotent (adding same bit twice has no effect)", () => {
        const bitfield = new BitField(1n);
        bitfield.add(1n);
        expect(bitfield.valueOf()).toBe(1n);
      });

      it("returns the BitField instance for chaining", () => {
        const bitfield = new BitField(1n);
        const result = bitfield.add(2n);
        expect(result).toBe(bitfield);
      });

      it("works with enum values", () => {
        const bitfield = new BitField<TestFlags>(TestFlags.First);
        bitfield.add(TestFlags.Second);
        expect(bitfield.valueOf()).toBe(3n);
      });
    });

    describe("remove", () => {
      it("removes bits from the BitField", () => {
        const bitfield = new BitField(3n); // 1 + 2
        bitfield.remove(2n);
        expect(bitfield.valueOf()).toBe(1n);
      });

      it("removes multiple bits at once", () => {
        const bitfield = new BitField(7n); // 1 + 2 + 4
        bitfield.remove(1n, 4n);
        expect(bitfield.valueOf()).toBe(2n);
      });

      it("is idempotent (removing a bit that is not present has no effect)", () => {
        const bitfield = new BitField(1n);
        bitfield.remove(2n);
        expect(bitfield.valueOf()).toBe(1n);
      });

      it("returns the BitField instance for chaining", () => {
        const bitfield = new BitField(3n);
        const result = bitfield.remove(2n);
        expect(result).toBe(bitfield);
      });

      it("works with enum values", () => {
        const bitfield = new BitField<TestFlags>(
          TestFlags.First | TestFlags.Second,
        );
        bitfield.remove(TestFlags.Second);
        expect(bitfield.valueOf()).toBe(1n);
      });
    });

    describe("toggle", () => {
      it("toggles bits in the BitField", () => {
        const bitfield = new BitField(1n);
        bitfield.toggle(1n);
        expect(bitfield.valueOf()).toBe(0n);
      });

      it("toggles multiple bits at once", () => {
        const bitfield = new BitField(1n);
        bitfield.toggle(1n, 2n);
        expect(bitfield.valueOf()).toBe(2n); // 1 is toggled off, 2 is toggled on
      });

      it("returns the BitField instance for chaining", () => {
        const bitfield = new BitField(1n);
        const result = bitfield.toggle(1n);
        expect(result).toBe(bitfield);
      });

      it("works with enum values", () => {
        const bitfield = new BitField<TestFlags>(TestFlags.First);
        bitfield.toggle(TestFlags.First | TestFlags.Second);
        expect(bitfield.valueOf()).toBe(2n); // First is toggled off, Second is toggled on
      });
    });

    describe("clear", () => {
      it("removes all bits from the BitField", () => {
        const bitfield = new BitField(7n);
        bitfield.clear();
        expect(bitfield.valueOf()).toBe(0n);
      });

      it("returns the BitField instance for chaining", () => {
        const bitfield = new BitField(7n);
        const result = bitfield.clear();
        expect(result).toBe(bitfield);
      });
    });

    describe("clone", () => {
      it("creates a new BitField with the same bits", () => {
        const original = new BitField(7n);
        const clone = original.clone();
        expect(clone.valueOf()).toBe(7n);
        expect(clone).not.toBe(original); // Different instances
      });

      it("modifications to the clone do not affect the original", () => {
        const original = new BitField(7n);
        const clone = original.clone();
        clone.remove(1n);
        expect(clone.valueOf()).toBe(6n);
        expect(original.valueOf()).toBe(7n);
      });
    });

    describe("toArray", () => {
      it("returns an array of individual bits", () => {
        const bitfield = new BitField(11n); // 1 + 2 + 8
        const array = bitfield.toArray();
        expect(array).toEqual([1n, 2n, 8n]);
      });

      it("returns an empty array for an empty BitField", () => {
        const bitfield = new BitField();
        const array = bitfield.toArray();
        expect(array).toEqual([]);
      });
    });

    describe("toString", () => {
      it("returns the string representation of the bitfield", () => {
        const bitfield = new BitField(10n);
        expect(bitfield.toString()).toBe("10");
      });

      it("supports different radixes", () => {
        const bitfield = new BitField(10n);
        expect(bitfield.toString(16)).toBe("a");
        expect(bitfield.toString(2)).toBe("1010");
      });
    });

    describe("valueOf", () => {
      it("returns the bigint value of the bitfield", () => {
        const bitfield = new BitField(10n);
        expect(bitfield.valueOf()).toBe(10n);
      });
    });

    describe("Symbol.iterator", () => {
      it("allows iteration over the set bits", () => {
        const bitfield = new BitField(11n); // 1 + 2 + 8
        const bits = [...bitfield];
        expect(bits).toEqual([1n, 2n, 8n]);
      });

      it("returns no values for an empty BitField", () => {
        const bitfield = new BitField();
        const bits = [...bitfield];
        expect(bits).toEqual([]);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles the maximum safe integer", () => {
      const bitfield = new BitField(Number.MAX_SAFE_INTEGER);
      expect(bitfield.valueOf()).toBe(BigInt(Number.MAX_SAFE_INTEGER));
    });

    it("throws for numbers larger than MAX_SAFE_INTEGER", () => {
      // This would be unsafe in JavaScript
      const unsafeNumber = Number.MAX_SAFE_INTEGER + 1;
      expect(() => new BitField(unsafeNumber)).toThrow();
    });

    it("handles very large bigints within the 64-bit range", () => {
      // This is within the 64-bit range (2^63 - 1)
      const largeBigint = (1n << 63n) - 1n;
      const bitfield = new BitField(largeBigint);
      expect(bitfield.valueOf()).toBe(largeBigint);
    });

    it("throws for bigints larger than 64 bits", () => {
      // This exceeds the 64-bit range (2^64)
      const tooBigBigint = 1n << 64n;
      expect(() => new BitField(tooBigBigint)).toThrow();
    });

    it("gracefully handles non-integers when resolving", () => {
      expect(() => BitField.resolve(5.5 as never)).toThrow();
    });
  });

  describe("Real-world Usage Examples", () => {
    // Using TestFlags as a permissions system
    it("demonstrates permission checking", () => {
      // User has First, Third, and Fifth permissions
      const userPermissions = new BitField<TestFlags>(
        TestFlags.First | TestFlags.Third | TestFlags.Fifth,
      );

      // Check if user has specific permissions
      expect(userPermissions.has(TestFlags.First)).toBe(true);
      expect(userPermissions.has(TestFlags.Second)).toBe(false);

      // Check if user has ALL of these permissions
      expect(userPermissions.has(TestFlags.First | TestFlags.Third)).toBe(true);
      expect(userPermissions.has(TestFlags.First | TestFlags.Second)).toBe(
        false,
      );

      // Check if user has ANY of these permissions
      expect(userPermissions.hasAny(TestFlags.Second, TestFlags.Third)).toBe(
        true,
      );
      expect(userPermissions.hasAny(TestFlags.Second, TestFlags.Sixth)).toBe(
        false,
      );

      // Give the user additional permissions
      userPermissions.add(TestFlags.Second);
      expect(userPermissions.has(TestFlags.Second)).toBe(true);

      // Remove a permission from the user
      userPermissions.remove(TestFlags.First);
      expect(userPermissions.has(TestFlags.First)).toBe(false);
    });

    it("demonstrates feature flags", () => {
      // Define feature flags
      enum Features {
        None = 0,
        DarkMode = 1 << 0,
        BetaFeatures = 1 << 1,
        AdvancedUI = 1 << 2,
        ExperimentalFeatures = 1 << 3,
      }

      // User with dark mode and beta features enabled
      const userFeatures = new BitField<Features>(
        Features.DarkMode | Features.BetaFeatures,
      );

      // Check if features are enabled
      expect(userFeatures.has(Features.DarkMode)).toBe(true);
      expect(userFeatures.has(Features.AdvancedUI)).toBe(false);

      // Enable a new feature
      userFeatures.add(Features.AdvancedUI);
      expect(userFeatures.has(Features.AdvancedUI)).toBe(true);

      // Toggle a feature
      userFeatures.toggle(Features.BetaFeatures);
      expect(userFeatures.has(Features.BetaFeatures)).toBe(false);

      // Check all enabled features
      const enabledFeatures = userFeatures.toArray();
      expect(enabledFeatures).toContain(1n); // DarkMode
      expect(enabledFeatures).toContain(4n); // AdvancedUI
      expect(enabledFeatures).not.toContain(2n); // BetaFeatures was toggled off
    });
  });
});
