import { URL } from "node:url";
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
        this.#data = this.#resolveEmbed(data ?? {});
    }

    public static create(): EmbedBuilder {
        return new EmbedBuilder();
    }

    public setTitle(title: string): this {
        this.#validateStringLength(title, EmbedBuilder.TITLE_LIMIT, "Title");
        this.#data.title = title;
        return this;
    }

    public setType(type: EmbedTypes): this {
        this.#data.type = type;
        return this;
    }

    public setDescription(description: string): this {
        this.#validateStringLength(description, EmbedBuilder.DESCRIPTION_LIMIT, "Description");
        this.#data.description = description;
        return this;
    }

    public setUrl(url: string): this {
        if (!this.#isValidUrl(url)) {
            throw new Error("Invalid URL provided");
        }

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
        if (footer.text) {
            this.#validateStringLength(footer.text, EmbedBuilder.FOOTER_TEXT_LIMIT, "Footer text");
        }

        this.#data.footer = footer;
        return this;
    }

    public setImage(image: EmbedImageStructure): this {
        if (image.url && !this.#isValidUrl(image.url)) {
            throw new Error("Invalid image URL provided");
        }

        this.#data.image = image;
        return this;
    }

    public setThumbnail(thumbnail: EmbedThumbnailStructure): this {
        if (thumbnail.url && !this.#isValidUrl(thumbnail.url)) {
            throw new Error("Invalid image URL provided");
        }

        this.#data.thumbnail = thumbnail;
        return this;
    }

    public setVideo(video: EmbedVideoStructure): this {
        if (video.url && !this.#isValidUrl(video.url)) {
            throw new Error("Invalid image URL provided");
        }

        this.#data.video = video;
        return this;
    }

    public setProvider(provider: EmbedProviderStructure): this {
        if (provider.url && !this.#isValidUrl(provider.url)) {
            throw new Error("Invalid image URL provided");
        }

        this.#data.provider = provider;
        return this;
    }

    public setAuthor(author: EmbedAuthorStructure): this {
        if (author.name) {
            this.#validateStringLength(author.name, EmbedBuilder.AUTHOR_NAME_LIMIT, "Author name");
        }

        if (author.url && !this.#isValidUrl(author.url)) {
            throw new Error("Invalid author URL provided");
        }

        this.#data.author = author;
        return this;
    }

    public addField(field: EmbedFieldStructure): this {
        this.#validateField(field);
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
            this.#validateField(field);
        }

        if (!this.#data.fields) {
            this.#data.fields = [];
        }

        if (this.#data.fields.length + fields.length > EmbedBuilder.FIELDS_LIMIT) {
            throw new Error(`Cannot add more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
        }

        this.#data.fields.push(...fields);
        return this;
    }

    public setFields(fields: EmbedFieldStructure[]): this {
        for (const field of fields) {
            this.#validateField(field);
        }

        if (fields.length > EmbedBuilder.FIELDS_LIMIT) {
            throw new Error(`Cannot set more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
        }

        this.#data.fields = fields;
        return this;
    }

    public toJSON(): Readonly<EmbedStructure> {
        return Object.freeze({ ...this.#data });
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveTimestamp(timestamp: Date | Integer | string): string {
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }

        return new Date(timestamp).toISOString();
    }

    #resolveEmbed(data: EmbedStructure): EmbedStructure {
        if (data.title) {
            this.#validateStringLength(data.title, EmbedBuilder.TITLE_LIMIT, "Title");
        }

        if (data.description) {
            this.#validateStringLength(data.description, EmbedBuilder.DESCRIPTION_LIMIT, "Description");
        }

        if (data.footer?.text) {
            this.#validateStringLength(data.footer.text, EmbedBuilder.FOOTER_TEXT_LIMIT, "Footer text");
        }

        if (data.author?.name) {
            this.#validateStringLength(data.author.name, EmbedBuilder.AUTHOR_NAME_LIMIT, "Author name");
        }

        if (data.fields) {
            if (data.fields.length > EmbedBuilder.FIELDS_LIMIT) {
                throw new Error(`Cannot have more than ${EmbedBuilder.FIELDS_LIMIT} fields`);
            }

            for (const field of data.fields) {
                this.#validateField(field);
            }
        }

        return data;
    }

    #validateField(field: EmbedFieldStructure): void {
        this.#validateStringLength(field.name, EmbedBuilder.FIELD_NAME_LIMIT, "Field name");
        this.#validateStringLength(field.value, EmbedBuilder.FIELD_VALUE_LIMIT, "Field value");
    }

    #validateStringLength(str: string, limit: Integer, fieldName: string): void {
        if (str.length > limit) {
            throw new Error(`${fieldName} exceeds ${limit} characters`);
        }
    }

    #isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
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
