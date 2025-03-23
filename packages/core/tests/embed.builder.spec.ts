import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmbedBuilder, EmbedType } from "../src/index.js";

describe("EmbedBuilder", () => {
  let builder: EmbedBuilder;

  beforeEach(() => {
    builder = new EmbedBuilder();
  });

  describe("constructor", () => {
    it("should create a default embed", () => {
      expect(builder.toJson()).toEqual({
        type: EmbedType.Rich,
      });
    });

    it("should initialize with provided data", () => {
      const initialData = {
        type: EmbedType.Rich,
        title: "Test Embed",
        description: "This is a test embed",
      };

      const customBuilder = new EmbedBuilder(initialData);

      expect(customBuilder.toJson()).toEqual(initialData);
    });
  });

  describe("static from", () => {
    it("should create a builder from an existing embed", () => {
      const embed = {
        type: EmbedType.Rich,
        title: "Test Embed",
        description: "This is a test embed",
      };

      const newBuilder = EmbedBuilder.from(embed);

      expect(newBuilder.toJson()).toEqual(embed);
    });
  });

  describe("setType", () => {
    it("should set the type", () => {
      builder.setType(EmbedType.Image);

      expect(builder.toJson().type).toBe(EmbedType.Image);
    });

    it("should throw with invalid type", () => {
      expect(() => builder.setType("invalid" as EmbedType)).toThrow();
    });
  });

  describe("setTitle", () => {
    it("should set the title", () => {
      builder.setTitle("Test Embed");

      expect(builder.toJson().title).toBe("Test Embed");
    });

    it("should throw when title is too long", () => {
      const longTitle = "a".repeat(257); // 257 characters, limit is 256

      expect(() => builder.setTitle(longTitle)).toThrow();
    });
  });

  describe("setDescription", () => {
    it("should set the description", () => {
      builder.setDescription("This is a test embed");

      expect(builder.toJson().description).toBe("This is a test embed");
    });

    it("should throw when description is too long", () => {
      const longDescription = "a".repeat(4097); // 4097 characters, limit is 4096

      expect(() => builder.setDescription(longDescription)).toThrow();
    });
  });

  describe("setUrl", () => {
    it("should set the URL", () => {
      builder.setUrl("https://discord.com");

      expect(builder.toJson().url).toBe("https://discord.com");
    });

    it("should throw with invalid URL", () => {
      expect(() => builder.setUrl("not-a-url")).toThrow();
    });
  });

  describe("setTimestamp", () => {
    it("should set the timestamp from string", () => {
      const timestamp = "2023-01-01T00:00:00.000Z";
      builder.setTimestamp(timestamp);

      expect(builder.toJson().timestamp).toBe(timestamp);
    });

    it("should set the timestamp from Date object", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      builder.setTimestamp(date);

      expect(builder.toJson().timestamp).toBe(date.toISOString());
    });

    it("should set current timestamp when no argument provided", () => {
      // Mock Date.now() to return a fixed timestamp
      const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1672531200000); // 2023-01-01T00:00:00.000Z

      builder.setTimestamp();

      expect(builder.toJson().timestamp).toBe(
        new Date(1672531200000).toISOString(),
      );

      nowSpy.mockRestore();
    });
  });

  describe("setColor", () => {
    it("should set the color", () => {
      builder.setColor(0x3498db); // Blue

      expect(builder.toJson().color).toBe(0x3498db);
    });
  });

  describe("setFooter", () => {
    it("should set the footer", () => {
      const footer = { text: "Footer text" };
      builder.setFooter(footer);

      expect(builder.toJson().footer).toEqual(footer);
    });

    it("should throw with invalid footer", () => {
      expect(() => builder.setFooter({ text: "" })).toThrow();
    });
  });

  describe("setImage", () => {
    it("should set the image", () => {
      const image = { url: "https://example.com/image.png" };
      builder.setImage(image);

      expect(builder.toJson().image).toEqual(image);
    });

    it("should throw with invalid image", () => {
      expect(() => builder.setImage({ url: "not-a-url" })).toThrow();
    });
  });

  describe("setThumbnail", () => {
    it("should set the thumbnail", () => {
      const thumbnail = { url: "https://example.com/thumbnail.png" };
      builder.setThumbnail(thumbnail);

      expect(builder.toJson().thumbnail).toEqual(thumbnail);
    });

    it("should throw with invalid thumbnail", () => {
      expect(() => builder.setThumbnail({ url: "not-a-url" })).toThrow();
    });
  });

  describe("setAuthor", () => {
    it("should set the author", () => {
      const author = { name: "Author Name" };
      builder.setAuthor(author);

      expect(builder.toJson().author).toEqual(author);
    });

    it("should throw with invalid author", () => {
      expect(() => builder.setAuthor({ name: "" })).toThrow();
    });
  });

  describe("addField", () => {
    it("should add a field", () => {
      const field = { name: "Field Name", value: "Field Value", inline: true };
      builder.addField(field);

      expect(builder.toJson().fields).toEqual([field]);
    });

    it("should initialize fields array if not present", () => {
      expect(builder.toJson().fields).toBeUndefined();

      const field = { name: "Field Name", value: "Field Value" };
      builder.addField(field);

      expect(builder.toJson().fields).toEqual([field]);
    });

    it("should throw when field name is empty", () => {
      expect(() => builder.addField({ name: "", value: "Value" })).toThrow();
    });

    it("should throw when field value is empty", () => {
      expect(() => builder.addField({ name: "Name", value: "" })).toThrow();
    });

    it("should throw when adding more than 25 fields", () => {
      // Add 25 fields (which is fine)
      for (let i = 0; i < 25; i++) {
        builder.addField({ name: `Field ${i}`, value: `Value ${i}` });
      }

      // Adding a 26th should throw
      expect(() => {
        builder.addField({ name: "Too Many", value: "Fields" });
      }).toThrow();
    });
  });

  describe("addFields", () => {
    it("should add multiple fields", () => {
      const fields = [
        { name: "Field 1", value: "Value 1" },
        { name: "Field 2", value: "Value 2" },
      ];

      builder.addFields(...fields);

      expect(builder.toJson().fields).toEqual(fields);
    });
  });

  describe("setFields", () => {
    it("should set fields, replacing existing ones", () => {
      // Add initial fields
      builder.addFields(
        { name: "Field 1", value: "Value 1" },
        { name: "Field 2", value: "Value 2" },
      );

      // Replace with new fields
      const newFields = [
        { name: "New Field 1", value: "New Value 1" },
        { name: "New Field 2", value: "New Value 2" },
      ];

      builder.setFields(newFields);

      expect(builder.toJson().fields).toEqual(newFields);
    });

    it("should throw when setting more than 25 fields", () => {
      const tooManyFields = new Array(26).fill(0).map((_, i) => {
        return { name: `Field ${i}`, value: `Value ${i}` };
      });

      expect(() => builder.setFields(tooManyFields)).toThrow();
    });
  });

  describe("removeField", () => {
    it("should remove a field at the specified index", () => {
      builder.addFields(
        { name: "Field 1", value: "Value 1" },
        { name: "Field 2", value: "Value 2" },
        { name: "Field 3", value: "Value 3" },
      );

      builder.removeField(1); // Remove 'Field 2'

      expect(builder.toJson().fields).toEqual([
        { name: "Field 1", value: "Value 1" },
        { name: "Field 3", value: "Value 3" },
      ]);
    });

    it("should throw when index is out of bounds", () => {
      builder.addField({ name: "Field 1", value: "Value 1" });

      expect(() => builder.removeField(1)).toThrow(
        "Field index out of bounds: 1",
      );
    });

    it("should throw when there are no fields", () => {
      expect(() => builder.removeField(0)).toThrow("No fields to remove");
    });
  });

  describe("setProvider", () => {
    it("should set the provider", () => {
      const provider = { name: "Provider Name", url: "https://example.com" };
      builder.setProvider(provider);

      expect(builder.toJson().provider).toEqual(provider);
    });
  });

  describe("setVideo", () => {
    it("should set the video", () => {
      const video = { url: "https://example.com/video.mp4" };
      builder.setVideo(video);

      expect(builder.toJson().video).toEqual(video);
    });
  });

  describe("build", () => {
    it("should return the validated embed", () => {
      builder
        .setTitle("Test Embed")
        .setDescription("This is a test embed")
        .setColor(0x3498db);

      const result = builder.build();

      expect(result).toEqual({
        type: EmbedType.Rich,
        title: "Test Embed",
        description: "This is a test embed",
        color: 0x3498db,
      });
    });

    it("should throw if validation fails", () => {
      // Forcefully set invalid data
      Object.defineProperty(builder, "#data", {
        value: {
          type: EmbedType.Rich,
          title: "a".repeat(300), // Too long
        },
        writable: true,
      });

      expect(() => builder.build()).toThrow();
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same data", () => {
      builder
        .setTitle("Test Embed")
        .setDescription("This is a test embed")
        .setColor(0x3498db);

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
        .setTitle("Test Embed")
        .setDescription("This is a test embed")
        .setColor(0x3498db);

      const json = builder.toJson();

      expect(json).toEqual({
        type: EmbedType.Rich,
        title: "Test Embed",
        description: "This is a test embed",
        color: 0x3498db,
      });
    });
  });

  describe("calculateLength", () => {
    it("should calculate the total character count correctly", () => {
      builder
        .setTitle("Title") // 5 chars
        .setDescription("Description") // 11 chars
        .setAuthor({ name: "Author" }) // 6 chars
        .setFooter({ text: "Footer" }) // 6 chars
        .addFields(
          { name: "Field 1", value: "Value 1" }, // 7 + 7 = 14 chars
          { name: "Field 2", value: "Value 2" }, // 7 + 7 = 14 chars
        );

      expect(builder.calculateLength()).toBe(5 + 11 + 6 + 6 + 14 + 14);
    });

    it("should handle missing optional fields", () => {
      builder.setTitle("Title"); // Only title (5 chars)

      expect(builder.calculateLength()).toBe(5);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty embed", () => {
      expect(builder.isEmpty()).toBe(true);
    });

    it("should return false when embed has title", () => {
      builder.setTitle("Title");

      expect(builder.isEmpty()).toBe(false);
    });

    it("should return false when embed has description", () => {
      builder.setDescription("Description");

      expect(builder.isEmpty()).toBe(false);
    });

    it("should return false when embed has fields", () => {
      builder.addField({ name: "Field", value: "Value" });

      expect(builder.isEmpty()).toBe(false);
    });

    it("should return false when embed has other attributes set", () => {
      builder.setColor(0x3498db);

      expect(builder.isEmpty()).toBe(false);
    });
  });

  describe("isValid", () => {
    it("should return true for valid embed", () => {
      builder.setTitle("Test Embed").setDescription("This is a test embed");

      expect(builder.isValid()).toBe(true);
    });

    it("should return false for invalid embed", () => {
      // Forcefully set invalid data
      Object.defineProperty(builder, "#data", {
        value: {
          type: EmbedType.Rich,
          title: "a".repeat(300), // Too long
        },
        writable: true,
      });

      expect(builder.isValid()).toBe(false);
    });
  });
});
