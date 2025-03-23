import { beforeEach, describe, expect, it } from "vitest";
import { ButtonBuilder, ButtonStyle, ComponentType } from "../src/index.js";

describe("ButtonBuilder", () => {
  let builder: ButtonBuilder;

  beforeEach(() => {
    builder = new ButtonBuilder();
  });

  describe("constructor", () => {
    it("should create a default button", () => {
      expect(builder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: "test-button",
      };

      // @ts-expect-error
      const customBuilder = new ButtonBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static factory methods", () => {
    it("should create from an existing button", () => {
      const button = {
        type: ComponentType.Button,
        style: ButtonStyle.Success,
        custom_id: "test-button",
      };

      // @ts-expect-error
      const newBuilder = ButtonBuilder.from(button);

      expect(newBuilder.toJson()).toEqual(button);
    });

    it("should create a link button", () => {
      const linkBuilder = ButtonBuilder.link(
        "https://discord.com",
        "Visit Discord",
      );

      expect(linkBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Link,
        url: "https://discord.com",
        label: "Visit Discord",
      });
    });

    it("should create a primary button", () => {
      const primaryBuilder = ButtonBuilder.primary("test-id", "Click Me");

      expect(primaryBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "test-id",
        label: "Click Me",
      });
    });

    it("should create a secondary button", () => {
      const secondaryBuilder = ButtonBuilder.secondary("test-id", "Click Me");

      expect(secondaryBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Secondary,
        custom_id: "test-id",
        label: "Click Me",
      });
    });

    it("should create a success button", () => {
      const successBuilder = ButtonBuilder.success("test-id", "Click Me");

      expect(successBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Success,
        custom_id: "test-id",
        label: "Click Me",
      });
    });

    it("should create a danger button", () => {
      const dangerBuilder = ButtonBuilder.danger("test-id", "Click Me");

      expect(dangerBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Danger,
        custom_id: "test-id",
        label: "Click Me",
      });
    });

    it("should create a premium button", () => {
      const premiumBuilder = ButtonBuilder.premium("12345", "Subscribe");

      expect(premiumBuilder.toJson()).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Premium,
        sku_id: "12345",
        label: "Subscribe",
      });
    });
  });

  describe("setCustomId", () => {
    it("should set the custom ID", () => {
      builder.setCustomId("test-button");

      expect(builder.toJson().custom_id).toBe("test-button");
    });

    it("should throw when setting custom ID on a Link button", () => {
      builder.setStyle(ButtonStyle.Link);

      expect(() => builder.setCustomId("test-button")).toThrow(
        "Link buttons cannot have a custom ID",
      );
    });

    it("should throw when setting custom ID on a Premium button", () => {
      builder.setStyle(ButtonStyle.Premium);

      expect(() => builder.setCustomId("test-button")).toThrow(
        "Premium buttons cannot have a custom ID",
      );
    });

    it("should throw when custom ID is too long", () => {
      const longId = "a".repeat(101); // 101 characters, limit is 100

      expect(() => builder.setCustomId(longId)).toThrow();
    });
  });

  describe("setUrl", () => {
    it("should set the URL for Link buttons", () => {
      builder.setStyle(ButtonStyle.Link);
      builder.setUrl("https://discord.com");

      expect(builder.toJson().url).toBe("https://discord.com");
    });

    it("should throw when setting URL on non-Link buttons", () => {
      expect(() => builder.setUrl("https://discord.com")).toThrow(
        "URL can only be set for Link buttons",
      );
    });

    it("should throw when URL is invalid", () => {
      builder.setStyle(ButtonStyle.Link);

      expect(() => builder.setUrl("not-a-url")).toThrow();
    });
  });

  describe("setSkuId", () => {
    it("should set the SKU ID for Premium buttons", () => {
      builder.setStyle(ButtonStyle.Premium);
      builder.setSkuId("12345");

      expect(builder.toJson().sku_id).toBe("12345");
    });

    it("should throw when setting SKU ID on non-Premium buttons", () => {
      expect(() => builder.setSkuId("12345")).toThrow(
        "SKU ID can only be set for Premium buttons",
      );
    });
  });

  describe("setLabel", () => {
    it("should set the label", () => {
      builder.setLabel("Click Me");

      expect(builder.toJson().label).toBe("Click Me");
    });

    it("should throw when label is too long", () => {
      const longLabel = "a".repeat(81); // 81 characters, limit is 80

      expect(() => builder.setLabel(longLabel)).toThrow();
    });
  });

  describe("setEmoji", () => {
    it("should set the emoji", () => {
      const emoji = { id: "730029344193249310", name: "test_emoji" };

      builder.setEmoji(emoji);

      expect(builder.toJson().emoji).toEqual({
        id: "730029344193249310",
        name: "test_emoji",
      });
    });

    it("should set an animated emoji", () => {
      const emoji = {
        id: "730029344193249310",
        name: "test_emoji",
        animated: true,
      };

      builder.setEmoji(emoji);

      expect(builder.toJson().emoji).toEqual({
        id: "730029344193249310",
        name: "test_emoji",
        animated: true,
      });
    });
  });

  describe("setStyle", () => {
    it("should set the style", () => {
      builder.setStyle(ButtonStyle.Danger);

      expect(builder.toJson().style).toBe(ButtonStyle.Danger);
    });

    it("should clear custom_id when setting Link style", () => {
      builder.setCustomId("test-button");
      builder.setStyle(ButtonStyle.Link);

      expect(builder.toJson().custom_id).toBeUndefined();
    });

    it("should clear url when setting non-Link style", () => {
      builder.setStyle(ButtonStyle.Link);
      builder.setUrl("https://discord.com");
      builder.setStyle(ButtonStyle.Primary);

      expect(builder.toJson().url).toBeUndefined();
    });

    it("should clear sku_id when setting non-Premium style", () => {
      builder.setStyle(ButtonStyle.Premium);
      builder.setSkuId("12345");
      builder.setStyle(ButtonStyle.Primary);

      expect(builder.toJson().sku_id).toBeUndefined();
    });
  });

  describe("setDisabled", () => {
    it("should set the disabled state", () => {
      builder.setDisabled(true);

      expect(builder.toJson().disabled).toBe(true);
    });
  });

  describe("build", () => {
    it("should return the validated button", () => {
      builder
        .setCustomId("test-button")
        .setLabel("Click Me")
        .setStyle(ButtonStyle.Primary);

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "test-button",
        label: "Click Me",
      });
    });

    it("should throw if validation fails", () => {
      // Intentionally create an invalid button (missing required fields)
      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setCustomId("test-button")
        .setLabel("Click Me")
        .setStyle(ButtonStyle.Primary);

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
        .setCustomId("test-button")
        .setLabel("Click Me")
        .setStyle(ButtonStyle.Primary);

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "test-button",
        label: "Click Me",
      });
    });
  });

  describe("hasRequiredFields", () => {
    it("should return true for standard button with custom ID", () => {
      builder.setCustomId("test-button").setStyle(ButtonStyle.Primary);

      expect(builder.hasRequiredFields()).toBe(true);
    });

    it("should return true for link button with URL", () => {
      builder.setStyle(ButtonStyle.Link).setUrl("https://discord.com");

      expect(builder.hasRequiredFields()).toBe(true);
    });

    it("should return true for premium button with SKU ID", () => {
      builder.setStyle(ButtonStyle.Premium).setSkuId("12345");

      expect(builder.hasRequiredFields()).toBe(true);
    });

    it("should return false for standard button without custom ID", () => {
      builder.setStyle(ButtonStyle.Primary);

      expect(builder.hasRequiredFields()).toBe(false);
    });

    it("should return false for link button without URL", () => {
      builder.setStyle(ButtonStyle.Link);

      expect(builder.hasRequiredFields()).toBe(false);
    });

    it("should return false for premium button without SKU ID", () => {
      builder.setStyle(ButtonStyle.Premium);

      expect(builder.hasRequiredFields()).toBe(false);
    });
  });

  describe("isValid", () => {
    it("should return true for valid button", () => {
      builder
        .setCustomId("test-button")
        .setLabel("Click Me")
        .setStyle(ButtonStyle.Primary);

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid button", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
