import type { ModalStructure } from "@nyxjs/core";
import { ModalLimits } from "../libs/Limits";
import { ActionRowBuilder } from "./ActionRowBuilder";
import type { TextInputBuilder } from "./TextInputBuilder";

const DEFAULT_VALUES: ModalStructure = {
    custom_id: "",
    title: "",
    components: [],
};

export class ModalBuilder extends ActionRowBuilder<TextInputBuilder> {
    private readonly data: ModalStructure;

    public constructor(data: Partial<ModalStructure> = {}) {
        super();
        this.data = { ...DEFAULT_VALUES, ...data };
    }

    public setCustomId(customId: string): this {
        this.validateLength(customId, ModalLimits.CustomId, "CustomId");
        this.data.custom_id = customId;
        return this;
    }

    public setTitle(title: string): this {
        this.validateLength(title, ModalLimits.Title, "Title");
        this.data.title = title;
        return this;
    }

    private validateLength(value: string, limit: number, fieldName: string): void {
        if (value.length > limit) {
            throw new Error(`${fieldName} exceeds the maximum length of ${limit}`);
        }
    }
}
