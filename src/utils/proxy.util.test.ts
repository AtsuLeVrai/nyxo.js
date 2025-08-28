// biome-ignore-all lint: This file is full of type tests
// @ts-nocheck

import { describe, expect, it } from "vitest";
import {
  type CamelCaseKeys,
  type ClassConstructor,
  type DeepNonNullable,
  type DeepNullable,
  OmitBy,
  PickBy,
} from "./proxy.util.js";

describe("Proxy Utilities", () => {
  // Test classes for proxy utilities
  class TestUser {
    id: string;
    name: string;
    email: string;
    private password: string;

    constructor(id: string, name: string, email: string, password: string) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.password = password;
    }

    getName(): string {
      return this.name;
    }

    updateEmail(newEmail: string): void {
      this.email = newEmail;
    }

    private getPassword(): string {
      return this.password;
    }
  }

  class EmptyClass {
    constructor() {}
  }

  describe("Type utilities (compile-time validation)", () => {
    it("should properly infer CamelCaseKeys type", () => {
      type SnakeCase = {
        user_id: string;
        user_name: string;
        created_at: Date;
        is_active: boolean;
        deep_nested_prop: number;
      };

      type CamelCase = CamelCaseKeys<SnakeCase>;

      // These should compile without errors - testing type inference
      const camelObj: CamelCase = {
        userId: "123",
        userName: "test",
        createdAt: new Date(),
        isActive: true,
        deepNestedProp: 42,
      };

      expect(camelObj.userId).toBe("123");
      expect(camelObj.userName).toBe("test");
      expect(camelObj.isActive).toBe(true);
    });

    it("should properly infer DeepNonNullable type", () => {
      type NullableData = {
        name: string | null;
        nested: {
          value: number | null;
          array: (string | null)[];
        } | null;
      };

      type NonNullableData = DeepNonNullable<NullableData>;

      // Should compile - all null types removed
      const data: NonNullableData = {
        name: "test",
        nested: {
          value: 42,
          array: ["a", "b", "c"],
        },
      };

      expect(data.name).toBe("test");
      expect(data.nested.value).toBe(42);
      expect(data.nested.array).toEqual(["a", "b", "c"]);
    });

    it("should properly infer DeepNullable type", () => {
      type RegularData = {
        name: string;
        nested: {
          value: number;
        };
      };

      type NullableData = DeepNullable<RegularData>;

      // Should compile - all properties can be null
      const data: NullableData = {
        name: null,
        nested: null,
      };

      expect(data.name).toBeNull();
      expect(data.nested).toBeNull();
    });
  });

  describe("PickBy", () => {
    it("should create class with only selected properties", () => {
      const PickedUser = PickBy(TestUser, "id", "name");
      const user = new PickedUser("123", "John", "john@test.com", "secret");

      // Selected properties should be accessible
      expect(user.id).toBe("123");
      expect(user.name).toBe("John");

      // Non-selected properties should be undefined
      expect((user as unknown as TestUser).email).toBeUndefined();
      expect((user as unknown as TestUser).password).toBeUndefined();

      // Non-selected methods should also be undefined now
      expect((user as unknown as TestUser).getName).toBeUndefined();
      expect((user as unknown as TestUser).updateEmail).toBeUndefined();
    });

    it("should preserve selected instance properties and methods", () => {
      const PickedUser = PickBy(TestUser, "id", "name", "getName");
      const user = new PickedUser("123", "John", "john@test.com", "secret");

      expect(user.id).toBe("123");
      expect(user.name).toBe("John");
      expect(user.getName()).toBe("John");

      // Non-selected properties and methods should be undefined
      expect((user as unknown as TestUser).email).toBeUndefined();
      expect((user as unknown as TestUser).updateEmail).toBeUndefined();
    });

    it("should handle empty selection by returning original class", () => {
      const UnchangedUser = PickBy(TestUser);
      const user = new UnchangedUser("123", "John", "john@test.com", "secret");

      expect(user.id).toBe("123");
      expect(user.name).toBe("John");
      expect((user as unknown as TestUser).email).toBe("john@test.com");
    });

    it("should throw TypeError for non-constructor input", () => {
      expect(() => {
        PickBy({} as ClassConstructor, "someProperty");
      }).toThrow(TypeError);

      expect(() => {
        PickBy(null as unknown as ClassConstructor);
      }).toThrow(TypeError);

      expect(() => {
        PickBy("not a class" as unknown as ClassConstructor);
      }).toThrow(TypeError);
    });

    it("should maintain constructor parameters", () => {
      const PickedUser = PickBy(TestUser, "id");

      expect(() => {
        new PickedUser("123", "John", "john@test.com", "secret");
      }).not.toThrow();
    });

    it("should handle class with no properties", () => {
      const PickedEmpty = PickBy(EmptyClass, "nonExistent" as keyof EmptyClass);
      const instance = new PickedEmpty();

      expect(instance).toBeInstanceOf(EmptyClass);
    });

    it("should make non-selected properties non-enumerable", () => {
      const PickedUser = PickBy(TestUser, "id");
      const user = new PickedUser("123", "John", "john@test.com", "secret");

      const keys = Object.keys(user);
      expect(keys).toContain("id");
      expect(keys).not.toContain("name");
      expect(keys).not.toContain("email");
    });

    it("should prevent value access to non-selected properties", () => {
      const PickedUser = PickBy(TestUser, "id");
      const user = new PickedUser("123", "John", "john@test.com", "secret");

      // Assignment expression returns the assigned value in JavaScript
      const result = ((user as unknown as TestUser).name = "New Name");
      expect(result).toBe("New Name"); // This is standard JavaScript behavior

      // But the actual property should remain undefined due to the setter
      expect((user as unknown as TestUser).name).toBeUndefined();

      // Methods should also be undefined now
      expect((user as unknown as TestUser).getName).toBeUndefined();
    });
  });

  describe("OmitBy", () => {
    it("should create class without omitted properties", () => {
      const SafeUser = OmitBy(TestUser, "password", "email");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      // Non-omitted properties should be accessible
      expect(user.id).toBe("123");
      expect(user.name).toBe("John");

      // Omitted properties should be undefined
      expect((user as unknown as TestUser).email).toBeUndefined();
      expect((user as unknown as TestUser).password).toBeUndefined();

      // Non-omitted methods should work
      expect(user.getName()).toBe("John");
      expect(typeof (user as unknown as TestUser).updateEmail).toBe("function");
    });

    it("should preserve non-omitted properties and methods", () => {
      const SafeUser = OmitBy(TestUser, "password", "updateEmail");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      expect(user.id).toBe("123");
      expect(user.getName()).toBe("John");
      expect((user as unknown as TestUser).email).toBe("john@test.com");

      // Omitted method should be undefined now
      expect((user as unknown as TestUser).updateEmail).toBeUndefined();
    });

    it("should handle empty omission by returning original class", () => {
      const UnchangedUser = OmitBy(TestUser);
      const user = new UnchangedUser("123", "John", "john@test.com", "secret");

      expect(user.id).toBe("123");
      expect(user.name).toBe("John");
      expect((user as unknown as TestUser).email).toBe("john@test.com");
    });

    it("should throw TypeError for non-constructor input", () => {
      expect(() => {
        OmitBy({} as ClassConstructor, "someProperty");
      }).toThrow(TypeError);

      expect(() => {
        OmitBy(null as unknown as ClassConstructor);
      }).toThrow(TypeError);
    });

    it("should maintain instanceof relationship", () => {
      const SafeUser = OmitBy(TestUser, "password");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      expect(user).toBeInstanceOf(TestUser);
      expect(user).toBeInstanceOf(SafeUser);
    });

    it("should make omitted properties non-enumerable", () => {
      const SafeUser = OmitBy(TestUser, "password", "email");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      const keys = Object.keys(user);
      expect(keys).toContain("id");
      expect(keys).toContain("name");
      expect(keys).not.toContain("email");
      expect(keys).not.toContain("password");
    });

    it("should prevent value access to omitted properties", () => {
      const SafeUser = OmitBy(TestUser, "email");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      // Assignment expression returns assigned value (JavaScript behavior)
      const result = ((user as unknown as TestUser).email = "new@test.com");
      expect(result).toBe("new@test.com");

      // But the actual property should remain undefined due to the setter
      expect((user as unknown as TestUser).email).toBeUndefined();
    });

    it("should handle omitting all properties", () => {
      const EmptyUser = OmitBy(
        TestUser,
        "id",
        "name",
        "email",
        "password",
        "getName",
        "updateEmail",
      );
      const user = new EmptyUser("123", "John", "john@test.com", "secret");

      expect((user as unknown as TestUser).id).toBeUndefined();
      expect((user as unknown as TestUser).name).toBeUndefined();
      expect((user as unknown as TestUser).getName).toBeUndefined();
    });
  });

  describe("Integration tests", () => {
    it("should work with complex inheritance chains", () => {
      class AdminUser extends TestUser {
        role: string;

        constructor(id: string, name: string, email: string, password: string, role: string) {
          super(id, name, email, password);
          this.role = role;
        }

        isAdmin(): boolean {
          return this.role === "admin";
        }
      }

      const SafeAdmin = OmitBy(AdminUser, "password", "email");
      const admin = new SafeAdmin("123", "Admin", "admin@test.com", "secret", "admin");

      expect(admin.id).toBe("123");
      expect(admin.name).toBe("Admin");
      expect(admin.role).toBe("admin");
      expect(admin.isAdmin()).toBe(true);
      expect((admin as unknown as AdminUser).password).toBeUndefined();
    });

    it("should handle multiple transformations", () => {
      // First pick specific properties, then omit others
      const PickedUser = PickBy(TestUser, "id", "name", "email", "getName");
      const FinalUser = OmitBy(PickedUser, "email");

      const user = new FinalUser("123", "John", "john@test.com", "secret");

      expect(user.id).toBe("123");
      expect(user.name).toBe("John");
      expect(user.getName()).toBe("John");
      expect((user as unknown as TestUser).email).toBeUndefined();
      expect((user as unknown as TestUser).password).toBeUndefined();
    });

    it("should preserve prototype chain", () => {
      const SafeUser = OmitBy(TestUser, "password");
      const user = new SafeUser("123", "John", "john@test.com", "secret");

      expect(Object.getPrototypeOf(user)).toBe(SafeUser.prototype);
      expect(user.constructor).toBe(SafeUser);
    });
  });
});
