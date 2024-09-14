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
    public constructor(public data: EmbedStructure = {}) {}

    public static from(data?: EmbedStructure): EmbedBuilder {
        return new EmbedBuilder(data);
    }

    public setTitle(title: string): this {
        if (EmbedLimits.Title < title.length) {
            throw new Error(`Title exceeds the maximum length of ${EmbedLimits.Title}`);
        }

        this.data.title = title;
        return this;
    }

    public setType(type: EmbedTypes): this {
        this.data.type = type;
        return this;
    }

    public setDescription(description: string): this {
        if (EmbedLimits.Description < description.length) {
            throw new Error(`Description exceeds the maximum length of ${EmbedLimits.Description}`);
        }

        this.data.description = description;
        return this;
    }

    public setUrl(url: string): this {
        this.data.url = url;
        return this;
    }

    public setTimestamp(date?: Date): this {
        this.data.timestamp = date ? date.toISOString() : new Date().toISOString();
        return this;
    }

    public setColor(color: ColorResolvable) {
        this.data.color = this.resolveColor(color);
        return this;
    }

    public setFooter(footer: EmbedFooterStructure): this {
        if (EmbedLimits.FooterText < footer.text.length) {
            throw new Error(`Footer text exceeds the maximum length of ${EmbedLimits.FooterText}`);
        }

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
        if (EmbedLimits.AuthorName < author.name.length) {
            throw new Error(`Provider name exceeds the maximum length of ${EmbedLimits.AuthorName}`);
        }

        this.data.author = author;
        return this;
    }

    public addField(field: EmbedFieldStructure): this {
        if (EmbedLimits.FieldName < field.name.length) {
            throw new Error(`Field name exceeds the maximum length of ${EmbedLimits.FieldName}`);
        }

        if (EmbedLimits.FieldValue < field.value.length) {
            throw new Error(`Field value exceeds the maximum length of ${EmbedLimits.FieldValue}`);
        }

        if (!this.data.fields) {
            this.data.fields = [];
        }

        this.data.fields.push(field);
        return this;
    }

    public addFields(fields: EmbedFieldStructure[]): this {
        if (EmbedLimits.Fields < fields.length) {
            throw new Error(`Fields exceed the maximum number of ${EmbedLimits.Fields}`);
        }

        for (const field of fields) {
            if (EmbedLimits.FieldName < field.name.length) {
                throw new Error(`Field name exceeds the maximum length of ${EmbedLimits.FieldName}`);
            }

            if (EmbedLimits.FieldValue < field.value.length) {
                throw new Error(`Field value exceeds the maximum length of ${EmbedLimits.FieldValue}`);
            }
        }

        if (!this.data.fields) {
            this.data.fields = [];
        }

        this.data.fields.push(...fields);
        return this;
    }

    private resolveColor(color: ColorResolvable): number {
        if (typeof color === "number") {
            return color;
        }

        if (typeof color === "string") {
            if (color in Colors) {
                return Colors[color as keyof typeof Colors];
            }

            if (color.startsWith("#")) {
                return Number.parseInt(color.slice(1), 16);
            }

            return Number.parseInt(color, 16);
        }

        if (Array.isArray(color)) {
            return (color[0] << 16) + (color[1] << 8) + color[2];
        }

        throw new Error("Invalid color format");
    }
}
