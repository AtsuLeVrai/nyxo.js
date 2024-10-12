import type { ActionRowStructure } from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import type { ButtonBuilder } from "./ButtonBuilder";
import type { SelectMenuBuilder } from "./SelectMenuBuilder";
import type { TextInputBuilder } from "./TextInputBuilder";

export class ActionRowBuilder {
    public static readonly COMPONENT_LIMIT = 5;

    readonly #data: ActionRowStructure;

    readonly #DEFAULT_DATA: ActionRowStructure = {
        type: ComponentTypes.ActionRow,
        components: [],
    };

    public constructor(data?: ActionRowStructure) {
        this.#data = this.#resolveActionRow(data ?? this.#DEFAULT_DATA);
    }

    public static create(data?: ActionRowStructure): ActionRowBuilder {
        return new ActionRowBuilder(data);
    }

    public addComponents(...components: (ButtonBuilder | SelectMenuBuilder | TextInputBuilder)[]): this {
        if (this.#data.components.length + components.length > ActionRowBuilder.COMPONENT_LIMIT) {
            throw new Error(`An Action Row can only have up to ${ActionRowBuilder.COMPONENT_LIMIT} components`);
        }

        this.#data.components.push(...components.map((component) => component.toJSON()));
        return this;
    }

    public setComponents(components: (ButtonBuilder | SelectMenuBuilder | TextInputBuilder)[]): this {
        if (components.length > ActionRowBuilder.COMPONENT_LIMIT) {
            throw new Error(`An Action Row can only have up to ${ActionRowBuilder.COMPONENT_LIMIT} components`);
        }

        this.#data.components = components.map((component) => component.toJSON());
        return this;
    }

    public toJSON(): Readonly<ActionRowStructure> {
        return Object.freeze({ ...this.#data });
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveActionRow(data: ActionRowStructure): ActionRowStructure {
        if (data.type !== ComponentTypes.ActionRow) {
            throw new Error("Action Row must have type 1");
        }

        if (!Array.isArray(data.components)) {
            throw new TypeError("Action Row must have an array of components");
        }

        if (data.components.length > ActionRowBuilder.COMPONENT_LIMIT) {
            throw new Error(`An Action Row can only have up to ${ActionRowBuilder.COMPONENT_LIMIT} components`);
        }

        return data;
    }
}
