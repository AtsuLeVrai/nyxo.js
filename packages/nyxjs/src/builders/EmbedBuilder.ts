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
} from "@nyxjs/core";
import type { ColorResolvable } from "../libs/Colors";
import { Colors } from "../libs/Colors";
import { EmbedLimits } from "../libs/Limits";

export class EmbedBuilder {
    private readonly data: EmbedStructure = {};

    public constructor(data: EmbedStructure = {}) {
        this.data = data;
    }

    public static from(data?: EmbedStructure): EmbedBuilder {
        return new EmbedBuilder(data);
    }

    public setTitle(title: string): this {
        this.validateLength(title, EmbedLimits.Title, `Title exceeds the maximum length of ${EmbedLimits.Title}`);
        this.data.title = title;
        return this;
    }

    public setType(type: EmbedTypes): this {
        this.data.type = type;
        return this;
    }

    public setDescription(description: string): this {
        this.validateLength(
            description,
            EmbedLimits.Description,
            `Description exceeds the maximum length of ${EmbedLimits.Description}`
        );
        this.data.description = description;
        return this;
    }

    public setUrl(url: string): this {
        this.data.url = url;
        return this;
    }

    public setTimestamp(date: Date = new Date()): this {
        this.data.timestamp = date.toISOString();
        return this;
    }

    public setColor(color: ColorResolvable): this {
        this.data.color = this.resolveColor(color);
        return this;
    }

    public setFooter(footer: EmbedFooterStructure): this {
        this.validateLength(
            footer.text,
            EmbedLimits.FooterText,
            `Footer text exceeds the maximum length of ${EmbedLimits.FooterText}`
        );
        this.data.footer = footer;
        return this;
    }

    public setImage(image: EmbedImageStructure): this {
        this.data.image = image;
        return this;
    }

    public setThumbnail(thumbnail: EmbedThumbnailStructure): this {
        this.data.thumbnail = thumbnail;
        return this;
    }

    public setVideo(video: EmbedVideoStructure): this {
        this.data.video = video;
        return this;
    }

    public setProvider(provider: EmbedProviderStructure): this {
        this.data.provider = provider;
        return this;
    }

    public setAuthor(author: EmbedAuthorStructure): this {
        this.validateLength(
            author.name,
            EmbedLimits.AuthorName,
            `Author name exceeds the maximum length of ${EmbedLimits.AuthorName}`
        );
        this.data.author = author;
        return this;
    }

    public addField(field: EmbedFieldStructure): this {
        this.validateField(field);
        if (!this.data.fields) {
            this.data.fields = [];
        }

        this.data.fields.push(field);
        return this;
    }

    public addFields(...fields: EmbedFieldStructure[]): this {
        if (fields.length > EmbedLimits.Fields) {
            throw new Error(`Fields exceed the maximum number of ${EmbedLimits.Fields}`);
        }

        for (const field of fields) this.validateField(field);
        if (!this.data.fields) {
            this.data.fields = [];
        }

        this.data.fields.push(...fields);
        return this;
    }

    public setFields(fields: EmbedFieldStructure[]): this {
        if (fields.length > EmbedLimits.Fields) {
            throw new Error(`Fields exceed the maximum number of ${EmbedLimits.Fields}`);
        }

        for (const field of fields) this.validateField(field);
        this.data.fields = fields;
        return this;
    }

    public toJSON(): EmbedStructure {
        return this.data;
    }

    private validateLength(value: string, limit: number, errorMessage: string): void {
        if (value.length > limit) {
            throw new Error(errorMessage);
        }
    }

    private validateField(field: EmbedFieldStructure): void {
        this.validateLength(
            field.name,
            EmbedLimits.FieldName,
            `Field name exceeds the maximum length of ${EmbedLimits.FieldName}`
        );
        this.validateLength(
            field.value,
            EmbedLimits.FieldValue,
            `Field value exceeds the maximum length of ${EmbedLimits.FieldValue}`
        );
    }

    private resolveColor(color: ColorResolvable): number {
        if (typeof color === "number") {
            return color;
        }

        if (typeof color === "string") {
            if (color in Colors) {
                return Colors[color as keyof typeof Colors];
            }

            return Number.parseInt(color.startsWith("#") ? color.slice(1) : color, 16);
        }

        if (Array.isArray(color)) {
            return (color[0] << 16) + (color[1] << 8) + color[2];
        }

        throw new Error("Invalid color format");
    }
}
