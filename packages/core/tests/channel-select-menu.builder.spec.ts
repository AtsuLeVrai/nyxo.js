import { beforeEach, describe, expect, it } from "vitest";
import {
  ChannelSelectMenuBuilder,
  ChannelType,
  ComponentType,
} from "../src/index.js";

describe("ChannelSelectMenuBuilder", () => {
  let builder: ChannelSelectMenuBuilder;

  beforeEach(() => {
    builder = new ChannelSelectMenuBuilder();
  });

  describe("constructor", () => {
    it("should create a default channel select menu", () => {
      expect(builder.toJson()).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "",
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: ComponentType.ChannelSelect,
        custom_id: "test-menu",
        placeholder: "Select a channel",
      };

      // @ts-expect-error Testing invalid input
      const customBuilder = new ChannelSelectMenuBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static factory methods", () => {
    it("should create from an existing channel select menu", () => {
      const menu = {
        type: ComponentType.ChannelSelect,
        custom_id: "test-menu",
        placeholder: "Select a channel",
      };

      // @ts-expect-error Testing invalid input
      const newBuilder = ChannelSelectMenuBuilder.from(menu);

      expect(newBuilder.toJson()).toEqual(menu);
    });

    it("should create a text channel select menu", () => {
      const builder = ChannelSelectMenuBuilder.createForTextChannels(
        "test-id",
        "Select a text channel",
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "test-id",
        placeholder: "Select a text channel",
        channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      });
    });

    it("should create a voice channel select menu", () => {
      const builder = ChannelSelectMenuBuilder.createForVoiceChannels(
        "test-id",
        "Select a voice channel",
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "test-id",
        placeholder: "Select a voice channel",
        channel_types: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
      });
    });

    it("should create a thread channel select menu", () => {
      const builder = ChannelSelectMenuBuilder.createForThreads(
        "test-id",
        "Select a thread",
      );

      expect(builder.toJson()).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "test-id",
        placeholder: "Select a thread",
        channel_types: [
          ChannelType.PublicThread,
          ChannelType.PrivateThread,
          ChannelType.AnnouncementThread,
        ],
      });
    });

    it("should create a select menu without placeholder if not provided", () => {
      const builder = ChannelSelectMenuBuilder.createForTextChannels("test-id");

      expect(builder.toJson().placeholder).toBeUndefined();
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
      builder.setPlaceholder("Select a channel");

      expect(builder.toJson().placeholder).toBe("Select a channel");
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

  describe("setChannelTypes", () => {
    it("should set the channel types", () => {
      const types = [ChannelType.GuildText, ChannelType.GuildVoice];

      builder.setChannelTypes(types);

      expect(builder.toJson().channel_types).toEqual(types);
    });

    it("should throw with invalid channel types", () => {
      expect(() =>
        // @ts-expect-error Testing invalid input
        builder.setChannelTypes(["invalid" as ChannelType]),
      ).toThrow();
    });
  });

  describe("addDefaultChannels", () => {
    it("should add default channels", () => {
      builder.addDefaultChannels("123456789", "987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "channel" },
        { id: "987654321", type: "channel" },
      ]);
    });

    it("should append to existing default values", () => {
      // Add initial default channel
      builder.addDefaultChannels("123456789");

      // Add another
      builder.addDefaultChannels("987654321");

      expect(builder.toJson().default_values).toEqual([
        { id: "123456789", type: "channel" },
        { id: "987654321", type: "channel" },
      ]);
    });
  });

  describe("setDefaultChannels", () => {
    it("should set default channels, replacing existing ones", () => {
      // Add initial default channels
      builder.addDefaultChannels("111111111", "222222222");

      // Replace with new defaults
      builder.setDefaultChannels("333333333", "444444444");

      expect(builder.toJson().default_values).toEqual([
        { id: "333333333", type: "channel" },
        { id: "444444444", type: "channel" },
      ]);
    });
  });

  describe("addDefaultValues", () => {
    it("should add default values", () => {
      const defaults = [
        { id: "123456789", type: "channel" as const },
        { id: "987654321", type: "channel" as const },
      ];

      builder.addDefaultValues(...defaults);

      expect(builder.toJson().default_values).toEqual(defaults);
    });

    it("should throw with invalid default values", () => {
      expect(() =>
        // biome-ignore lint/suspicious/noExplicitAny: This is intentional for testing
        builder.addDefaultValues({ id: "123456789", type: "invalid" as any }),
      ).toThrow();
    });
  });

  describe("setDefaultValues", () => {
    it("should set default values, replacing existing ones", () => {
      // Add initial default values
      builder.addDefaultValues(
        { id: "111111111", type: "channel" as const },
        { id: "222222222", type: "channel" as const },
      );

      // Replace with new defaults
      const newDefaults = [
        { id: "333333333", type: "channel" as const },
        { id: "444444444", type: "channel" as const },
      ];

      builder.setDefaultValues(...newDefaults);

      expect(builder.toJson().default_values).toEqual(newDefaults);
    });
  });

  describe("build", () => {
    it("should return the validated channel select menu", () => {
      builder
        .setCustomId("test-menu")
        .setPlaceholder("Select a channel")
        .setChannelTypes([ChannelType.GuildText]);

      const result = builder.build();

      expect(result).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "test-menu",
        placeholder: "Select a channel",
        channel_types: [ChannelType.GuildText],
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
        .setPlaceholder("Select a channel")
        .setChannelTypes([ChannelType.GuildText]);

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
        .setPlaceholder("Select a channel")
        .setChannelTypes([ChannelType.GuildText]);

      const json = builder.toJson();

      expect(json).toEqual({
        type: ComponentType.ChannelSelect,
        custom_id: "test-menu",
        placeholder: "Select a channel",
        channel_types: [ChannelType.GuildText],
      });
    });
  });

  describe("isValid", () => {
    it("should return true for valid channel select menu", () => {
      builder.setCustomId("test-menu").setChannelTypes([ChannelType.GuildText]);

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid channel select menu", () => {
      // Missing required fields
      expect(builder.isValid()).toBe(false);
    });
  });
});
