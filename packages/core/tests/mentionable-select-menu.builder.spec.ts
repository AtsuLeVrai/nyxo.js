import { beforeEach, describe, expect, it } from "vitest";
import { ComponentType, MentionableSelectMenuBuilder } from "../src/index.js";

describe("MentionableSelectMenuBuilder", () => {
  let builder: MentionableSelectMenuBuilder;

  beforeEach(() => {
    builder = new MentionableSelectMenuBuilder();
  });

  describe("constructor", () => {
    it("should create a default mentionable select menu", () => {
      expect(builder.toJson()).toEqual({
        type: ComponentType.MentionableSelect,
        custom_id: "",
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.MentionableSelect,
        custom_id: "test-menu",
        placeholder: "Select users or roles",
      };

      // @ts-expect-error
      const customBuilder = new MentionableSelectMenuBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing mentionable select menu", () => {
      const menu = {
        type: ComponentType.MentionableSelect,
        custom_id: "test-menu",
        placeholder: "Select users or roles",
      };

      // @ts-expect-error
      const newBuilder = MentionableSelectMenuBuilder.from(menu);

      expect(newBuilder.toJson()).toEqual(menu);
    });
  });

  describe("setCustomId", () => {
    it("should set the custom ID", () => {
      builder.setCustomId("test-menu");

      expect(builder.toJson().custom_id).toBe("test-menu");
    });

    it("should throw when custom ID is too long", () => {
      const longId = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setCustomId(longId)).toThrow();
    });
  });

  describe("setPlaceholder", () => {
    it("should set the placeholder", () => {
      builder.setPlaceholder("Select users or roles");

      expect(builder.toJson().placeholder).toBe("Select users or roles");
    });

    it("should throw when placeholder is too long", () => {
      const longPlaceholder = "a".repeat(151); // 151 characters, limit is 150

      expect(() => builder.setPlaceholder(longPlaceholder)).toThrow();
    });
  });

  describe("setMinValues", () => {
    it("should set the minimum values", () => {
      builder.setMinValues(1);

      expect(builder.toJson().min_values).toBe(1);
    });

    it("should throw when min values is negative", () => {
      expect(() => builder.setMinValues(-1)).toThrow();
    });

    it("should throw when min values exceeds 25", () => {
      expect(() => builder.setMinValues(26)).toThrow();
    });
  });

  describe("setMaxValues", () => {
    it("should set the maximum values", () => {
      builder.setMaxValues(5);

      expect(builder.toJson().max_values).toBe(5);
    });

    it("should throw when max values is less than 1", () => {
      expect(() => builder.setMaxValues(0)).toThrow();
    });

    it("should throw when max values exceeds 25", () => {
      expect(() => builder.setMaxValues(26)).toThrow();
    });
  });

  describe("setDisabled", () => {
    it("should set the disabled state", () => {
      builder.setDisabled(true);

      expect(builder.toJson().disabled).toBe(true);
    });
  });

  describe("addDefaultUsers", () => {
    it("should add default users", () => {
      builder.addDefaultUsers("123456789", "987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "user" },
        { id: "987654321", type: "user" },
      ]);
    });

    it("should append to existing default values", () => {
      // Add initial default user
      builder.addDefaultUsers("123456789");

      // Add another
      builder.addDefaultUsers("987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "user" },
        { id: "987654321", type: "user" },
      ]);
    });
  });

  describe("addDefaultRoles", () => {
    it("should add default roles", () => {
      builder.addDefaultRoles("123456789", "987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "role" },
        { id: "987654321", type: "role" },
      ]);
    });

    it("should append to existing default values", () => {
      // Add initial default role
      builder.addDefaultRoles("123456789");

      // Add another
      builder.addDefaultRoles("987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "role" },
        { id: "987654321", type: "role" },
      ]);
    });
  });

  describe("setDefaultMentionables", () => {
    it("should set default users and roles, replacing existing ones", () => {
      // Add initial defaults
      builder.addDefaultUsers("111111111");
      builder.addDefaultRoles("222222222");

      // Replace with new defaults
      builder.setDefaultMentionables({
        users: ["333333333", "444444444"],
        roles: ["555555555", "666666666"],
      });

      expect(builder.toJson().default_values).toEqual([
        { id: "333333333", type: "user" },
        { id: "444444444", type: "user" },
        { id: "555555555", type: "role" },
        { id: "666666666", type: "role" },
      ]);
    });

    it("should handle empty arrays", () => {
      builder.setDefaultMentionables({
        users: [],
        roles: [],
      });

      expect(builder.toJson().default_values).toEqual([]);
    });

    it("should handle missing arrays", () => {
      builder.setDefaultMentionables({
        users: ["123456789"],
      });

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "user" },
      ]);
    });
  });

  describe("addDefaultValues", () => {
    it("should add default values", () => {
      const defaults = [
        { id: "123456789", type: "user" as const },
        { id: "987654321", type: "role" as const },
      ];

      builder.addDefaultValues(...defaults);

      expect(builder.toJson().default_values).toEqual(defaults);
    });

    it("should throw with invalid default values", () => {
      expect(() =>
        // biome-ignore lint/suspicious/noExplicitAny: This is intentional
        builder.addDefaultValues({ id: "123456789", type: "invalid" as any }),
      ).toThrow();
    });
  });

  describe("setDefaultValues", () => {
    it("should set default values, replacing existing ones", () => {
      // Add initial default values
      builder.addDefaultValues(
        { id: "111111111", type: "user" as const },
        { id: "222222222", type: "role" as const },
      );

      // Replace with new defaults
      const newDefaults = [
        { id: "333333333", type: "user" as const },
        { id: "444444444", type: "role" as const },
      ];

      builder.setDefaultValues(...newDefaults);

      expect(builder.toJson().default_values).toEqual(newDefaults);
    });
  });

  describe("build", () => {
    it("should return the validated mentionable select menu", () => {
      builder
        .setCustomId("test-menu")
        .setPlaceholder("Select users or roles")
        .setMinValues(1)
        .setMaxValues(3);

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.MentionableSelect,
        custom_id: "test-menu",
        placeholder: "Select users or roles",
        min_values: 1,
        max_values: 3,
      });
    });

    it("should throw if validation fails", () => {
      // Intentionally create an invalid menu (empty custom_id)
      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setCustomId("test-menu")
        .setPlaceholder("Select users or roles")
        .setMinValues(1)
        .setMaxValues(3);

      const clone = builder.clone();

      // Should be a different instance
      expect(clone).not.toBe(builder);

      // But with the same data
      expect(clone.toJson()).toEqual(builder.toJson());
    });
  });

  describe("toJson", () => {
    it("should return the JSON representation", () => {
      builder
        .setCustomId("test-menu")
        .setPlaceholder("Select users or roles")
        .setMinValues(1)
        .setMaxValues(3);

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.MentionableSelect,
        custom_id: "test-menu",
        placeholder: "Select users or roles",
        min_values: 1,
        max_values: 3,
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid mentionable select menu", () => {
      builder.setCustomId("test-menu");

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid mentionable select menu", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
