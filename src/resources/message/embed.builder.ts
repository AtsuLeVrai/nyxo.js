import { BaseBuilder } from "../../bases/index.js";
import { type ColorResolvable, resolveColor } from "../../utils/index.js";
import type {
  EmbedAuthorEntity,
  EmbedEntity,
  EmbedFieldEntity,
  EmbedFooterEntity,
  EmbedImageEntity,
  EmbedProviderEntity,
  EmbedThumbnailEntity,
  EmbedType,
  EmbedVideoEntity,
} from "./message.entity.js";

export class EmbedBuilder extends BaseBuilder<EmbedEntity> {
  static from(embed: EmbedEntity): EmbedBuilder {
    return new EmbedBuilder(embed);
  }

  setTitle(title: string): this {
    if (title.length > 256) {
      throw new Error("Embed title cannot exceed 256 characters");
    }
    return this.set("title", title);
  }

  setDescription(description: string): this {
    if (description.length > 4096) {
      throw new Error("Embed description cannot exceed 4096 characters");
    }
    return this.set("description", description);
  }

  setUrl(url: string): this {
    return this.set("url", url);
  }

  setTimestamp(timestamp: Date | number | string = new Date()): this {
    return this.set("timestamp", new Date(timestamp).toISOString());
  }

  setColor(color: ColorResolvable): this {
    return this.set("color", resolveColor(color));
  }

  setType(type: EmbedType): this {
    return this.set("type", type);
  }

  setFooter(footer: EmbedFooterEntity): this {
    return this.set("footer", footer);
  }

  setImage(image: EmbedImageEntity): this {
    return this.set("image", image);
  }

  setThumbnail(thumbnail: EmbedThumbnailEntity): this {
    return this.set("thumbnail", thumbnail);
  }

  setAuthor(author: EmbedAuthorEntity): this {
    return this.set("author", author);
  }

  setProvider(provider: EmbedProviderEntity): this {
    return this.set("provider", provider);
  }

  setVideo(video: EmbedVideoEntity): this {
    return this.set("video", video);
  }

  addField(field: EmbedFieldEntity): this {
    const currentFields = this.get("fields") || [];
    if (currentFields.length >= 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }
    if (field.name.length > 256) {
      throw new Error("Field name cannot exceed 256 characters");
    }
    if (field.value.length > 1024) {
      throw new Error("Field value cannot exceed 1024 characters");
    }
    return this.pushToArray("fields", field);
  }

  addFields(...fields: EmbedFieldEntity[]): this {
    const currentFields = this.get("fields") || [];
    if (currentFields.length + fields.length > 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }
    for (const field of fields) {
      if (field.name.length > 256) {
        throw new Error("Field name cannot exceed 256 characters");
      }
      if (field.value.length > 1024) {
        throw new Error("Field value cannot exceed 1024 characters");
      }
    }
    return this.pushToArray("fields", ...fields);
  }

  setFields(fields: EmbedFieldEntity[]): this {
    if (fields.length > 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }
    for (const field of fields) {
      if (field.name.length > 256) {
        throw new Error("Field name cannot exceed 256 characters");
      }
      if (field.value.length > 1024) {
        throw new Error("Field value cannot exceed 1024 characters");
      }
    }
    return this.setArray("fields", fields);
  }

  spliceFields(index: number, deleteCount: number, ...fields: EmbedFieldEntity[]): this {
    const currentFields = this.get("fields") || [];
    const resultingLength = currentFields.length - deleteCount + fields.length;
    if (resultingLength > 25) {
      throw new Error("Embed cannot have more than 25 fields");
    }
    for (const field of fields) {
      if (field.name.length > 256) {
        throw new Error("Field name cannot exceed 256 characters");
      }
      if (field.value.length > 1024) {
        throw new Error("Field value cannot exceed 1024 characters");
      }
    }
    currentFields.splice(index, deleteCount, ...fields);
    return this.set("fields", currentFields);
  }

  getTotalLength(): number {
    const title = this.get("title")?.length ?? 0;
    const description = this.get("description")?.length ?? 0;
    const footer = this.get("footer")?.text?.length ?? 0;
    const author = this.get("author")?.name?.length ?? 0;
    const fields =
      this.get("fields")?.reduce(
        (total, field) => total + field.name.length + field.value.length,
        0,
      ) ?? 0;

    return title + description + footer + author + fields;
  }

  protected validate(): void {
    const totalLength = this.getTotalLength();
    if (totalLength > 6000) {
      throw new Error(
        `Embed total length cannot exceed 6000 characters (currently ${totalLength})`,
      );
    }

    const footer = this.get("footer");
    if (footer?.text && footer.text.length > 2048) {
      throw new Error("Footer text cannot exceed 2048 characters");
    }

    const author = this.get("author");
    if (author?.name && author.name.length > 256) {
      throw new Error("Author name cannot exceed 256 characters");
    }
  }
}
