import { EmbedType } from "@nyxojs/core";
import { beforeEach, describe, expect, it } from "vitest";
import { Colors, EMBED_LIMITS, EmbedBuilder } from "../src/index.js";

describe("EmbedBuilder", () => {
  let builder: EmbedBuilder;

  beforeEach(() => {
    builder = new EmbedBuilder();
  });

  describe("constructor", () => {
    it("should create an empty embed when no data is provided", () => {
      const embed = new EmbedBuilder();
      expect(embed.toJson()).toEqual({});
    });

    it("should use provided data when initializing", () => {
      const data = {
        title: "Test Title",
        description: "Test Description",
      };
      const embed = new EmbedBuilder(data);
      expect(embed.toJson()).toEqual(data);
    });

    it("should throw an error if initial data is invalid", () => {
      const invalidData = {
        title: "a".repeat(EMBED_LIMITS.TITLE + 1), // Too long title
      };
      expect(() => new EmbedBuilder(invalidData)).toThrow();
    });
  });

  describe("static from", () => {
    it("should create a new builder from existing data", () => {
      const data = {
        title: "Test Title",
        description: "Test Description",
      };
      const embed = EmbedBuilder.from(data);
      expect(embed.toJson()).toEqual(data);
    });
  });

  describe("setTitle", () => {
    it("should set the title correctly", () => {
      builder.setTitle("Test Title");
      expect(builder.toJson().title).toBe("Test Title");
    });

    it("should throw an error if title is too long", () => {
      expect(() =>
        builder.setTitle("a".repeat(EMBED_LIMITS.TITLE + 1)),
      ).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setTitle("Test")).toBe(builder);
    });
  });

  describe("setDescription", () => {
    it("should set the description correctly", () => {
      builder.setDescription("Test Description");
      expect(builder.toJson().description).toBe("Test Description");
    });

    it("should throw an error if description is too long", () => {
      expect(() =>
        builder.setDescription("a".repeat(EMBED_LIMITS.DESCRIPTION + 1)),
      ).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setDescription("Test")).toBe(builder);
    });
  });

  describe("setUrl", () => {
    it("should set the URL correctly", () => {
      const url = "https://example.com";
      builder.setUrl(url);
      expect(builder.toJson().url).toBe(url);
    });

    it("should throw an error if URL is invalid", () => {
      expect(() => builder.setUrl("not-a-url")).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setUrl("https://example.com")).toBe(builder);
    });
  });

  describe("setTimestamp", () => {
    it("should set the timestamp to current time when no argument provided", () => {
      const before = new Date();
      builder.setTimestamp();
      const timestamp = new Date(builder.toJson().timestamp as string);
      const after = new Date();

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should set the timestamp from a Date object", () => {
      const date = new Date("2023-01-01T12:00:00Z");
      builder.setTimestamp(date);
      expect(builder.toJson().timestamp).toBe(date.toISOString());
    });

    it("should set the timestamp from a string", () => {
      const dateStr = "2023-01-01T12:00:00Z";
      builder.setTimestamp(dateStr);
      expect(builder.toJson().timestamp).toBe(new Date(dateStr).toISOString());
    });

    it("should set the timestamp from a number", () => {
      const timestamp = 1672570800000; // 2023-01-01T12:00:00Z
      builder.setTimestamp(timestamp);
      expect(builder.toJson().timestamp).toBe(
        new Date(timestamp).toISOString(),
      );
    });

    it("should return the builder for chaining", () => {
      expect(builder.setTimestamp()).toBe(builder);
    });
  });

  describe("setColor", () => {
    it("should set the color from a number", () => {
      const color = 0x00ff00;
      builder.setColor(color);
      expect(builder.toJson().color).toBe(color);
    });

    it("should set the color from a hex string", () => {
      builder.setColor("#00FF00");
      expect(builder.toJson().color).toBe(0x00ff00);
    });

    it("should set the color from an RGB array", () => {
      builder.setColor([0, 255, 0]);
      expect(builder.toJson().color).toBe(0x00ff00);
    });

    it("should set the color from a named color", () => {
      builder.setColor(Colors.Green);
      expect(builder.toJson().color).toBe(Colors.Green);
    });

    it("should throw an error if color is invalid", () => {
      expect(() => builder.setColor("not-a-color" as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setColor(Colors.Blue)).toBe(builder);
    });
  });

  describe("setType", () => {
    it("should set the type correctly", () => {
      builder.setType(EmbedType.Rich);
      expect(builder.toJson().type).toBe(EmbedType.Rich);
    });

    it("should throw an error if type is invalid", () => {
      expect(() => builder.setType("invalid" as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setType(EmbedType.Rich)).toBe(builder);
    });
  });

  describe("setFooter", () => {
    it("should set the footer correctly", () => {
      const footer = { text: "Test Footer" };
      builder.setFooter(footer);
      expect(builder.toJson().footer).toEqual(footer);
    });

    it("should set the footer with icon", () => {
      const footer = {
        text: "Test Footer",
        icon_url: "https://example.com/icon.png",
      };
      builder.setFooter(footer);
      expect(builder.toJson().footer).toEqual(footer);
    });

    it("should throw an error if footer is invalid", () => {
      expect(() =>
        builder.setFooter({ text: "a".repeat(EMBED_LIMITS.FOOTER_TEXT + 1) }),
      ).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setFooter({ text: "Test" })).toBe(builder);
    });
  });

  describe("setImage", () => {
    it("should set the image correctly", () => {
      const image = { url: "https://example.com/image.png" };
      builder.setImage(image);
      expect(builder.toJson().image).toEqual(image);
    });

    it("should set the image with dimensions", () => {
      const image = {
        url: "https://example.com/image.png",
        height: 100,
        width: 200,
      };
      builder.setImage(image);
      expect(builder.toJson().image).toEqual(image);
    });

    it("should throw an error if image is invalid", () => {
      expect(() => builder.setImage({ url: "not-a-url" } as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setImage({ url: "https://example.com/image.png" })).toBe(
        builder,
      );
    });
  });

  describe("setThumbnail", () => {
    it("should set the thumbnail correctly", () => {
      const thumbnail = { url: "https://example.com/thumb.png" };
      builder.setThumbnail(thumbnail);
      expect(builder.toJson().thumbnail).toEqual(thumbnail);
    });

    it("should set the thumbnail with dimensions", () => {
      const thumbnail = {
        url: "https://example.com/thumb.png",
        height: 50,
        width: 50,
      };
      builder.setThumbnail(thumbnail);
      expect(builder.toJson().thumbnail).toEqual(thumbnail);
    });

    it("should throw an error if thumbnail is invalid", () => {
      expect(() => builder.setThumbnail({ url: "not-a-url" } as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(
        builder.setThumbnail({ url: "https://example.com/thumb.png" }),
      ).toBe(builder);
    });
  });

  describe("setAuthor", () => {
    it("should set the author correctly", () => {
      const author = { name: "Test Author" };
      builder.setAuthor(author);
      expect(builder.toJson().author).toEqual(author);
    });

    it("should set the author with url and icon", () => {
      const author = {
        name: "Test Author",
        url: "https://example.com",
        icon_url: "https://example.com/icon.png",
      };
      builder.setAuthor(author);
      expect(builder.toJson().author).toEqual(author);
    });

    it("should throw an error if author is invalid", () => {
      expect(() =>
        builder.setAuthor({ name: "a".repeat(EMBED_LIMITS.AUTHOR_NAME + 1) }),
      ).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setAuthor({ name: "Test" })).toBe(builder);
    });
  });

  describe("setProvider", () => {
    it("should set the provider correctly", () => {
      const provider = { name: "Test Provider" };
      builder.setProvider(provider);
      expect(builder.toJson().provider).toEqual(provider);
    });

    it("should set the provider with url", () => {
      const provider = {
        name: "Test Provider",
        url: "https://example.com",
      };
      builder.setProvider(provider);
      expect(builder.toJson().provider).toEqual(provider);
    });

    it("should throw an error if provider is invalid", () => {
      expect(() => builder.setProvider({ url: "not-a-url" } as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setProvider({ name: "Test" })).toBe(builder);
    });
  });

  describe("setVideo", () => {
    it("should set the video correctly", () => {
      const video = { url: "https://example.com/video.mp4" };
      builder.setVideo(video);
      expect(builder.toJson().video).toEqual(video);
    });

    it("should set the video with dimensions", () => {
      const video = {
        url: "https://example.com/video.mp4",
        height: 720,
        width: 1280,
      };
      builder.setVideo(video);
      expect(builder.toJson().video).toEqual(video);
    });

    it("should throw an error if video is invalid", () => {
      expect(() => builder.setVideo({ url: "not-a-url" } as any)).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.setVideo({ url: "https://example.com/video.mp4" })).toBe(
        builder,
      );
    });
  });

  describe("addField", () => {
    it("should add a field correctly", () => {
      const field = { name: "Field Name", value: "Field Value", inline: false };
      builder.addField(field);
      expect(builder.toJson().fields).toEqual([field]);
    });

    it("should add a field with inline flag", () => {
      const field = { name: "Field Name", value: "Field Value", inline: true };
      builder.addField(field);
      expect(builder.toJson().fields).toEqual([field]);
    });

    it("should throw an error if field is invalid", () => {
      expect(() =>
        builder.addField({
          name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
          value: "Test",
        }),
      ).toThrow();
    });

    it("should return the builder for chaining", () => {
      expect(builder.addField({ name: "Test", value: "Test" })).toBe(builder);
    });
  });

  describe("addFields", () => {
    it("should add multiple fields correctly", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 2", value: "Value 2", inline: false },
      ];
      builder.addFields(...fields);
      expect(builder.toJson().fields).toEqual(fields);
    });

    it("should throw an error if any field is invalid", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        {
          name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
          value: "Value 2",
          inline: false,
        },
      ];
      expect(() => builder.addFields(...fields)).toThrow();
      // First field should not be added if second is invalid
      expect(builder.toJson().fields).toBeUndefined();
    });

    it("should return the builder for chaining", () => {
      expect(builder.addFields({ name: "Test", value: "Test" })).toBe(builder);
    });
  });

  describe("setFields", () => {
    it("should set all fields, replacing existing ones", () => {
      // Add initial field
      builder.addField({ name: "Initial", value: "Initial", inline: false });

      // Replace with new fields
      const newFields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 2", value: "Value 2", inline: false },
      ];
      builder.setFields(newFields);

      expect(builder.toJson().fields).toEqual(newFields);
    });

    it("should throw an error if any field is invalid", () => {
      const initialField = { name: "Initial", value: "Initial", inline: false };
      builder.addField(initialField);

      const newFields = [
        { name: "Field 1", value: "Value 1", inline: false },
        {
          name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
          value: "Value 2",
          inline: false,
        },
      ];

      expect(() => builder.setFields(newFields)).toThrow();
      // Original field should remain if new fields are invalid
      expect(builder.toJson().fields).toEqual([initialField]);
    });

    it("should return the builder for chaining", () => {
      expect(builder.setFields([{ name: "Test", value: "Test" }])).toBe(
        builder,
      );
    });
  });

  describe("spliceFields", () => {
    it("should remove fields correctly", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 2", value: "Value 2", inline: false },
        { name: "Field 3", value: "Value 3", inline: false },
      ];
      builder.addFields(...fields);

      // Remove the second field
      builder.spliceFields(1, 1);

      expect(builder.toJson().fields).toEqual([fields[0], fields[2]]);
    });

    it("should replace fields correctly", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 2", value: "Value 2", inline: false },
        { name: "Field 3", value: "Value 3", inline: false },
      ];
      builder.addFields(...fields);

      // Replace the second field
      const newField = { name: "New Field", value: "New Value" };
      builder.spliceFields(1, 1, newField);

      expect(builder.toJson().fields).toEqual([fields[0], newField, fields[2]]);
    });

    it("should insert fields correctly", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 3", value: "Value 3", inline: false },
      ];
      builder.addFields(...fields);

      // Insert a field in the middle
      const newField = { name: "Field 2", value: "Value 2", inline: false };
      builder.spliceFields(1, 0, newField);

      expect(builder.toJson().fields).toEqual([fields[0], newField, fields[1]]);
    });

    it("should throw an error if any added field is invalid", () => {
      const fields = [
        { name: "Field 1", value: "Value 1", inline: false },
        { name: "Field 2", value: "Value 2", inline: false },
      ];
      builder.addFields(...fields);

      const invalidField = {
        name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
        value: "Invalid",
        inline: false,
      };

      expect(() => builder.spliceFields(1, 0, invalidField)).toThrow();
      // Original fields should remain unchanged if new field is invalid
      expect(builder.toJson().fields).toEqual(fields);
    });

    it("should return the builder for chaining", () => {
      expect(builder.spliceFields(0, 0, { name: "Test", value: "Test" })).toBe(
        builder,
      );
    });
  });

  describe("build", () => {
    it("should return a valid embed entity", () => {
      const embed = builder
        .setTitle("Test Title")
        .setDescription("Test Description")
        .setColor(Colors.Blue)
        .build();

      expect(embed).toEqual({
        title: "Test Title",
        description: "Test Description",
        color: Colors.Blue,
        type: EmbedType.Rich, // Default type
      });
    });

    it("should throw an error if the embed is invalid", () => {
      const longTitle = "a".repeat(EMBED_LIMITS.TITLE);
      const longDesc = "a".repeat(EMBED_LIMITS.DESCRIPTION);

      // This will create an embed that exceeds the total character limit
      expect(() => {
        return new EmbedBuilder()
          .setTitle(longTitle)
          .setDescription(longDesc)
          .setFooter({ text: "a".repeat(EMBED_LIMITS.FOOTER_TEXT) })
          .build();
      }).toThrow(/maximum total character limit/);
    });
  });

  describe("toJson", () => {
    it("should return a read-only copy of the embed data", () => {
      const embed = builder
        .setTitle("Test Title")
        .setDescription("Test Description");

      const json = embed.toJson();

      // Check data is correct
      expect(json).toEqual({
        title: "Test Title",
        description: "Test Description",
      });

      // Check it's read-only (frozen)
      expect(() => {
        (json as any).title = "Modified";
      }).toThrow();
    });
  });

  describe("chaining methods", () => {
    it("should support method chaining for all setter methods", () => {
      const result = builder
        .setTitle("Title")
        .setDescription("Description")
        .setUrl("https://example.com")
        .setTimestamp()
        .setColor(Colors.Red)
        .setType(EmbedType.Rich)
        .setFooter({ text: "Footer" })
        .setImage({ url: "https://example.com/image.png" })
        .setThumbnail({ url: "https://example.com/thumb.png" })
        .setAuthor({ name: "Author" })
        .setProvider({ name: "Provider" })
        .setVideo({ url: "https://example.com/video.mp4" })
        .addField({ name: "Field", value: "Value" })
        .build();

      // Verify all properties were set
      expect(result).toMatchObject({
        title: "Title",
        description: "Description",
        url: "https://example.com",
        color: Colors.Red,
        type: EmbedType.Rich,
        footer: { text: "Footer" },
        image: { url: "https://example.com/image.png" },
        thumbnail: { url: "https://example.com/thumb.png" },
        author: { name: "Author" },
        provider: { name: "Provider" },
        video: { url: "https://example.com/video.mp4" },
        fields: [{ name: "Field", value: "Value", inline: false }],
      });

      // Check timestamp is present and valid
      expect(result.timestamp).toBeDefined();
      expect(() => new Date(result.timestamp as string)).not.toThrow();
    });
  });
});
