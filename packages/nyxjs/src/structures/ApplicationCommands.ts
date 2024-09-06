import type {
    ApplicationCommandOptionChoiceStructure,
    ApplicationCommandOptionStructure,
    ApplicationCommandOptionTypes,
    ApplicationCommandPermissionsStructure,
    ApplicationCommandPermissionTypes,
    ApplicationCommandStructure,
    ApplicationCommandTypes,
    ChannelTypes,
    GuildApplicationCommandPermissionsStructure,
    IntegrationTypes,
    InteractionContextTypes,
} from "@nyxjs/api-types";
import type { Integer, Locales, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";

export class ApplicationCommandPermissions extends Base<ApplicationCommandPermissionsStructure> {
    public id!: Snowflake;

    public permission!: boolean;

    public type!: ApplicationCommandPermissionTypes;

    public constructor(data: Readonly<Partial<ApplicationCommandPermissionsStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandPermissionsStructure>>): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.permission !== undefined) {
            this.permission = data.permission;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class GuildApplicationCommandPermissions extends Base<GuildApplicationCommandPermissionsStructure> {
    public applicationId!: Snowflake;

    public guildId!: Snowflake;

    public id!: Snowflake;

    public permissions!: ApplicationCommandPermissions[];

    public constructor(data: Readonly<Partial<GuildApplicationCommandPermissionsStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildApplicationCommandPermissionsStructure>>): void {
        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.permissions !== undefined) {
            this.permissions = data.permissions.map((permission) => ApplicationCommandPermissions.from(permission));
        }
    }
}

export class ApplicationCommandOptionChoice extends Base<ApplicationCommandOptionChoiceStructure> {
    public name!: string;

    public nameLocalizations?: Record<Locales, string>;

    public value!: Integer | string;

    public constructor(data: Readonly<Partial<ApplicationCommandOptionChoiceStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandOptionChoiceStructure>>): void {
        this.name = data.name ?? this.name;

        if ("name_localizations" in data) {
            if (data.name_localizations === null) {
                this.nameLocalizations = undefined;
            } else if (data.name_localizations !== undefined) {
                this.nameLocalizations = data.name_localizations;
            }
        }

        this.value = data.value ?? this.value;
    }
}

export class ApplicationCommandOption extends Base<ApplicationCommandOptionStructure> {
    public autocomplete?: boolean;

    public channelTypes?: ChannelTypes[];

    public choices?: ApplicationCommandOptionChoice[];

    public description!: string;

    public descriptionLocalizations?: Record<Locales, string> | null;

    public maxLength?: Integer;

    public maxValue?: Integer;

    public minLength?: Integer;

    public minValue?: Integer;

    public name!: string;

    public nameLocalizations?: Record<Locales, string> | null;

    public options?: ApplicationCommandOption[];

    public required?: boolean;

    public type!: ApplicationCommandOptionTypes;

    public constructor(data: Readonly<Partial<ApplicationCommandOptionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandOptionStructure>>): void {
        if ("autocomplete" in data) {
            if (data.autocomplete === null) {
                this.autocomplete = undefined;
            } else if (data.autocomplete !== undefined) {
                this.autocomplete = data.autocomplete;
            }
        }

        if ("channel_types" in data) {
            if (data.channel_types === null) {
                this.channelTypes = undefined;
            } else if (data.channel_types !== undefined) {
                this.channelTypes = data.channel_types;
            }
        }

        if ("choices" in data) {
            if (data.choices === null) {
                this.choices = undefined;
            } else if (data.choices !== undefined) {
                this.choices = data.choices.map((choice) => ApplicationCommandOptionChoice.from(choice));
            }
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if ("description_localizations" in data) {
            if (data.description_localizations === null) {
                this.descriptionLocalizations = undefined;
            } else if (data.description_localizations !== undefined) {
                this.descriptionLocalizations = data.description_localizations;
            }
        }

        if ("max_length" in data) {
            if (data.max_length === null) {
                this.maxLength = undefined;
            } else if (data.max_length !== undefined) {
                this.maxLength = data.max_length;
            }
        }

        if ("max_value" in data) {
            if (data.max_value === null) {
                this.maxValue = undefined;
            } else if (data.max_value !== undefined) {
                this.maxValue = data.max_value;
            }
        }

        if ("min_length" in data) {
            if (data.min_length === null) {
                this.minLength = undefined;
            } else if (data.min_length !== undefined) {
                this.minLength = data.min_length;
            }
        }

        if ("min_value" in data) {
            if (data.min_value === null) {
                this.minValue = undefined;
            } else if (data.min_value !== undefined) {
                this.minValue = data.min_value;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("name_localizations" in data) {
            if (data.name_localizations === null) {
                this.nameLocalizations = undefined;
            } else if (data.name_localizations !== undefined) {
                this.nameLocalizations = data.name_localizations;
            }
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = data.options.map((option) => ApplicationCommandOption.from(option));
            }
        }

        if ("required" in data) {
            if (data.required === null) {
                this.required = undefined;
            } else if (data.required !== undefined) {
                this.required = data.required;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class ApplicationCommand extends Base<ApplicationCommandStructure> {
    public applicationId!: Snowflake;

    public contexts?: InteractionContextTypes[] | null;

    public defaultMemberPermissions!: string | null;

    public defaultPermission?: boolean | null;

    public description!: string;

    public descriptionLocalizations?: Record<Locales, string> | null;

    /**
     * @deprecated Deprecated and will be removed in a future version
     */
    public dmPermission?: boolean;

    public guildId?: Snowflake;

    public id!: Snowflake;

    public integrationTypes?: IntegrationTypes[];

    public name!: string;

    public nameLocalizations?: Record<Locales, string> | null;

    public nsfw?: boolean;

    public options?: ApplicationCommandOption[];

    public type?: ApplicationCommandTypes;

    public version!: Snowflake;

    public constructor(data: Readonly<Partial<ApplicationCommandStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandStructure>>): void {
        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if ("contexts" in data) {
            if (data.contexts === null) {
                this.contexts = undefined;
            } else if (data.contexts !== undefined) {
                this.contexts = data.contexts;
            }
        }

        if (data.default_member_permissions !== undefined) {
            this.defaultMemberPermissions = data.default_member_permissions;
        }

        if ("default_permission" in data) {
            if (data.default_permission === null) {
                this.defaultPermission = undefined;
            } else if (data.default_permission !== undefined) {
                this.defaultPermission = data.default_permission;
            }
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if ("description_localizations" in data) {
            if (data.description_localizations === null) {
                this.descriptionLocalizations = undefined;
            } else if (data.description_localizations !== undefined) {
                this.descriptionLocalizations = data.description_localizations;
            }
        }

        if ("dm_permission" in data) {
            if (data.dm_permission === null) {
                this.dmPermission = undefined;
            } else if (data.dm_permission !== undefined) {
                this.dmPermission = data.dm_permission;
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else {
                this.guildId = data.guild_id;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("integration_types" in data) {
            if (data.integration_types === null) {
                this.integrationTypes = undefined;
            } else if (data.integration_types !== undefined) {
                this.integrationTypes = data.integration_types;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("name_localizations" in data) {
            if (data.name_localizations === null) {
                this.nameLocalizations = undefined;
            } else if (data.name_localizations !== undefined) {
                this.nameLocalizations = data.name_localizations;
            }
        }

        if ("nsfw" in data) {
            if (data.nsfw === null) {
                this.nsfw = undefined;
            } else if (data.nsfw !== undefined) {
                this.nsfw = data.nsfw;
            }
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = data.options.map((option) => ApplicationCommandOption.from(option));
            }
        }

        if ("type" in data) {
            if (data.type === null) {
                this.type = undefined;
            } else if (data.type !== undefined) {
                this.type = data.type;
            }
        }

        if (data.version !== undefined) {
            this.version = data.version;
        }
    }
}

export {
    ApplicationCommandOptionTypes,
    ApplicationCommandPermissionTypes,
    ApplicationCommandTypes,
    ChannelTypes,
    IntegrationTypes,
    InteractionContextTypes,
} from "@nyxjs/api-types";
