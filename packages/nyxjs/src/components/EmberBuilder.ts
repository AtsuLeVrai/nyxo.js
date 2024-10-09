import type {
    EmbedAuthorStructure,
    EmbedFieldStructure,
    EmbedFooterStructure,
    EmbedImageStructure,
    EmbedProviderStructure,
    EmbedStructure,
    EmbedThumbnailStructure,
    EmbedTypes,
    EmbedVideoStructure,
    Integer,
} from "@nyxjs/core";
import type { ColorResolvable } from "../utils";
import { resolveColor } from "../utils";

export class EmbedBuilder {
    public static readonly TITLE_LIMIT = 256;

    public static readonly DESCRIPTION_LIMIT = 4_096;

    public static readonly FIELDS_LIMIT = 25;

    public static readonly FIELD_NAME_LIMIT = 256;

    public static readonly FIELD_VALUE_LIMIT = 1_024;

    public static readonly FOOTER_TEXT_LIMIT = 2_048;

    public static readonly AUTHOR_NAME_LIMIT = 256;

    readonly #data: EmbedStructure;

    public constructor(data?: EmbedStructure) {
        this.#data = this.#resolveEmbed(data);
    }

    public static create(): EmbedBuilder {
        return new EmbedBuilder();
    }

    public setTitle(title: string): this {
        if (title.length > EmbedBuilder.TITLE_LIMIT) {
            throw new Error(`Title exceeds ${EmbedBuilder.TITLE_LIMIT} characters`);
        }

        this.#data.title = title;
        return this;
    }

    public setType(type: EmbedTypes): this {
        this.#data.type = type;
        return this;
    }

    public setDescription(description: string): this {
        if (description.length > EmbedBuilder.DESCRIPTION_LIMIT) {
            throw new Error(`Description exceeds ${EmbedBuilder.DESCRIPTION_LIMIT} characters`);
        }

        this.#data.description = description;
        return this;
    }

    public setUrl(url: string): this {
        this.#data.url = url;
        return this;
    }

    public setTimestamp(timestamp: Date | Integer = Date.now()): this {
        this.#data.timestamp = this.#resolveTimestamp(timestamp);
        return this;
    }

    public setColor(color: ColorResolvable): this {
        this.#data.color = resolveColor(color);
        return this;
    }

    public setFooter(footer: EmbedFooterStructure): this {
        if (footer.text && footer.text.length > EmbedBuilder.FOOTER_TEXT_LIMIT) {
            throw new Error(`Footer text exceeds ${EmbedBuilder.FOOTER_TEXT_LIMIT} characters`);
        }

        this.#data.footer = footer;
        return this;
    }

    public setImage(image: EmbedImageStructure): this {
        this.#data.image = image;
        return this;
    }

    public setThumbnail(thumbnail: EmbedThumbnailStructure): this {
        this.#data.thumbnail = thumbnail;
        return this;
    }

    public setVideo(video: EmbedVideoStructure): this {
        this.#data.video = video;
        return this;
    }

    public setProvider(provider: EmbedProviderStructure): this {
        this.#data.provider = provider;
        return this;
    }

    public setAuthor(author: EmbedAuthorStructure): this {
        if (author.name && author.name.length > EmbedBuilder.AUTHOR_NAME_LIMIT) {
            throw new Error(`Author name exceeds ${EmbedBuilder.AUTHOR_NAME_LIMIT} characters`);
        }

        this.#data.author = author;
        return this;
    }

    public addField(field: EmbedFieldStructure): this {
        this.#parseField(field);
        if (!this.#data.fields) {
            this.#data.fields = [];
        }

        if (this.#data.fields.length >= EmbedBuilder.FIELDS_LIMIT) {
            throw new Error(`Cannot add more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
        }

        this.#data.fields.push(field);
        return this;
    }

    public addFields(...fields: EmbedFieldStructure[]): this {
        for (const field of fields) {
            this.#parseField(field);
        }

        if (!this.#data.fields) {
            this.#data.fields = [];
        }

        this.#data.fields.push(...fields);
        return this;
    }

    public setFields(fields: EmbedFieldStructure[]): this {
        for (const field of fields) {
            this.#parseField(field);
        }

        if (fields.length > EmbedBuilder.FIELDS_LIMIT) {
            throw new Error(`Cannot set more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
        }

        this.#data.fields = fields;
        return this;
    }

    public toJSON(): EmbedStructure {
        return { ...this.#data };
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveTimestamp(timestamp: Date | Integer | string): string {
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }

        if (typeof timestamp === "number") {
            return new Date(timestamp).toISOString();
        }

        return new Date(timestamp).toISOString();
    }

    #resolveEmbed(data?: EmbedStructure): EmbedStructure {
        if (!data) {
            return {};
        }

        if (data.title && data.title.length > EmbedBuilder.TITLE_LIMIT) {
            throw new Error(`Title exceeds ${EmbedBuilder.TITLE_LIMIT} characters`);
        }

        if (data.description && data.description.length > EmbedBuilder.DESCRIPTION_LIMIT) {
            throw new Error(`Description exceeds ${EmbedBuilder.DESCRIPTION_LIMIT} characters`);
        }

        if (data.footer?.text && data.footer.text.length > EmbedBuilder.FOOTER_TEXT_LIMIT) {
            throw new Error(`Footer text exceeds ${EmbedBuilder.FOOTER_TEXT_LIMIT} characters`);
        }

        if (data.author?.name && data.author.name.length > EmbedBuilder.AUTHOR_NAME_LIMIT) {
            throw new Error(`Author name exceeds ${EmbedBuilder.AUTHOR_NAME_LIMIT} characters`);
        }

        if (data.fields) {
            if (data.fields.length > EmbedBuilder.FIELDS_LIMIT) {
                throw new Error(`Cannot have more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
            }

            for (const field of data.fields) {
                this.#parseField(field);
            }
        }

        return data;
    }

    #parseField(field: EmbedFieldStructure): void {
        if (field.name.length > EmbedBuilder.FIELD_NAME_LIMIT) {
            throw new Error(`Field name exceeds ${EmbedBuilder.FIELD_NAME_LIMIT} characters`);
        }

        if (field.value.length > EmbedBuilder.FIELD_VALUE_LIMIT) {
            throw new Error(`Field value exceeds ${EmbedBuilder.FIELD_VALUE_LIMIT} characters`);
        }
    }
}
