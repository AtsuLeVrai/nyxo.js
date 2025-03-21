import { describe, expect, it } from "vitest";
import { BitFieldManager, UserFlags } from "../src/index.js";

const UserFlagsAll = BitFieldManager.combine<UserFlags>(
  ...Object.values(UserFlags).filter(Number),
).valueOf();

describe("BitFieldManager with UserFlags", () => {
  // Static methods
  describe("static methods", () => {
    describe("from", () => {
      it("should create a BitFieldManager with the given values", () => {
        const bitfield = BitFieldManager.from<UserFlags>(
          UserFlags.Staff,
          UserFlags.HypeSquad,
        );
        expect(bitfield.valueOf()).toBe(5n); // 1 + 4 = 5
      });

      it("should handle empty arguments", () => {
        const bitfield = BitFieldManager.from<UserFlags>();
        expect(bitfield.valueOf()).toBe(0n);
      });
    });

    describe("safeBigInt", () => {
      it("should convert valid values to bigint", () => {
        expect(BitFieldManager.safeBigInt(5n)).toBe(5n);
        expect(BitFieldManager.safeBigInt(10)).toBe(10n);
        expect(BitFieldManager.safeBigInt("15")).toBe(15n);
      });

      it("should throw for invalid values", () => {
        expect(() => BitFieldManager.safeBigInt({})).toThrow();
        expect(() => BitFieldManager.safeBigInt(-1)).toThrow();
        expect(() => BitFieldManager.safeBigInt("invalid")).toThrow();
      });
    });

    describe("resolve", () => {
      it("should resolve single values", () => {
        expect(BitFieldManager.resolve<UserFlags>(UserFlags.Staff)).toBe(1n);
        expect(BitFieldManager.resolve<UserFlags>(UserFlags.Partner)).toBe(2n);
      });

      it("should resolve multiple values", () => {
        expect(
          BitFieldManager.resolve<UserFlags>(
            UserFlags.Staff,
            UserFlags.HypeSquad,
          ),
        ).toBe(5n);
      });

      it("should resolve arrays of values", () => {
        expect(
          BitFieldManager.resolve<UserFlags>([
            UserFlags.Staff,
            UserFlags.HypeSquad,
          ]),
        ).toBe(5n);
      });

      it("should resolve mixed arrays and individual values", () => {
        expect(
          BitFieldManager.resolve<UserFlags>(
            UserFlags.Staff,
            [UserFlags.Partner, UserFlags.HypeSquad],
            UserFlags.BugHunterLevel1,
          ),
        ).toBe(15n);
      });

      it("should handle null/undefined values", () => {
        // @ts-expect-error
        expect(BitFieldManager.resolve<UserFlags>(null)).toBe(0n);
        // @ts-expect-error
        expect(BitFieldManager.resolve<UserFlags>(undefined)).toBe(0n);
      });

      it("should throw for invalid values", () => {
        expect(() => BitFieldManager.resolve<UserFlags>("invalid")).toThrow();
        // @ts-expect-error
        expect(() => BitFieldManager.resolve<UserFlags>({})).toThrow();
      });
    });

    describe("isValidBitField", () => {
      it("should return true for valid bitfields", () => {
        expect(BitFieldManager.isValidBitField(5n)).toBe(true);
        expect(BitFieldManager.isValidBitField(10)).toBe(true);
        expect(BitFieldManager.isValidBitField("15")).toBe(true);
      });

      it("should return false for invalid bitfields", () => {
        expect(BitFieldManager.isValidBitField({})).toBe(false);
        expect(BitFieldManager.isValidBitField(-1)).toBe(false);
        expect(BitFieldManager.isValidBitField("invalid")).toBe(false);
      });
    });

    describe("combine", () => {
      it("should combine multiple bitfields with OR", () => {
        const bf1 = new BitFieldManager<UserFlags>(UserFlags.Staff);
        const bf2 = new BitFieldManager<UserFlags>(UserFlags.HypeSquad);

        const combined = BitFieldManager.combine(bf1, bf2);
        expect(combined.valueOf()).toBe(5n);
      });

      it("should handle mixed types of values", () => {
        const bf1 = new BitFieldManager<UserFlags>(UserFlags.Staff);

        const combined = BitFieldManager.combine(bf1, 2n, 4);
        expect(combined.valueOf()).toBe(7n);
      });
    });

    describe("intersection", () => {
      it("should find the intersection with AND", () => {
        const bf1 = new BitFieldManager<UserFlags>(
          UserFlags.Staff | UserFlags.Partner,
        );
        const bf2 = new BitFieldManager<UserFlags>(
          UserFlags.Partner | UserFlags.HypeSquad,
        );

        const intersection = BitFieldManager.intersection(bf1, bf2);
        expect(intersection.valueOf()).toBe(2n); // Only Partner is common
      });

      it("should return empty bitfield for no intersection", () => {
        const bf1 = new BitFieldManager<UserFlags>(UserFlags.Staff);
        const bf2 = new BitFieldManager<UserFlags>(UserFlags.HypeSquad);

        const intersection = BitFieldManager.intersection(bf1, bf2);
        expect(intersection.valueOf()).toBe(0n);
      });

      it("should handle empty arguments", () => {
        const intersection = BitFieldManager.intersection<UserFlags>();
        expect(intersection.valueOf()).toBe(0n);
      });
    });

    describe("xor", () => {
      it("should perform XOR on bitfields", () => {
        const bf1 = new BitFieldManager<UserFlags>(
          UserFlags.Staff | UserFlags.Partner,
        );
        const bf2 = new BitFieldManager<UserFlags>(
          UserFlags.Partner | UserFlags.HypeSquad,
        );

        const result = BitFieldManager.xor(bf1, bf2);
        expect(result.valueOf()).toBe(5n); // Staff ^ Partner ^ Partner ^ HypeSquad = Staff ^ HypeSquad = 5
      });
    });

    // Instance methods
    describe("instance methods", () => {
      describe("constructor", () => {
        it("should create an instance with default value 0n", () => {
          const bitfield = new BitFieldManager<UserFlags>();
          expect(bitfield.valueOf()).toBe(0n);
        });

        it("should create an instance with given values", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff,
            UserFlags.HypeSquad,
          );
          expect(bitfield.valueOf()).toBe(5n);
        });
      });

      describe("has", () => {
        it("should check if bitfield has a specific bit", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.has(UserFlags.Staff)).toBe(true);
          expect(bitfield.has(UserFlags.Partner)).toBe(false);
          expect(bitfield.has(UserFlags.HypeSquad)).toBe(true);
          expect(bitfield.has(UserFlags.BugHunterLevel1)).toBe(false);
        });
      });

      describe("hasAll", () => {
        it("should check if bitfield has all specified bits", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.hasAll(UserFlags.Staff)).toBe(true);
          expect(bitfield.hasAll(UserFlags.Staff, UserFlags.HypeSquad)).toBe(
            true,
          );
          expect(bitfield.hasAll(UserFlags.Staff, UserFlags.Partner)).toBe(
            false,
          );
        });
      });

      describe("hasAny", () => {
        it("should check if bitfield has any of the specified bits", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.hasAny(UserFlags.Staff)).toBe(true);
          expect(bitfield.hasAny(UserFlags.Staff, UserFlags.Partner)).toBe(
            true,
          );
          expect(
            bitfield.hasAny(UserFlags.Partner, UserFlags.BugHunterLevel1),
          ).toBe(false);
        });
      });

      describe("missing", () => {
        it("should return the bits that are missing", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          const missing = bitfield.missing(
            UserFlags.Staff,
            UserFlags.Partner,
            UserFlags.HypeSquad,
          );
          expect(missing).toEqual([2n]); // Only Partner is missing
        });
      });

      describe("isEmpty", () => {
        it("should check if the bitfield is empty", () => {
          expect(new BitFieldManager<UserFlags>().isEmpty()).toBe(true);
          expect(
            new BitFieldManager<UserFlags>(UserFlags.Staff).isEmpty(),
          ).toBe(false);
        });
      });

      describe("equals", () => {
        it("should check if bitfields are equal", () => {
          const bf1 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );
          const bf2 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );
          const bf3 = new BitFieldManager<UserFlags>(UserFlags.Partner);

          // @ts-expect-error
          expect(bf1.equals(bf2)).toBe(true);
          expect(bf1.equals(5n)).toBe(true);
          // @ts-expect-error
          expect(bf1.equals(bf3)).toBe(false);
        });
      });

      describe("add", () => {
        it("should add bits to the bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlags.Staff);

          bitfield.add(UserFlags.HypeSquad);
          expect(bitfield.valueOf()).toBe(5n);

          bitfield.add(UserFlags.Partner, UserFlags.BugHunterLevel1);
          expect(bitfield.valueOf()).toBe(15n);
        });

        it("should be chainable", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          bitfield.add(UserFlags.Staff).add(UserFlags.HypeSquad);
          expect(bitfield.valueOf()).toBe(5n);
        });
      });

      describe("remove", () => {
        it("should remove bits from the bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          bitfield.remove(UserFlags.Staff);
          expect(bitfield.valueOf()).toBe(UserFlagsAll - 1n);

          bitfield.remove(UserFlags.Partner, UserFlags.BugHunterLevel1);
          const expectedValue = UserFlagsAll - 1n - 2n - 8n;
          expect(bitfield.valueOf()).toBe(expectedValue);
        });

        it("should be chainable", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          bitfield.remove(UserFlags.Staff).remove(UserFlags.HypeSquad);
          const expectedValue = UserFlagsAll - 1n - 4n;
          expect(bitfield.valueOf()).toBe(expectedValue);
        });
      });

      describe("toggle", () => {
        it("should toggle bits in the bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          bitfield.toggle(UserFlags.Staff);
          expect(bitfield.valueOf()).toBe(4n);

          bitfield.toggle(UserFlags.Partner, UserFlags.HypeSquad);
          expect(bitfield.valueOf()).toBe(2n);
        });

        it("should be chainable", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlags.Staff);

          bitfield.toggle(UserFlags.Staff).toggle(UserFlags.Partner);
          expect(bitfield.valueOf()).toBe(2n);
        });
      });

      describe("set", () => {
        it("should set the bitfield to the specified value", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlags.Staff);

          bitfield.set(UserFlags.HypeSquad);
          expect(bitfield.valueOf()).toBe(4n);
        });

        it("should be chainable", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          bitfield.set(UserFlags.Staff).set(UserFlags.Partner);
          expect(bitfield.valueOf()).toBe(2n);
        });
      });

      describe("clear", () => {
        it("should clear all bits", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          bitfield.clear();
          expect(bitfield.valueOf()).toBe(0n);
        });

        it("should be chainable", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          bitfield.clear().add(UserFlags.Staff);
          expect(bitfield.valueOf()).toBe(1n);
        });
      });

      describe("clone", () => {
        it("should create a new instance with the same bits", () => {
          const original = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );
          const clone = original.clone();

          expect(clone.valueOf()).toBe(5n);
          expect(clone).not.toBe(original);

          // Modifying the clone should not affect the original
          clone.add(UserFlags.Partner);
          expect(clone.valueOf()).toBe(7n);
          expect(original.valueOf()).toBe(5n);
        });
      });

      describe("toArray", () => {
        it("should convert the bitfield to an array of powers of 2", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.toArray()).toEqual([1n, 4n]);
        });

        it("should return an empty array for empty bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          expect(bitfield.toArray()).toEqual([]);
        });
      });

      describe("toString", () => {
        it("should convert the bitfield to a string representation", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.toString()).toBe("5");
          expect(bitfield.toString(16)).toBe("5");
          expect(bitfield.toString(2)).toBe("101");
        });
      });

      describe("toNumber", () => {
        it("should convert the bitfield to a number", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.toNumber()).toBe(5);
        });

        it("should throw if the value exceeds MAX_SAFE_INTEGER", () => {
          const bigValue = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
          const bitfield = new BitFieldManager<UserFlags>(bigValue);

          expect(() => bitfield.toNumber()).toThrow();
        });
      });

      describe("valueOf", () => {
        it("should return the raw bigint value", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.valueOf()).toBe(5n);
        });
      });

      describe("isBitSet", () => {
        it("should check if a specific bit position is set", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.isBitSet(0)).toBe(true);
          expect(bitfield.isBitSet(1)).toBe(false);
          expect(bitfield.isBitSet(2)).toBe(true);
        });

        it("should throw for invalid positions", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          expect(() => bitfield.isBitSet(-1)).toThrow();
          expect(() => bitfield.isBitSet(64)).toThrow();
          expect(() => bitfield.isBitSet(3.5)).toThrow();
        });
      });

      describe("difference", () => {
        it("should return a bitfield with the bits that are in this but not in the other", () => {
          const bf1 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.Partner | UserFlags.HypeSquad,
          );
          const bf2 = new BitFieldManager<UserFlags>(
            UserFlags.Partner | UserFlags.BugHunterLevel1,
          );

          // @ts-expect-error
          const diff = bf1.difference(bf2);
          expect(diff.valueOf()).toBe(5n); // Staff | HypeSquad
        });
      });

      describe("intersects", () => {
        it("should check if bitfields have any bits in common", () => {
          const bf1 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.Partner,
          );
          const bf2 = new BitFieldManager<UserFlags>(
            UserFlags.Partner | UserFlags.HypeSquad,
          );
          const bf3 = new BitFieldManager<UserFlags>(UserFlags.BugHunterLevel1);

          // @ts-expect-error
          expect(bf1.intersects(bf2)).toBe(true);
          // @ts-expect-error
          expect(bf1.intersects(bf3)).toBe(false);
        });
      });

      describe("isSubset", () => {
        it("should check if this bitfield is a subset of another", () => {
          const bf1 = new BitFieldManager<UserFlags>(UserFlags.Staff);
          const bf2 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.Partner,
          );

          // @ts-expect-error
          expect(bf1.isSubset(bf2)).toBe(true);
          // @ts-expect-error
          expect(bf2.isSubset(bf1)).toBe(false);
        });
      });

      describe("isSuperset", () => {
        it("should check if this bitfield is a superset of another", () => {
          const bf1 = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.Partner,
          );
          const bf2 = new BitFieldManager<UserFlags>(UserFlags.Staff);

          // @ts-expect-error
          expect(bf1.isSuperset(bf2)).toBe(true);
          // @ts-expect-error
          expect(bf2.isSuperset(bf1)).toBe(false);
        });
      });

      describe("setBit", () => {
        it("should set a specific bit position", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlags.Staff);

          bitfield.setBit(2);
          expect(bitfield.valueOf()).toBe(5n); // Staff | HypeSquad
        });

        it("should throw for invalid positions", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          expect(() => bitfield.setBit(-1)).toThrow();
          expect(() => bitfield.setBit(64)).toThrow();
          expect(() => bitfield.setBit(3.5)).toThrow();
        });
      });

      describe("clearBit", () => {
        it("should clear a specific bit position", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          bitfield.clearBit(0);
          expect(bitfield.valueOf()).toBe(4n); // Only HypeSquad left
        });

        it("should throw for invalid positions", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          expect(() => bitfield.clearBit(-1)).toThrow();
          expect(() => bitfield.clearBit(64)).toThrow();
          expect(() => bitfield.clearBit(3.5)).toThrow();
        });
      });

      describe("toggleBit", () => {
        it("should toggle a specific bit position", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          bitfield.toggleBit(0);
          expect(bitfield.valueOf()).toBe(4n); // Only HypeSquad left

          bitfield.toggleBit(1);
          expect(bitfield.valueOf()).toBe(6n); // Partner | HypeSquad
        });

        it("should throw for invalid positions", () => {
          const bitfield = new BitFieldManager<UserFlags>(UserFlagsAll);

          expect(() => bitfield.toggleBit(-1)).toThrow();
          expect(() => bitfield.toggleBit(64)).toThrow();
          expect(() => bitfield.toggleBit(3.5)).toThrow();
        });
      });

      describe("getSetBitPositions", () => {
        it("should return an array of positions where bits are set", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.getSetBitPositions()).toEqual([0, 2]);
        });

        it("should return an empty array for empty bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          expect(bitfield.getSetBitPositions()).toEqual([]);
        });
      });

      describe("popCount", () => {
        it("should count the number of set bits", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );

          expect(bitfield.popCount()).toBe(2);
        });

        it("should return 0 for empty bitfield", () => {
          const bitfield = new BitFieldManager<UserFlags>();

          expect(bitfield.popCount()).toBe(0);
        });
      });

      describe("iteration", () => {
        it("should be iterable", () => {
          const bitfield = new BitFieldManager<UserFlags>(
            UserFlags.Staff | UserFlags.HypeSquad,
          );
          const values = [];

          for (const bit of bitfield) {
            values.push(bit);
          }

          expect(values).toEqual([1n, 4n]);
        });
      });
    });

    // Add Discord-specific user flag tests
    describe("Discord User Flags", () => {
      it("should correctly work with real Discord flags", () => {
        // Create a user with Staff, HypeSquad and ActiveDeveloper flags
        const userBitfield = new BitFieldManager<UserFlags>(
          UserFlags.Staff | UserFlags.HypeSquad | UserFlags.ActiveDeveloper,
        );

        // Check if the user has specific flags
        expect(userBitfield.has(UserFlags.Staff)).toBe(true);
        expect(userBitfield.has(UserFlags.HypeSquad)).toBe(true);
        expect(userBitfield.has(UserFlags.ActiveDeveloper)).toBe(true);
        expect(userBitfield.has(UserFlags.Partner)).toBe(false);

        // Check the value (Staff = 1, HypeSquad = 4, ActiveDeveloper = 1 << 22 = 4194304)
        const expectedValue = 1n + 4n + (1n << 22n);
        expect(userBitfield.valueOf()).toBe(expectedValue);

        // Add VerifiedDeveloper flag
        userBitfield.add(UserFlags.VerifiedDeveloper);
        expect(userBitfield.has(UserFlags.VerifiedDeveloper)).toBe(true);

        // Remove Staff flag
        userBitfield.remove(UserFlags.Staff);
        expect(userBitfield.has(UserFlags.Staff)).toBe(false);

        // Test with Discord's HypeSquad Houses
        const hypeSquadHouses = new BitFieldManager<UserFlags>(
          UserFlags.HypeSquadOnlineHouse1 |
            UserFlags.HypeSquadOnlineHouse2 |
            UserFlags.HypeSquadOnlineHouse3,
        );

        // House Bravery (1 << 6), House Brilliance (1 << 7), House Balance (1 << 8)
        const expectedHouseValue = (1n << 6n) + (1n << 7n) + (1n << 8n);
        expect(hypeSquadHouses.valueOf()).toBe(expectedHouseValue);
      });

      it("should handle complex operations with Discord flags", () => {
        // Create moderator staff with certification
        const modStaff = new BitFieldManager<UserFlags>(
          UserFlags.Staff | UserFlags.CertifiedModerator,
        );

        // Create regular staff without certification
        const regularStaff = new BitFieldManager<UserFlags>(UserFlags.Staff);

        // Difference should be just CertifiedModerator flag
        // @ts-expect-error
        const certificationOnly = modStaff.difference(regularStaff);
        expect(certificationOnly.valueOf()).toBe(
          BigInt(UserFlags.CertifiedModerator),
        );

        // Create a BugHunter with both levels
        const bugHunter = new BitFieldManager<UserFlags>(
          UserFlags.BugHunterLevel1 | UserFlags.BugHunterLevel2,
        );

        // Check if the values match expected
        expect(bugHunter.valueOf()).toBe(
          BigInt(UserFlags.BugHunterLevel1 | UserFlags.BugHunterLevel2),
        );
      });
    });
  });
});
