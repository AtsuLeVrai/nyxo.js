import { beforeEach, describe, expect, it } from "vitest";
import { SelectMenuOptionBuilder } from "../src/index.js";

describe("SelectMenuOptionBuilder", () => {
  let builder: SelectMenuOptionBuilder;

  beforeEach(() => {
    builder = new SelectMenuOptionBuilder();
  });

  describe("constructor", () => {
    it("should create a default select menu option", () => {
      expect(builder.toJson()).toEqual({
        label: "",
        value: "",
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        label: "Option 1",
        value: "option1",
        description: "First option",
      };

      const customBuilder = new SelectMenuOptionBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing select menu option", () => {
      const option = {
        label: "Option 1",
        value: "option1",
        description: "First option",
      };

      const newBuilder = SelectMenuOptionBuilder.from(option);

      expect(newBuilder.toJson()).toEqual(option);
    });
  });

  describe("setLabel", () => {
    it("should set the label", () => {
      builder.setLabel("Option 1");

      expect(builder.toJson().label).toBe("Option 1");
    });

    it("should throw when label is empty", () => {
      expect(() => builder.setLabel("")).toThrow();
    });

    it("should throw when label is too long", () => {
      const longLabel = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setLabel(longLabel)).toThrow();
    });
  });

  describe("setValue", () => {
    it("should set the value", () => {
      builder.setValue("option1");

      expect(builder.toJson().value).toBe("option1");
    });

    it("should throw when value is empty", () => {
      expect(() => builder.setValue("")).toThrow();
    });

    it("should throw when value is too long", () => {
      const longValue = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setValue(longValue)).toThrow();
    });
  });

  describe("setDescription", () => {
    it("should set the description", () => {
      builder.setDescription("First option");

      expect(builder.toJson().description).toBe("First option");
    });

    it("should throw when description is too long", () => {
      const longDescription = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setDescription(longDescription)).toThrow();
    });
  });

  describe("setEmoji", () => {
    it("should set the emoji", () => {
      const emoji = { id: "123456789", name: "test_emoji" };

      builder.setEmoji(emoji);

      expect(builder.toJson().emoji).toEqual({
        id: "123456789",
        name: "test_emoji",
      });
    });

    it("should set an animated emoji", () => {
      const emoji = { id: "123456789", name: "test_emoji", animated: true };

      builder.setEmoji(emoji);

      expect(builder.toJson().emoji).toEqual({
        id: "123456789",
        name: "test_emoji",
        animated: true,
      });
    });

    it("should throw with invalid emoji data", () => {
      // biome-ignore lint/suspicious/noExplicitAny: This is intentional for testing
      const invalidEmoji = { id: 123 as any, name: "test_emoji" };

      expect(() => builder.setEmoji(invalidEmoji)).toThrow();
    });
  });

  describe("setDefault", () => {
    it("should set the default state", () => {
      builder.setDefault(true);

      expect(builder.toJson().default).toBe(true);
    });

    it("should unset the default state", () => {
      builder.setDefault(true);
      builder.setDefault(false);

      expect(builder.toJson().default).toBe(false);
    });
  });

  describe("build", () => {
    it("should return the validated select menu option", () => {
      builder
        .setLabel("Option 1")
        .setValue("option1")
        .setDescription("First option")
        .setDefault(true);

      const result = builder.build();

      expect(result).toEqual({
        label: "Option 1",
        value: "option1",
        description: "First option",
        default: true,
      });
    });

    it("should throw if validation fails", () => {
      // Intentionally create an invalid option (missing required fields)
      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setLabel("Option 1")
        .setValue("option1")
        .setDescription("First option")
        .setDefault(true);

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
        .setLabel("Option 1")
        .setValue("option1")
        .setDescription("First option")
        .setDefault(true);

      const json = builder.toJson();

      expect(json).toEqual({
        label: "Option 1",
        value: "option1",
        description: "First option",
        default: true,
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid select menu option", () => {
      builder.setLabel("Option 1").setValue("option1");

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid select menu option", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
