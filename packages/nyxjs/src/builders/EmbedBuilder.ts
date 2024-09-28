import type {
    EmbedAuthorStructure,
    EmbedFieldStructure,
    EmbedFooterStructure,
    EmbedImageStructure,
    EmbedProviderStructure,
    EmbedStructure,
    EmbedThumbnailStructure,
    EmbedTypes,
    Integer,
} from "@nyxjs/core";
import type { ColorResolvable } from "../helpers/Colors";
import { resolveColor } from "../helpers/Colors";
import { BaseBuilder } from "./BaseBuilder";

export const EmbedLimits = {
    TITLE: 256,
    DESCRIPTION: 4_096,
    FIELDS: 25,
    FIELD_NAME: 256,
    FIELD_VALUE: 1_024,
    FOOTER_TEXT: 2_048,
    AUTHOR_NAME: 256,
};

export class EmbedBuilder<T extends EmbedStructure = EmbedStructure> extends BaseBuilder<T> {
    readonly #data: Partial<T>;

    public constructor(data: Partial<T> = {}) {
        super();
        this.#data = data;
    }

    public setAuthor(author: EmbedAuthorStructure): this {
        this.validateLength(author.name, EmbedLimits.AUTHOR_NAME, "Author name");
        this.#data.author = author;
        return this;
    }

    public setColor(color: ColorResolvable): this {
        this.#data.color = resolveColor(color);
        return this;
    }

    public setDescription(description: string): this {
        this.validateLength(description, EmbedLimits.DESCRIPTION, "Description");
        this.#data.description = description;
        return this;
    }

    public addFields(fields: EmbedFieldStructure[]): this {
        if (!this.#data.fields) {
            this.#data.fields = [];
        }

        for (const field of fields) {
            this.validateLength(field.name, EmbedLimits.FIELD_NAME, "Field name");
            this.validateLength(field.value, EmbedLimits.FIELD_VALUE, "Field value");
        }

        if (this.#data.fields.length + fields.length > EmbedLimits.FIELDS) {
            throw new Error(`Cannot add more than ${EmbedLimits.FIELDS} fields to an embed.`);
        }

        this.#data.fields.push(...fields);
        return this;
    }

    public setFields(fields: EmbedFieldStructure[]): this {
        if (fields.length > EmbedLimits.FIELDS) {
            throw new Error(`Cannot set more than ${EmbedLimits.FIELDS} fields to an embed.`);
        }

        for (const field of fields) {
            this.validateLength(field.name, EmbedLimits.FIELD_NAME, "Field name");
            this.validateLength(field.value, EmbedLimits.FIELD_VALUE, "Field value");
        }

        this.#data.fields = fields;
        return this;
    }

    public setFooter(footer: EmbedFooterStructure): this {
        this.validateLength(footer.text, EmbedLimits.FOOTER_TEXT, "Footer text");
        this.#data.footer = footer;
        return this;
    }

    public setImage(image: EmbedImageStructure): this {
        this.#data.image = image;
        return this;
    }

    public setProvider(provider: EmbedProviderStructure): this {
        this.#data.provider = provider;
        return this;
    }

    public setThumbnail(thumbnail: EmbedThumbnailStructure): this {
        this.#data.thumbnail = thumbnail;
        return this;
    }

    public setTimestamp(timestamp: Date | Integer | string): this {
        this.#data.timestamp = this.resolveTimestamp(timestamp);
        return this;
    }

    public setTitle(title: string): this {
        this.validateLength(title, EmbedLimits.TITLE, "Title");
        this.#data.title = title;
        return this;
    }

    public setType(type: EmbedTypes): this {
        this.#data.type = type;
        return this;
    }

    public setURL(url: string): this {
        this.#data.url = url;
        return this;
    }

    public setVideo(video: EmbedImageStructure): this {
        this.#data.video = video;
        return this;
    }

    public toJSON(): T {
        return this.#data as T;
    }

    private resolveTimestamp(timestamp: Date | Integer | string): string {
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }

        if (typeof timestamp === "number") {
            return new Date(timestamp).toISOString();
        }

        return timestamp;
    }
}
