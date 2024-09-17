import type { LocalesKeys } from "@nyxjs/core";
import { ApplicationCommandTypes } from "@nyxjs/core";
import type { CreateGlobalApplicationCommandJSONParams } from "@nyxjs/rest";

const DEFAULT_VALUES: CreateGlobalApplicationCommandJSONParams = {
    name: "",
    type: ApplicationCommandTypes.ChatInput,
};

export class SlashCommandBuilder {
    public constructor(private readonly data: CreateGlobalApplicationCommandJSONParams = DEFAULT_VALUES) {}

    public setName(name: string): this {
        this.data.name = name;
        return this;
    }

    public setNameLocalizations(options: Record<LocalesKeys, string>): this {
        this.data.name_localizations = options;
        return this;
    }

    public setDescription(description: string): this {
        this.data.description = description;
        return this;
    }

    public setDescriptionLocalizations(options: Record<LocalesKeys, string>): this {
        this.data.description_localizations = options;
        return this;
    }

    public options(options: CreateGlobalApplicationCommandJSONParams["options"]): this {
        this.data.options = options;
        return this;
    }

    public defaultPermission(permissions: boolean): this {
        this.data.default_permission = permissions;
        return this;
    }

    public setIntegrationTypes(type: CreateGlobalApplicationCommandJSONParams["integration_types"]): this {
        this.data.integration_types = type;
        return this;
    }

    public setContexts(contexts: CreateGlobalApplicationCommandJSONParams["contexts"]): this {
        this.data.contexts = contexts;
        return this;
    }

    public setType(type: ApplicationCommandTypes): this {
        this.data.type = type;
        return this;
    }

    public setNsfw(nsfw: boolean): this {
        this.data.nsfw = nsfw;
        return this;
    }

    public toJSON(): CreateGlobalApplicationCommandJSONParams {
        return this.data;
    }
}
