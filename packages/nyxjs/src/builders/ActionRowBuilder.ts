import type { ActionRowStructure, ComponentResolvableStructure } from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";

export class ActionRowBuilder<T extends ComponentResolvableStructure> {
    #components: T[];

    public constructor(components: T[] = []) {
        this.#components = components;
    }

    public addComponents(components: T[]): this {
        if (!this.#components) {
            this.#components = [];
        }

        this.#components.push(...components);
        return this;
    }

    public setComponents(components: T[]): this {
        this.#components = components;
        return this;
    }

    public toJSON(): ActionRowStructure<T> {
        return {
            type: ComponentTypes.ActionRow,
            components: this.#components,
        };
    }
}
