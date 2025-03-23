import { beforeEach, describe, expect, it } from "vitest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "../src/index.js";

describe("ActionRowBuilder", () => {
  let builder: ActionRowBuilder;

  beforeEach(() => {
    builder = new ActionRowBuilder();
  });

  describe("constructor", () => {
    it("should create an empty action row by default", () => {
      // @ts-ignore
      expect(builder.toJson()).toEqual({
        type: ComponentType.ActionRow,
        components: [],
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            custom_id: "test",
          },
        ],
      };

      // @ts-expect-error
      const customBuilder = new ActionRowBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing action row", () => {
      const actionRow = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Primary,
            custom_id: "test",
          },
        ],
      };

      // @ts-expect-error
      const newBuilder = ActionRowBuilder.from(actionRow);

      expect(newBuilder.toJson()).toEqual(actionRow);
    });
  });

  describe("addComponents", () => {
    it("should add component objects", () => {
      const component = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      };

      // @ts-expect-error
      builder.addComponents(component);

      expect(builder.toJson().components).toContain(component);
    });

    it("should add components from builders", () => {
      const buttonBuilder = new ButtonBuilder()
        .setCustomId("btn1")
        .setStyle(ButtonStyle.Primary);

      builder.addComponents(buttonBuilder);

      expect(builder.toJson().components[0]).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      });
    });

    it("should throw when adding more than 5 components", () => {
      const component = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn",
      };

      // Add 5 components first (which is fine)
      builder.addComponents(
        // @ts-expect-error
        { ...component, custom_id: "btn1" },
        { ...component, custom_id: "btn2" },
        { ...component, custom_id: "btn3" },
        { ...component, custom_id: "btn4" },
        { ...component, custom_id: "btn5" },
      );

      // Adding a 6th should throw
      expect(() => {
        // @ts-expect-error
        builder.addComponents({ ...component, custom_id: "btn6" });
      }).toThrow("Action row cannot contain more than 5 components");
    });

    it("should throw when mixing select menus with buttons", () => {
      // Add a button first
      builder.addComponents({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      });

      // Adding a select menu should throw
      expect(() => {
        builder.addComponents({
          type: ComponentType.StringSelect,
          custom_id: "select1",
          options: [],
        });
      }).toThrow();
    });

    it("should throw when adding more than one select menu", () => {
      // Add a select menu first
      builder.addComponents({
        type: ComponentType.StringSelect,
        custom_id: "select1",
        options: [],
      });

      // Adding another select menu should throw
      expect(() => {
        builder.addComponents({
          type: ComponentType.StringSelect,
          custom_id: "select2",
          options: [],
        });
      }).toThrow();
    });
  });

  describe("setComponents", () => {
    it("should replace existing components", () => {
      // Add initial component
      builder.addComponents({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      });

      // Replace with new components
      const newComponent = {
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: "btn2",
      };

      // @ts-expect-error
      builder.setComponents(newComponent);

      expect(builder.toJson().components).toEqual([newComponent]);
      expect(builder.toJson().components).toHaveLength(1);
    });
  });

  describe("build", () => {
    it("should return the validated action row", () => {
      const component = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      };

      // @ts-expect-error
      builder.addComponents(component);

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.ActionRow,
        components: [component],
      });
    });

    it("should throw if validation fails", () => {
      // Forcefully set invalid data
      Object.defineProperty(builder, "#data", {
        value: {
          type: ComponentType.ActionRow,
          components: [{ invalid: "data" }],
        },
        writable: true,
      });

      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      const component = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      };

      // @ts-expect-error
      builder.addComponents(component);

      const clone = builder.clone();

      // Should be a different instance
      expect(clone).not.toBe(builder);

      // But with the same data
      expect(clone.toJson()).toEqual(builder.toJson());
    });
  });

  describe("toJson", () => {
    it("should return the JSON representation", () => {
      const component = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      };

      // @ts-expect-error
      builder.addComponents(component);

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.ActionRow,
        components: [component],
      });
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty action row", () => {
      expect(builder.isEmpty()).toBe(true);
    });

    it("should return false for non-empty action row", () => {
      builder.addComponents({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      });

      expect(builder.isEmpty()).toBe(false);
    });
  });

  describe("isValid", () => {
    it("should return true for valid action row", () => {
      builder.addComponents({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "btn1",
      });

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid action row", () => {
      // Forcefully set invalid data
      Object.defineProperty(builder, "#data", {
        value: {
          type: ComponentType.ActionRow,
          components: [{ invalid: "data" }],
        },
        writable: true,
      });

      expect(builder.isValid()).toBe(false);
    });
  });
});
