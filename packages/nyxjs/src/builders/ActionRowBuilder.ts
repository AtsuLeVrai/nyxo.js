import { ComponentTypes } from "@nyxjs/core";
import type { ButtonBuilder } from "./ButtonBuilder";
import type { ChannelSelectBuilder } from "./ChannelSelectBuilder";
import type { EmbedBuilder } from "./EmbedBuilder";
import type { MentionableSelectBuilder } from "./MentionableSelectBuilder";
import type { RoleSelectBuilder } from "./RoleSelectBuilder";
import type { StringSelectBuilder } from "./StringSelectBuilder";
import type { TextInputBuilder } from "./TextInputBuilder";
import type { UserSelectBuilder } from "./UserSelectBuilder";

export type ComponentResolvable =
    | ButtonBuilder
    | ChannelSelectBuilder
    | EmbedBuilder
    | MentionableSelectBuilder
    | RoleSelectBuilder
    | StringSelectBuilder
    | TextInputBuilder
    | UserSelectBuilder;

export class ActionRowBuilder<T extends ComponentResolvable = ComponentResolvable> {
    private components: T[];

    public constructor() {
        this.components = [];
    }

    public static from<T extends ComponentResolvable>(components: T[]): ActionRowBuilder<T> {
        return new ActionRowBuilder<T>().setComponents(components);
    }

    public addComponents(...components: T[]): this {
        this.components.push(...components);
        return this;
    }

    public setComponents(components: T[]): this {
        this.components = components;
        return this;
    }

    public getComponents(): T[] {
        return this.components;
    }

    public toJSON() {
        return {
            type: ComponentTypes.ActionRow,
            components: this.components.map((component) => component.data),
        };
    }
}
