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
    public constructor(public data: ModalStructure = DEFAULT_VALUES) {
        super();
    }

    public setCustomId(customId: string): this {
        if (ModalLimits.CustomId < customId.length) {
            throw new Error(`CustomId exceeds the maximum length of ${ModalLimits.CustomId}`);
        }

        this.data.custom_id = customId;
        return this;
    }

    public setTitle(title: string): this {
        if (ModalLimits.Title < title.length) {
            throw new Error(`Title exceeds the maximum length of ${ModalLimits.Title}`);
        }

        this.data.title = title;
        return this;
    }
}
