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
import { type ColorResolvable, Colors } from "../libs/index.js";

type EmbedSchema = {
    addFields(...fields: EmbedFieldStructure[]): EmbedSchema;
    setAuthor(author: EmbedAuthorStructure): EmbedSchema;
    setColor(color: ColorResolvable): EmbedSchema;
    setDescription(description: string): EmbedSchema;
    setFields(fields: EmbedFieldStructure[]): EmbedSchema;
    setFooter(footer: EmbedFooterStructure): EmbedSchema;
    setImage(image: EmbedImageStructure): EmbedSchema;
    setProvider(provider: EmbedProviderStructure): EmbedSchema;
    setThumbnail(thumbnail: EmbedThumbnailStructure): EmbedSchema;
    setTimestamp(timestamp: Date | Integer): EmbedSchema;
    setTitle(title: string): EmbedSchema;
    setType(type: EmbedTypes): EmbedSchema;
    setUrl(url: string): EmbedSchema;
    setVideo(video: EmbedVideoStructure): EmbedSchema;
    toJSON(): Readonly<Partial<EmbedStructure>>;
    toString(): string;
};

export class EmbedBuilder implements EmbedSchema {
    static readonly TITLE_LIMIT = 256;

    static readonly DESCRIPTION_LIMIT = 4_096;

    static readonly FIELDS_LIMIT = 25;

    static readonly FIELD_NAME_LIMIT = 256;

    static readonly FIELD_VALUE_LIMIT = 1_024;

    static readonly FOOTER_TEXT_LIMIT = 2_048;

    static readonly AUTHOR_NAME_LIMIT = 256;

    readonly #data: Partial<EmbedStructure>;

    constructor(data: Partial<EmbedStructure> = {}) {
        this.#data = data;
    }

    addFields(...fields: EmbedFieldStructure[]): this {
        this.#data.fields = [...(this.#data.fields ?? []), ...fields];
        return this;
    }

    setAuthor(author: EmbedAuthorStructure): this {
        this.#data.author = author;
        return this;
    }

    setColor(color: ColorResolvable): this {
        this.#data.color = Colors.resolve(color);
        return this;
    }

    setDescription(description: string): this {
        this.#data.description = description;
        return this;
    }

    setFields(fields: EmbedFieldStructure[]): this {
        this.#data.fields = fields;
        return this;
    }

    setFooter(footer: EmbedFooterStructure): this {
        this.#data.footer = footer;
        return this;
    }

    setImage(image: EmbedImageStructure): this {
        this.#data.image = image;
        return this;
    }

    setProvider(provider: EmbedProviderStructure): this {
        this.#data.provider = provider;
        return this;
    }

    setThumbnail(thumbnail: EmbedThumbnailStructure): this {
        this.#data.thumbnail = thumbnail;
        return this;
    }

    setTimestamp(timestamp: Date | Integer = Date.now()): this {
        this.#data.timestamp = timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();
        return this;
    }

    setTitle(title: string): this {
        this.#data.title = title;
        return this;
    }

    setType(type: EmbedTypes): this {
        this.#data.type = type;
        return this;
    }

    setUrl(url: string): this {
        this.#data.url = url;
        return this;
    }

    setVideo(video: EmbedVideoStructure): this {
        this.#data.video = video;
        return this;
    }

    toJSON(): Readonly<Partial<EmbedStructure>> {
        if (!this.#validate()) {
            return Object.freeze({});
        }

        return Object.freeze({ ...this.#data });
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    #validate(): boolean {
        try {
            if (this.#data.description && this.#data.description.length > EmbedBuilder.DESCRIPTION_LIMIT) {
                throw new Error(`Description exceeds ${EmbedBuilder.DESCRIPTION_LIMIT} characters`);
            }

            if (this.#data.fields) {
                if (this.#data.fields.length > EmbedBuilder.FIELDS_LIMIT) {
                    throw new Error(
                        `Fields limit exceeded. Must be less than or equal to ${EmbedBuilder.FIELDS_LIMIT}`,
                    );
                }

                for (const field of this.#data.fields) {
                    if (field.name.length > EmbedBuilder.FIELD_NAME_LIMIT) {
                        throw new Error(`Field name exceeds ${EmbedBuilder.FIELD_NAME_LIMIT} characters`);
                    }

                    if (field.value.length > EmbedBuilder.FIELD_VALUE_LIMIT) {
                        throw new Error(`Field value exceeds ${EmbedBuilder.FIELD_VALUE_LIMIT} characters`);
                    }
                }
            }

            if (this.#data.footer && this.#data.footer.text.length > EmbedBuilder.FOOTER_TEXT_LIMIT) {
                throw new Error(`Footer text exceeds ${EmbedBuilder.FOOTER_TEXT_LIMIT} characters`);
            }

            if (this.#data.title && this.#data.title.length > EmbedBuilder.TITLE_LIMIT) {
                throw new Error(`Title exceeds ${EmbedBuilder.TITLE_LIMIT} characters`);
            }

            if (this.#data.author && this.#data.author.name.length > EmbedBuilder.AUTHOR_NAME_LIMIT) {
                throw new Error(`Author name exceeds ${EmbedBuilder.AUTHOR_NAME_LIMIT} characters`);
            }

            return true;
        } catch {
            return false;
        }
    }
}
