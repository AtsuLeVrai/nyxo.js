import { beforeEach, describe, expect, it } from "vitest";
import {
  ComponentType,
  TextInputBuilder,
  TextInputStyle,
} from "../src/index.js";

describe("TextInputBuilder", () => {
  let builder: TextInputBuilder;

  beforeEach(() => {
    builder = new TextInputBuilder();
  });

  describe("constructor", () => {
    it("should create a default text input", () => {
      expect(builder.toJson()).toEqual({
        type: ComponentType.TextInput,
        custom_id: "",
        style: TextInputStyle.Short,
        label: "",
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Paragraph,
        label: "Test Input",
      };

      // @ts-expect-error Testing invalid input
      const customBuilder = new TextInputBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static factory methods", () => {
    it("should create from an existing text input", () => {
      const textInput = {
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Short,
        label: "Test Input",
      };

      // @ts-expect-error Testing invalid input
      const newBuilder = TextInputBuilder.from(textInput);

      expect(newBuilder.toJson()).toEqual(textInput);
    });

    it("should create a short text input", () => {
      const builder = TextInputBuilder.createShort("test-input", "Test Input");

      expect(builder.toJson()).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Short,
        label: "Test Input",
        required: true,
      });
    });

    it("should create a short text input with optional flag", () => {
      const builder = TextInputBuilder.createShort(
        "test-input",
        "Test Input",
        false,
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Short,
        label: "Test Input",
        required: false,
      });
    });

    it("should create a paragraph text input", () => {
      const builder = TextInputBuilder.createParagraph(
        "test-input",
        "Test Input",
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Paragraph,
        label: "Test Input",
        required: true,
      });
    });

    it("should create a paragraph text input with optional flag", () => {
      const builder = TextInputBuilder.createParagraph(
        "test-input",
        "Test Input",
        false,
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        style: TextInputStyle.Paragraph,
        label: "Test Input",
        required: false,
      });
    });
  });

  describe("setCustomId", () => {
    it("should set the custom ID", () => {
      builder.setCustomId("test-input");

      expect(builder.toJson().custom_id).toBe("test-input");
    });

    it("should throw when custom ID is too long", () => {
      const longId = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setCustomId(longId)).toThrow();
    });
  });

  describe("setLabel", () => {
    it("should set the label", () => {
      builder.setLabel("Test Input");

      expect(builder.toJson().label).toBe("Test Input");
    });

    it("should throw when label is empty", () => {
      expect(() => builder.setLabel("")).toThrow();
    });

    it("should throw when label is too long", () => {
      const longLabel = "a".repeat(46); // 46 characters, limit is 45

      expect(() => builder.setLabel(longLabel)).toThrow();
    });
  });

  describe("setStyle", () => {
    it("should set the style to Short", () => {
      builder.setStyle(TextInputStyle.Short);

      expect(builder.toJson().style).toBe(TextInputStyle.Short);
    });

    it("should set the style to Paragraph", () => {
      builder.setStyle(TextInputStyle.Paragraph);

      expect(builder.toJson().style).toBe(TextInputStyle.Paragraph);
    });

    it("should throw with invalid style", () => {
      expect(() => builder.setStyle(999 as TextInputStyle)).toThrow();
    });
  });

  describe("setMinLength", () => {
    it("should set the minimum length", () => {
      builder.setMinLength(10);

      expect(builder.toJson().min_length).toBe(10);
    });

    it("should throw when min length is negative", () => {
      expect(() => builder.setMinLength(-1)).toThrow();
    });

    it("should throw when min length exceeds 4000", () => {
      expect(() => builder.setMinLength(4001)).toThrow();
    });
  });

  describe("setMaxLength", () => {
    it("should set the maximum length", () => {
      builder.setMaxLength(100);

      expect(builder.toJson().max_length).toBe(100);
    });

    it("should throw when max length is less than 1", () => {
      expect(() => builder.setMaxLength(0)).toThrow();
    });

    it("should throw when max length exceeds 4000", () => {
      expect(() => builder.setMaxLength(4001)).toThrow();
    });
  });

  describe("setRequired", () => {
    it("should set the required state to true", () => {
      builder.setRequired(true);

      expect(builder.toJson().required).toBe(true);
    });

    it("should set the required state to false", () => {
      builder.setRequired(false);

      expect(builder.toJson().required).toBe(false);
    });
  });

  describe("setValue", () => {
    it("should set the value", () => {
      builder.setValue("Initial value");

      expect(builder.toJson().value).toBe("Initial value");
    });

    it("should throw when value is too long", () => {
      const longValue = "a".repeat(4001); // 4001 characters, limit is 4000

      expect(() => builder.setValue(longValue)).toThrow();
    });
  });

  describe("setPlaceholder", () => {
    it("should set the placeholder", () => {
      builder.setPlaceholder("Enter text here...");

      expect(builder.toJson().placeholder).toBe("Enter text here...");
    });

    it("should throw when placeholder is too long", () => {
      const longPlaceholder = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setPlaceholder(longPlaceholder)).toThrow();
    });
  });

  describe("build", () => {
    it("should return the validated text input", () => {
      builder
        .setCustomId("test-input")
        .setLabel("Test Input")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Enter text here...")
        .setRequired(true);

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        label: "Test Input",
        style: TextInputStyle.Short,
        placeholder: "Enter text here...",
        required: true,
      });
    });

    it("should throw if validation fails", () => {
      // Intentionally create an invalid text input (empty label)
      builder.setCustomId("test-input");

      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setCustomId("test-input")
        .setLabel("Test Input")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Enter text here...")
        .setRequired(true);

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
        .setCustomId("test-input")
        .setLabel("Test Input")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Enter text here...")
        .setRequired(true);

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.TextInput,
        custom_id: "test-input",
        label: "Test Input",
        style: TextInputStyle.Short,
        placeholder: "Enter text here...",
        required: true,
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid text input", () => {
      builder.setCustomId("test-input").setLabel("Test Input");

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid text input", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
