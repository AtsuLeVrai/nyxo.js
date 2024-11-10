import type { ActionRowStructure, ComponentResolvableStructure } from "@nyxjs/core";

interface ActionRowSchema {
    addComponents(...components: ComponentResolvableStructure[]): ActionRowSchema;
    setComponents(components: ComponentResolvableStructure[]): ActionRowSchema;
    toJson(): Readonly<Partial<ActionRowStructure>>;
    toString(): string;
}

export class ActionRowBuilder implements ActionRowSchema {
    static readonly COMPONENT_LIMIT = 5;

    readonly #data: Partial<ActionRowStructure>;

    constructor(data: Partial<ActionRowStructure> = {}) {
        this.#data = data;
    }

    addComponents(...components: ComponentResolvableStructure[]): this {
        this.#data.components = [...(this.#data.components ?? []), ...components];
        return this;
    }

    setComponents(components: ComponentResolvableStructure[]): this {
        this.#data.components = components;
        return this;
    }

    toJson(): Readonly<Partial<ActionRowStructure>> {
        if (!this.#validate()) {
            return Object.freeze({});
        }

        return Object.freeze({ ...this.#data });
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    #validate(): boolean {
        try {
            if (this.#data.components && this.#data.components.length > ActionRowBuilder.COMPONENT_LIMIT) {
                throw new Error(`An ActionRow can only have up to ${ActionRowBuilder.COMPONENT_LIMIT} components.`);
            }

            return true;
        } catch {
            return false;
        }
    }
}
