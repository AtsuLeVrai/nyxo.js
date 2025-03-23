import { beforeEach, describe, expect, it } from "vitest";
import {
  ComponentType,
  SelectMenuOptionBuilder,
  StringSelectMenuBuilder,
} from "../src/index.js";

describe("StringSelectMenuBuilder", () => {
  let builder: StringSelectMenuBuilder;

  beforeEach(() => {
    builder = new StringSelectMenuBuilder();
  });

  describe("constructor", () => {
    it("should create a default string select menu", () => {
      expect(builder.toJson()).toEqual({
        type: ComponentType.StringSelect,
        custom_id: "",
        options: [],
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.StringSelect,
        custom_id: "test-menu",
        placeholder: "Select an option",
        options: [{ label: "Option 1", value: "option1" }],
      };

      // @ts-expect-error Testing invalid input
      const customBuilder = new StringSelectMenuBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing string select menu", () => {
      const menu = {
        type: ComponentType.StringSelect,
        custom_id: "test-menu",
        placeholder: "Select an option",
        options: [{ label: "Option 1", value: "option1" }],
      };

      // @ts-expect-error Testing invalid input
      const newBuilder = StringSelectMenuBuilder.from(menu);

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
      builder.setPlaceholder("Select an option");

      expect(builder.toJson().placeholder).toBe("Select an option");
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

  describe("addOptions", () => {
    it("should add option objects", () => {
      const option = { label: "Option 1", value: "option1" };

      builder.addOptions(option);

      expect(builder.toJson().options).toContain(option);
    });

    it("should add options from SelectMenuOptionBuilder", () => {
      const optionBuilder = new SelectMenuOptionBuilder()
        .setLabel("Option 1")
        .setValue("option1");

      builder.addOptions(optionBuilder);

      expect(builder.toJson().options[0]).toEqual({
        label: "Option 1",
        value: "option1",
      });
    });

    it("should throw when adding more than 25 options", () => {
      // Add 25 options first (which is fine)
      for (let i = 0; i < 25; i++) {
        builder.addOptions({ label: `Option ${i}`, value: `option${i}` });
      }

      // Adding a 26th should throw
      expect(() => {
        builder.addOptions({ label: "Too Many", value: "toomany" });
      }).toThrow("Select menu cannot contain more than 25 options");
    });

    it("should throw with invalid options", () => {
      expect(() =>
        builder.addOptions({ label: "", value: "invalid" }),
      ).toThrow();
    });
  });

  describe("setOptions", () => {
    it("should set options, replacing existing ones", () => {
      // Add initial options
      builder.addOptions(
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" },
      );

      // Replace with new options
      const newOptions = [
        { label: "New Option 1", value: "new1" },
        { label: "New Option 2", value: "new2" },
      ];

      builder.setOptions(...newOptions);

      expect(builder.toJson().options).toEqual(newOptions);
    });
  });

  describe("build", () => {
    it("should return the validated string select menu", () => {
      builder
        .setCustomId("test-menu")
        .setPlaceholder("Select an option")
        .addOptions(
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        );

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.StringSelect,
        custom_id: "test-menu",
        placeholder: "Select an option",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
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
        .setPlaceholder("Select an option")
        .addOptions(
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        );

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
        .setPlaceholder("Select an option")
        .addOptions(
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        );

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.StringSelect,
        custom_id: "test-menu",
        placeholder: "Select an option",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid string select menu", () => {
      builder
        .setCustomId("test-menu")
        .addOptions({ label: "Option 1", value: "option1" });

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid string select menu", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
