import { EmbedType } from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  type ColorResolvable,
  Colors,
  EMBED_LIMITS,
  EmbedBuilder,
} from "../src/index.js";

describe("EmbedBuilder", () => {
  it("should create an empty embed", () => {
    const embed = new EmbedBuilder().build();

    expect(embed).toEqual({});
  });

  it("should set title", () => {
    const embed = new EmbedBuilder().setTitle("Test Title").build();

    expect(embed.title).toBe("Test Title");
  });

  it("should set description", () => {
    const embed = new EmbedBuilder()
      .setDescription("This is a test description.")
      .build();

    expect(embed.description).toBe("This is a test description.");
  });

  it("should set URL", () => {
    const embed = new EmbedBuilder().setUrl("https://example.com").build();

    expect(embed.url).toBe("https://example.com");
  });

  it("should set timestamp", () => {
    const date = new Date("2023-01-01T12:00:00Z");

    const embed = new EmbedBuilder().setTimestamp(date).build();

    expect(embed.timestamp).toBe(date.toISOString());
  });

  it("should set color as number", () => {
    const embed = new EmbedBuilder().setColor(0xff0000).build();

    expect(embed.color).toBe(0xff0000);
  });

  it("should set color as hex string", () => {
    const embed = new EmbedBuilder().setColor("#00FF00").build();

    expect(embed.color).toBe(0x00ff00);
  });

  it("should set color as RGB array", () => {
    const embed = new EmbedBuilder().setColor([0, 0, 255]).build();

    expect(embed.color).toBe(0x0000ff);
  });

  it("should set color as named color", () => {
    const embed = new EmbedBuilder().setColor(Colors.Red).build();

    expect(embed.color).toBe(Colors.Red);
  });

  it("should set type", () => {
    const embed = new EmbedBuilder().setType(EmbedType.Rich).build();

    expect(embed.type).toBe("rich");
  });

  it("should set footer", () => {
    const footer = {
      text: "Footer Text",
      icon_url: "https://example.com/icon.png",
      proxy_icon_url: "https://proxy.example.com/icon.png",
    };

    const embed = new EmbedBuilder().setFooter(footer).build();

    expect(embed.footer).toEqual(footer);
  });

  it("should set image", () => {
    const image = {
      url: "https://example.com/image.png",
      proxy_url: "https://proxy.example.com/image.png",
      height: 100,
      width: 200,
    };

    const embed = new EmbedBuilder().setImage(image).build();

    expect(embed.image).toEqual(image);
  });

  it("should set thumbnail", () => {
    const thumbnail = {
      url: "https://example.com/thumbnail.png",
      proxy_url: "https://proxy.example.com/thumbnail.png",
      height: 50,
      width: 50,
    };

    const embed = new EmbedBuilder().setThumbnail(thumbnail).build();

    expect(embed.thumbnail).toEqual(thumbnail);
  });

  it("should set author", () => {
    const author = {
      name: "Author Name",
      url: "https://example.com/author",
      icon_url: "https://example.com/author-icon.png",
      proxy_icon_url: "https://proxy.example.com/author-icon.png",
    };

    const embed = new EmbedBuilder().setAuthor(author).build();

    expect(embed.author).toEqual(author);
  });

  it("should set provider", () => {
    const provider = {
      name: "Provider Name",
      url: "https://example.com/provider",
    };

    const embed = new EmbedBuilder().setProvider(provider).build();

    expect(embed.provider).toEqual(provider);
  });

  it("should set video", () => {
    const video = {
      url: "https://example.com/video.mp4",
      proxy_url: "https://proxy.example.com/video.mp4",
      height: 720,
      width: 1280,
    };

    const embed = new EmbedBuilder().setVideo(video).build();

    expect(embed.video).toEqual(video);
  });

  it("should add a field", () => {
    const field = {
      name: "Field Name",
      value: "Field Value",
      inline: true,
    };

    const embed = new EmbedBuilder().addField(field).build();

    expect(embed.fields).toHaveLength(1);
    expect(embed.fields?.[0]).toEqual(field);
  });

  it("should add multiple fields with addFields", () => {
    const fields = [
      {
        name: "Field 1",
        value: "Value 1",
        inline: true,
      },
      {
        name: "Field 2",
        value: "Value 2",
        inline: false,
      },
    ];

    const embed = new EmbedBuilder().addFields(...fields).build();

    expect(embed.fields).toHaveLength(2);
    expect(embed.fields).toEqual(fields);
  });

  it("should set fields", () => {
    const fields = [
      {
        name: "Field 1",
        value: "Value 1",
        inline: true,
      },
      {
        name: "Field 2",
        value: "Value 2",
        inline: false,
      },
    ];

    const embed = new EmbedBuilder()
      // First add a different field
      .addField({
        name: "Old Field",
        value: "Old Value",
        inline: false,
      })
      // Then replace with our fields
      .setFields(fields)
      .build();

    expect(embed.fields).toHaveLength(2);
    expect(embed.fields).toEqual(fields);
  });

  it("should splice fields", () => {
    const initialFields = [
      {
        name: "Field 1",
        value: "Value 1",
        inline: false,
      },
      {
        name: "Field 2",
        value: "Value 2",
        inline: true,
      },
      {
        name: "Field 3",
        value: "Value 3",
        inline: false,
      },
    ];

    const newFields = [
      {
        name: "New Field 1",
        value: "New Value 1",
        inline: true,
      },
      {
        name: "New Field 2",
        value: "New Value 2",
        inline: false,
      },
    ];

    const embed = new EmbedBuilder()
      .setFields(initialFields)
      // Replace Field 2 and Field 3 with new fields
      .spliceFields(1, 2, ...newFields)
      .build();

    expect(embed.fields).toHaveLength(3);
    expect(embed.fields?.[0]).toEqual(initialFields[0]);
    expect(embed.fields?.[1]).toEqual(newFields[0]);
    expect(embed.fields?.[2]).toEqual(newFields[1]);
  });

  it("should create from existing data", () => {
    const data = {
      title: "Existing Title",
      description: "Existing Description",
      color: 0xff0000,
      footer: {
        text: "Existing Footer",
      },
    };

    const embed = EmbedBuilder.from(data).build();

    expect(embed).toEqual(data);
  });

  // Error cases
  it("should throw error if title exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setTitle("a".repeat(EMBED_LIMITS.TITLE + 1));
    }).toThrow(`Embed title cannot exceed ${EMBED_LIMITS.TITLE} characters`);
  });

  it("should throw error if description exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setDescription("a".repeat(EMBED_LIMITS.DESCRIPTION + 1));
    }).toThrow(
      `Embed description cannot exceed ${EMBED_LIMITS.DESCRIPTION} characters`,
    );
  });

  it("should throw error on invalid URL", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setUrl("not-a-url");
    }).toThrow("Invalid URL format");
  });

  it("should throw error if footer text exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setFooter({
        text: "a".repeat(EMBED_LIMITS.FOOTER_TEXT + 1),
      });
    }).toThrow(
      `Embed footer text cannot exceed ${EMBED_LIMITS.FOOTER_TEXT} characters`,
    );
  });

  it("should throw error if author name exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setAuthor({
        name: "a".repeat(EMBED_LIMITS.AUTHOR_NAME + 1),
      });
    }).toThrow(
      `Embed author name cannot exceed ${EMBED_LIMITS.AUTHOR_NAME} characters`,
    );
  });

  it("should throw error if field name exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.addField({
        name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
        value: "Value",
      });
    }).toThrow(
      `Embed field name cannot exceed ${EMBED_LIMITS.FIELD_NAME} characters`,
    );
  });

  it("should throw error if field value exceeds maximum length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.addField({
        name: "Name",
        value: "a".repeat(EMBED_LIMITS.FIELD_VALUE + 1),
      });
    }).toThrow(
      `Embed field value cannot exceed ${EMBED_LIMITS.FIELD_VALUE} characters`,
    );
  });

  it("should throw error if too many fields added", () => {
    const builder = new EmbedBuilder();

    // Add maximum number of fields
    for (let i = 0; i < EMBED_LIMITS.FIELDS; i++) {
      builder.addField({
        name: `Field ${i + 1}`,
        value: `Value ${i + 1}`,
      });
    }

    // Try to add one more
    expect(() => {
      builder.addField({
        name: "One More",
        value: "Value",
      });
    }).toThrow(`Embeds cannot have more than ${EMBED_LIMITS.FIELDS} fields`);
  });

  it("should throw error if total character count exceeds limit", () => {
    const builder = new EmbedBuilder()
      .setTitle("a".repeat(200))
      .setDescription("a".repeat(3000))
      .setAuthor({
        name: "a".repeat(200),
      })
      .setFooter({
        text: "a".repeat(1000),
      });

    // Add fields to push it over the limit
    for (let i = 0; i < 10; i++) {
      builder.addField({
        name: "a".repeat(100),
        value: "a".repeat(200),
      });
    }

    expect(() => {
      builder.build();
    }).toThrow(/Embed exceeds maximum total character limit/);
  });

  it("should throw error on invalid color input", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.setColor("not-a-color" as ColorResolvable);
    }).toThrow(/Invalid color:/);
  });

  it("should throw error if field names or values in spliceFields exceed max length", () => {
    const builder = new EmbedBuilder();

    expect(() => {
      builder.spliceFields(0, 0, {
        name: "a".repeat(EMBED_LIMITS.FIELD_NAME + 1),
        value: "Value",
      });
    }).toThrow(
      `Embed field name cannot exceed ${EMBED_LIMITS.FIELD_NAME} characters`,
    );

    expect(() => {
      builder.spliceFields(0, 0, {
        name: "Name",
        value: "a".repeat(EMBED_LIMITS.FIELD_VALUE + 1),
      });
    }).toThrow(
      `Embed field value cannot exceed ${EMBED_LIMITS.FIELD_VALUE} characters`,
    );
  });
});
