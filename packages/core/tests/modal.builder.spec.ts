import { beforeEach, describe, expect, it } from "vitest";
import {
  ActionRowBuilder,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "../src/index.js";

describe("ModalBuilder", () => {
  let builder: ModalBuilder;

  beforeEach(() => {
    builder = new ModalBuilder();
  });

  describe("constructor", () => {
    it("should create a default modal", () => {
      expect(builder.toJson()).toEqual({
        custom_id: "",
        title: "",
        components: [],
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        custom_id: "test-modal",
        title: "Test Modal",
        components: [],
      };

      const customBuilder = new ModalBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing modal", () => {
      const modal = {
        custom_id: "test-modal",
        title: "Test Modal",
        components: [],
      };

      const newBuilder = ModalBuilder.from(modal);

      expect(newBuilder.toJson()).toEqual(modal);
    });
  });

  describe("setCustomId", () => {
    it("should set the custom ID", () => {
      builder.setCustomId("test-modal");

      expect(builder.toJson().custom_id).toBe("test-modal");
    });

    it("should throw when custom ID is too long", () => {
      const longId = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setCustomId(longId)).toThrow();
    });
  });

  describe("setTitle", () => {
    it("should set the title", () => {
      builder.setTitle("Test Modal");

      expect(builder.toJson().title).toBe("Test Modal");
    });

    it("should throw when title is too long", () => {
      const longTitle = "a".repeat(46); // 46 characters, limit is 45

      expect(() => builder.setTitle(longTitle)).toThrow();
    });
  });

  describe("addComponents", () => {
    it("should add action row objects", () => {
      const actionRow = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            custom_id: "text_input",
            style: TextInputStyle.Short,
            label: "Input",
          },
        ],
      };

      // @ts-expect-error
      builder.addComponents(actionRow);

      expect(builder.toJson().components).toContain(actionRow);
    });

    it("should add components from ActionRowBuilder", () => {
      const textInput = new TextInputBuilder()
        .setCustomId("text_input")
        .setLabel("Input")
        .setStyle(TextInputStyle.Short);

      const actionRowBuilder = new ActionRowBuilder().addComponents(textInput);

      builder.addComponents(actionRowBuilder);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            custom_id: "text_input",
            style: TextInputStyle.Short,
            label: "Input",
          },
        ],
      });
    });

    it("should wrap TextInputBuilder in an action row", () => {
      const textInput = new TextInputBuilder()
        .setCustomId("text_input")
        .setLabel("Input")
        .setStyle(TextInputStyle.Short);

      builder.addComponents(textInput);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            custom_id: "text_input",
            style: TextInputStyle.Short,
            label: "Input",
          },
        ],
      });
    });

    it("should wrap raw text input objects in an action row", () => {
      const textInput = {
        type: ComponentType.TextInput,
        custom_id: "text_input",
        style: TextInputStyle.Short,
        label: "Input",
      };

      // @ts-expect-error
      builder.addComponents(textInput);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.ActionRow,
        components: [textInput],
      });
    });

    it("should throw when adding more than 5 components", () => {
      const textInput = new TextInputBuilder()
        .setCustomId("input")
        .setLabel("Input")
        .setStyle(TextInputStyle.Short);

      // Add 5 components first (which is fine)
      for (let i = 0; i < 5; i++) {
        builder.addComponents(
          new TextInputBuilder()
            .setCustomId(`input_${i}`)
            .setLabel(`Input ${i}`)
            .setStyle(TextInputStyle.Short),
        );
      }

      // Adding a 6th should throw
      expect(() => {
        builder.addComponents(textInput);
      }).toThrow("Modal cannot contain more than 5 action rows");
    });
  });

  describe("setComponents", () => {
    it("should replace existing components", () => {
      // Add initial component
      builder.addComponents(
        new TextInputBuilder()
          .setCustomId("input_1")
          .setLabel("Input 1")
          .setStyle(TextInputStyle.Short),
      );

      // Replace with new components
      const newInput = new TextInputBuilder()
        .setCustomId("input_2")
        .setLabel("Input 2")
        .setStyle(TextInputStyle.Paragraph);

      builder.setComponents(newInput);

      expect(builder.toJson().components).toHaveLength(1);
      // @ts-expect-error
      expect(builder.toJson().components[0].components[0].custom_id).toBe(
        "input_2",
      );
    });
  });

  describe("addTextInput", () => {
    it("should add a text input wrapped in an action row", () => {
      const textInput = new TextInputBuilder()
        .setCustomId("text_input")
        .setLabel("Input")
        .setStyle(TextInputStyle.Short);

      builder.addTextInput(textInput);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.TextInput,
            custom_id: "text_input",
            style: TextInputStyle.Short,
            label: "Input",
          },
        ],
      });
    });

    it("should handle raw text input objects", () => {
      const textInput = {
        type: ComponentType.TextInput,
        custom_id: "text_input",
        style: TextInputStyle.Short,
        label: "Input",
      };

      // @ts-expect-error
      builder.addTextInput(textInput);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.ActionRow,
        components: [textInput],
      });
    });
  });

  describe("build", () => {
    it("should return the validated modal", () => {
      builder
        .setCustomId("test-modal")
        .setTitle("Test Modal")
        .addTextInput(
          new TextInputBuilder()
            .setCustomId("text_input")
            .setLabel("Input")
            .setStyle(TextInputStyle.Short),
        );

      const result = builder.build();

      expect(result).toEqual({
        custom_id: "test-modal",
        title: "Test Modal",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: "text_input",
                style: TextInputStyle.Short,
                label: "Input",
              },
            ],
          },
        ],
      });
    });

    it("should throw if validation fails", () => {
      // Missing required fields
      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setCustomId("test-modal")
        .setTitle("Test Modal")
        .addTextInput(
          new TextInputBuilder()
            .setCustomId("text_input")
            .setLabel("Input")
            .setStyle(TextInputStyle.Short),
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
        .setCustomId("test-modal")
        .setTitle("Test Modal")
        .addTextInput(
          new TextInputBuilder()
            .setCustomId("text_input")
            .setLabel("Input")
            .setStyle(TextInputStyle.Short),
        );

      const json = builder.toJson();

      expect(json).toEqual({
        custom_id: "test-modal",
        title: "Test Modal",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: "text_input",
                style: TextInputStyle.Short,
                label: "Input",
              },
            ],
          },
        ],
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid modal", () => {
      builder
        .setCustomId("test-modal")
        .setTitle("Test Modal")
        .addTextInput(
          new TextInputBuilder()
            .setCustomId("text_input")
            .setLabel("Input")
            .setStyle(TextInputStyle.Short),
        );

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid modal", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
