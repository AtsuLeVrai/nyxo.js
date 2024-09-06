import type {
    ActionRowStructure,
    ApplicationCommandDataStructure,
    ApplicationCommandInteractionDataOptionStructure,
    ApplicationCommandOptionChoiceStructure,
    ApplicationCommandOptionStructure,
    ApplicationCommandOptionTypes,
    ApplicationCommandPermissionsStructure,
    ApplicationCommandPermissionTypes,
    ApplicationCommandStructure,
    ApplicationCommandTypes,
    AutocompleteStructure,
    ButtonStructure,
    ButtonStyles,
    ChannelTypes,
    ComponentTypes,
    GuildApplicationCommandPermissionsStructure,
    IntegrationTypes,
    InteractionCallbackTypes,
    InteractionContextTypes,
    InteractionResponseStructure,
    InteractionStructure,
    InteractionTypes,
    MessageComponentDataStructure,
    MessageFlags,
    MessageInteractionStructure,
    MessageResponseStructure,
    ModalStructure,
    ModalSubmitDataStructure,
    ResolvedDataStructure,
    SelectDefaultValueStructure,
    SelectDefaultValueTypes,
    SelectMenuStructure,
    SelectOptionStructure,
    TextInputStructure,
    TextInputStyles,
} from "@nyxjs/api-types";
import type { Integer, Locales, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { TextChannel, ThreadChannel } from "./Channels";
import { Emoji } from "./Emojis";
import { Entitlement } from "./Entitlements";
import { Guild, GuildMember } from "./Guilds";
import { AllowedMentions, Attachment, Embed, Message } from "./Messages";
import { PollCreateRequest } from "./Polls";
import { Role } from "./Roles";
import { User } from "./Users";

export class TextInput extends Base<TextInputStructure> {
    public customId!: string;

    public label!: string;

    public max_length?: Integer;

    public min_length?: Integer;

    public placeholder?: string;

    public required?: boolean;

    public style!: TextInputStyles;

    public type!: ComponentTypes.TextInput;

    public value?: string;

    public constructor(data: Partial<TextInputStructure>) {
        super(data);
    }

    protected patch(data: Partial<TextInputStructure>): void {
        this.customId = data.custom_id ?? this.customId;
        this.label = data.label ?? this.label;

        if ("max_length" in data) {
            this.max_length = data.max_length;
        }

        if ("min_length" in data) {
            this.min_length = data.min_length;
        }

        if ("placeholder" in data) {
            this.placeholder = data.placeholder;
        }

        if ("required" in data) {
            this.required = data.required;
        }

        this.style = data.style ?? this.style;
        this.type = data.type ?? this.type;

        if ("value" in data) {
            this.value = data.value;
        }
    }
}

export class SelectDefaultValue extends Base<SelectDefaultValueStructure> {
    public id!: Snowflake;

    public type!: SelectDefaultValueTypes;

    public constructor(data: Partial<SelectDefaultValueStructure>) {
        super(data);
    }

    protected patch(data: Partial<SelectDefaultValueStructure>): void {
        this.id = data.id ?? this.id;
        this.type = data.type ?? this.type;
    }
}

export class SelectOption extends Base<SelectOptionStructure> {
    public default?: boolean;

    public description?: string;

    public emoji?: Pick<Emoji, "animated" | "id" | "name" | "toJSON">;

    public label!: string;

    public value!: string;

    public constructor(data: Partial<SelectOptionStructure>) {
        super(data);
    }

    protected patch(data: Partial<SelectOptionStructure>): void {
        if ("default" in data) {
            this.default = data.default;
        }

        if ("description" in data) {
            this.description = data.description;
        }

        if ("emoji" in data && data.emoji) {
            this.emoji = Emoji.from(data.emoji);
        }

        this.label = data.label ?? this.label;
        this.value = data.value ?? this.value;
    }
}

export class SelectMenu extends Base<SelectMenuStructure> {
    public channelTypes?: ChannelTypes[];

    public customId!: string;

    public defaultValues?: SelectDefaultValue[];

    public disabled?: boolean;

    public maxValues?: Integer;

    public minValues?: Integer;

    public options?: SelectOptionStructure[];

    public placeholder?: string;

    public type!:
        | ComponentTypes.ChannelSelect
        | ComponentTypes.MentionableSelect
        | ComponentTypes.RoleSelect
        | ComponentTypes.StringSelect
        | ComponentTypes.UserSelect;

    public constructor(data: Partial<SelectMenuStructure>) {
        super(data);
    }

    protected patch(data: Partial<SelectMenuStructure>): void {
        if ("channel_types" in data) {
            this.channelTypes = data.channel_types;
        }

        this.customId = data.custom_id ?? this.customId;

        if ("default_values" in data && data.default_values) {
            this.defaultValues = data.default_values.map((value) => SelectDefaultValue.from(value));
        }

        if ("disabled" in data) {
            this.disabled = data.disabled;
        }

        if ("max_values" in data) {
            this.maxValues = data.max_values;
        }

        if ("min_values" in data) {
            this.minValues = data.min_values;
        }

        if ("options" in data && data.options) {
            this.options = data.options.map((option) => SelectOption.from(option));
        }

        if ("placeholder" in data) {
            this.placeholder = data.placeholder;
        }

        this.type = data.type ?? this.type;
    }
}

export class Button extends Base<ButtonStructure> {
    public customId?: string;

    public disabled?: boolean;

    public emoji?: Pick<Emoji, "animated" | "id" | "name" | "toJSON">;

    public label?: string;

    public skuId?: Snowflake;

    public style!: ButtonStyles;

    public type!: ComponentTypes.Button;

    public url?: string;

    public constructor(data: Partial<ButtonStructure>) {
        super(data);
    }

    protected patch(data: Partial<ButtonStructure>): void {
        if ("custom_id" in data) {
            this.customId = data.custom_id;
        }

        if ("disabled" in data) {
            this.disabled = data.disabled;
        }

        if ("emoji" in data && data.emoji) {
            this.emoji = Emoji.from(data.emoji);
        }

        if ("label" in data) {
            this.label = data.label;
        }

        if ("sku_id" in data) {
            this.skuId = data.sku_id;
        }

        this.style = data.style ?? this.style;
        this.type = data.type ?? this.type;

        if ("url" in data) {
            this.url = data.url;
        }
    }
}

export class ApplicationCommandPermissions extends Base<ApplicationCommandPermissionsStructure> {
    public id!: Snowflake;

    public permission!: boolean;

    public type!: ApplicationCommandPermissionTypes;

    public constructor(data: Partial<ApplicationCommandPermissionsStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandPermissionsStructure>): void {
        this.id = data.id ?? this.id;
        this.permission = data.permission ?? this.permission;
        this.type = data.type ?? this.type;
    }
}

export class GuildApplicationCommandPermissions extends Base<GuildApplicationCommandPermissionsStructure> {
    public applicationId!: Snowflake;

    public guildId!: Snowflake;

    public id!: Snowflake;

    public permissions!: ApplicationCommandPermissions[];

    public constructor(data: Partial<GuildApplicationCommandPermissionsStructure>) {
        super(data);
    }

    protected patch(data: Partial<GuildApplicationCommandPermissionsStructure>): void {
        this.applicationId = data.application_id ?? this.applicationId;
        this.guildId = data.guild_id ?? this.guildId;
        this.id = data.id ?? this.id;
        this.permissions = data.permissions
            ? data.permissions.map((permission) => ApplicationCommandPermissions.from(permission))
            : this.permissions;
    }
}

export class ApplicationCommandOptionChoice extends Base<ApplicationCommandOptionChoiceStructure> {
    public name!: string;

    public nameLocalizations?: Record<Locales, string>;

    public value!: Integer | string;

    public constructor(data: Partial<ApplicationCommandOptionChoiceStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandOptionChoiceStructure>): void {
        this.name = data.name ?? this.name;

        if ("name_localizations" in data) {
            this.nameLocalizations = data.name_localizations;
        }

        this.value = data.value ?? this.value;
    }
}

export class ApplicationCommandOption extends Base<ApplicationCommandOptionStructure> {
    public autocomplete?: boolean;

    public channelTypes?: ChannelTypes[];

    public choices?: ApplicationCommandOptionChoiceStructure[];

    public description!: string;

    public descriptionLocalizations?: Record<Locales, string> | null;

    public maxLength?: Integer;

    public maxValue?: Integer;

    public minLength?: Integer;

    public minValue?: Integer;

    public name!: string;

    public nameLocalizations?: Record<Locales, string> | null;

    public options?: ApplicationCommandOptionStructure[];

    public required?: boolean;

    public type!: ApplicationCommandOptionTypes;

    public constructor(data: Partial<ApplicationCommandOptionStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandOptionStructure>): void {
        if ("autocomplete" in data) {
            this.autocomplete = data.autocomplete;
        }

        if ("channel_types" in data) {
            this.channelTypes = data.channel_types;
        }

        if ("choices" in data) {
            this.choices = data.choices
                ? data.choices.map((choice) => ApplicationCommandOptionChoice.from(choice))
                : this.choices;
        }

        this.description = data.description ?? this.description;

        if ("description_localizations" in data) {
            this.descriptionLocalizations = data.description_localizations;
        }

        if ("max_length" in data) {
            this.maxLength = data.max_length;
        }

        if ("max_value" in data) {
            this.maxValue = data.max_value;
        }

        if ("min_length" in data) {
            this.minLength = data.min_length;
        }

        if ("min_value" in data) {
            this.minValue = data.min_value;
        }

        this.name = data.name ?? this.name;

        if ("name_localizations" in data) {
            this.nameLocalizations = data.name_localizations;
        }

        if ("options" in data) {
            this.options = data.options
                ? data.options.map((option) => ApplicationCommandOption.from(option))
                : this.options;
        }

        if ("required" in data) {
            this.required = data.required;
        }

        this.type = data.type ?? this.type;
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

    public constructor(data: Partial<ApplicationCommandStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandStructure>): void {
        this.applicationId = data.application_id ?? this.applicationId;

        if ("contexts" in data) {
            this.contexts = data.contexts;
        }

        this.defaultMemberPermissions = data.default_member_permissions ?? this.defaultMemberPermissions;

        if ("default_permission" in data) {
            this.defaultPermission = data.default_permission;
        }

        this.description = data.description ?? this.description;

        if ("description_localizations" in data) {
            this.descriptionLocalizations = data.description_localizations;
        }

        if ("dm_permission" in data) {
            this.dmPermission = data.dm_permission;
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        this.id = data.id ?? this.id;

        if ("integration_types" in data) {
            this.integrationTypes = data.integration_types;
        }

        this.name = data.name ?? this.name;

        if ("name_localizations" in data) {
            this.nameLocalizations = data.name_localizations;
        }

        if ("nsfw" in data) {
            this.nsfw = data.nsfw;
        }

        if ("options" in data) {
            this.options = data.options
                ? data.options.map((option) => ApplicationCommandOption.from(option))
                : this.options;
        }

        if ("type" in data) {
            this.type = data.type;
        }

        this.version = data.version ?? this.version;
    }
}

export class ActionRow<
    T extends Button | SelectMenu | TextInput = Button | SelectMenu | TextInput,
> extends Base<ActionRowStructure> {
    public components!: T[];

    public type!: ComponentTypes.ActionRow;

    public constructor(data: Partial<ActionRowStructure>) {
        super(data);
    }

    protected patch(data: Partial<ActionRowStructure>): void {
        // TODO: Fix this
        // this.components = (
        //     data.components
        //         ? data.components.map((component) => {
        //               if (component.type === ComponentTypes.Button) {
        //                   return Button.from(component);
        //               } else if (component.type === ComponentTypes.SelectMenu) {
        //                   return SelectMenu.from(component);
        //               } else {
        //                   return TextInput.from(component);
        //               }
        //           })
        //         : this.components
        // ) as T[];
    }
}

export class Modal extends Base<ModalStructure> {
    public components!: ActionRow<TextInput>[];

    public customId!: string;

    public title!: string;

    public constructor(data: Partial<ModalStructure>) {
        super(data);
    }

    protected patch(data: Partial<ModalStructure>): void {
        this.components = (
            data.components ? data.components.map((component) => ActionRow.from(component)) : this.components
        ) as ActionRow<TextInput>[];

        this.customId = data.custom_id ?? this.customId;
        this.title = data.title ?? this.title;
    }
}

export class Autocomplete extends Base<AutocompleteStructure> {
    public choices!: ApplicationCommandOptionChoice[];

    public constructor(data: Partial<AutocompleteStructure>) {
        super(data);
    }

    protected patch(data: Partial<AutocompleteStructure>): void {
        this.choices = data.choices
            ? data.choices.map((choice) => ApplicationCommandOptionChoice.from(choice))
            : this.choices;
    }
}

export class MessageResponse extends Base<MessageResponseStructure> {
    public allowedMentions?: AllowedMentions;

    public attachments?: Pick<Attachment, "description" | "filename">[];

    public components?: ActionRow[];

    public content?: string;

    public embeds?: Embed[];

    public flags?: MessageFlags;

    public poll?: PollCreateRequest;

    public tts?: boolean;

    public constructor(data: Partial<MessageResponseStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageResponseStructure>): void {
        if ("allowed_mentions" in data && data.allowed_mentions) {
            this.allowedMentions = AllowedMentions.from(data.allowed_mentions);
        }

        if ("attachments" in data && data.attachments) {
            this.attachments = data.attachments.map((attachment) => Attachment.from(attachment));
        }

        if ("components" in data) {
            this.components = data.components
                ? data.components.map((component) => ActionRow.from(component))
                : this.components;
        }

        if ("content" in data) {
            this.content = data.content;
        }

        if ("embeds" in data && data.embeds) {
            this.embeds = data.embeds.map((embed) => Embed.from(embed));
        }

        if ("flags" in data) {
            this.flags = data.flags;
        }

        if ("poll" in data && data.poll) {
            this.poll = PollCreateRequest.from(data.poll);
        }

        if ("tts" in data) {
            this.tts = data.tts;
        }
    }
}

export class InteractionResponse extends Base<InteractionResponseStructure> {
    public data?: Autocomplete | MessageResponse | Modal;

    public type!: InteractionCallbackTypes;

    public constructor(data: Partial<InteractionResponseStructure>) {
        super(data);
    }

    protected patch(data: Partial<InteractionResponseStructure>): void {
        // TODO: Fix this
        // if ("data" in data) {
        //     if (data.data instanceof Autocomplete) {
        //         this.data = Autocomplete.from(data.data);
        //     } else if (data.data instanceof MessageResponse) {
        //         this.data = MessageResponse.from(data.data);
        //     } else if (data.data instanceof Modal) {
        //         this.data = Modal.from(data.data);
        //     }
        // }

        this.type = data.type ?? this.type;
    }
}

export class MessageInteraction extends Base<MessageInteractionStructure> {
    public id!: Snowflake;

    public member?: Partial<GuildMember>;

    public name!: string;

    public type!: InteractionTypes;

    public user!: User;

    public constructor(data: Partial<MessageInteractionStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageInteractionStructure>): void {
        this.id = data.id ?? this.id;

        if ("member" in data && data.member) {
            this.member = GuildMember.from(data.member);
        }

        this.name = data.name ?? this.name;
        this.type = data.type ?? this.type;
        this.user = data.user ? User.from(data.user) : this.user;
    }
}

export class ApplicationCommandInteractionDataOption extends Base<ApplicationCommandInteractionDataOptionStructure> {
    public focused?: boolean;

    public name!: string;

    public options?: ApplicationCommandInteractionDataOption[];

    public type!: ApplicationCommandOptionTypes;

    public value?: Integer | boolean | string;

    public constructor(data: Partial<ApplicationCommandInteractionDataOptionStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandInteractionDataOptionStructure>): void {
        if ("focused" in data) {
            this.focused = data.focused;
        }

        this.name = data.name ?? this.name;

        if ("options" in data) {
            this.options = data.options
                ? data.options.map((option) => ApplicationCommandInteractionDataOption.from(option))
                : this.options;
        }

        this.type = data.type ?? this.type;

        if ("value" in data) {
            this.value = data.value;
        }
    }
}

export class ResolvedData extends Base<ResolvedDataStructure> {
    public attachments?: Map<Snowflake, Attachment>;

    public channels?: Map<
        Snowflake,
        Pick<ThreadChannel, "id" | "name" | "parentId" | "permissions" | "threadMetadata" | "type">
    >;

    public members?: Map<Snowflake, Omit<GuildMember, "deaf" | "mute" | "user">>;

    public messages?: Map<Snowflake, Partial<Message>>;

    public roles?: Map<Snowflake, Role>;

    public users?: Map<Snowflake, User>;

    public constructor(data: Partial<ResolvedDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<ResolvedDataStructure>): void {
        if ("attachments" in data && data.attachments) {
            this.attachments = new Map(
                Object.entries(data.attachments).map(([key, value]) => [key, Attachment.from(value)])
            );
        }

        if ("channels" in data && data.channels) {
            this.channels = new Map(
                Object.entries(data.channels).map(([key, value]) => [key, ThreadChannel.from(value)])
            );
        }

        if ("members" in data && data.members) {
            this.members = new Map(Object.entries(data.members).map(([key, value]) => [key, GuildMember.from(value)]));
        }

        if ("messages" in data && data.messages) {
            this.messages = new Map(Object.entries(data.messages).map(([key, value]) => [key, Message.from(value)]));
        }

        if ("roles" in data && data.roles) {
            this.roles = new Map(Object.entries(data.roles).map(([key, value]) => [key, Role.from(value)]));
        }

        if ("users" in data && data.users) {
            this.users = new Map(Object.entries(data.users).map(([key, value]) => [key, User.from(value)]));
        }
    }
}

export class ModalSubmitData extends Base<ModalSubmitDataStructure> {
    public components!: ActionRow<TextInput>[];

    public customId!: string;

    public constructor(data: Partial<ModalSubmitDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<ModalSubmitDataStructure>): void {
        this.components = (
            data.components ? data.components.map((component) => ActionRow.from(component)) : this.components
        ) as ActionRow<TextInput>[];

        this.customId = data.custom_id ?? this.customId;
    }
}

export class MessageComponentData extends Base<MessageComponentDataStructure> {
    public componentType!: ComponentTypes;

    public customId!: string;

    public resolved?: ResolvedData;

    public values?: SelectOption[];

    public constructor(data: Partial<MessageComponentDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<MessageComponentDataStructure>): void {
        this.componentType = data.component_type ?? this.componentType;
        this.customId = data.custom_id ?? this.customId;

        if ("resolved" in data && data.resolved) {
            this.resolved = ResolvedData.from(data.resolved);
        }

        if ("values" in data && data.values) {
            this.values = data.values.map((value) => SelectOption.from(value));
        }
    }
}

export class ApplicationCommandData extends Base<ApplicationCommandDataStructure> {
    public guildId?: Snowflake;

    public id!: Snowflake;

    public name!: string;

    public options?: ApplicationCommandInteractionDataOption[];

    public resolved?: ResolvedData;

    public targetId?: Snowflake;

    public type!: InteractionTypes;

    public constructor(data: Partial<ApplicationCommandDataStructure>) {
        super(data);
    }

    protected patch(data: Partial<ApplicationCommandDataStructure>): void {
        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;

        if ("options" in data && data.options) {
            this.options = data.options.map((option) => ApplicationCommandInteractionDataOption.from(option));
        }

        if ("resolved" in data && data.resolved) {
            this.resolved = ResolvedData.from(data.resolved);
        }

        if ("target_id" in data) {
            this.targetId = data.target_id;
        }

        this.type = data.type ?? this.type;
    }
}

export class Interaction extends Base<InteractionStructure> {
    public appPermissions?: string;

    public applicationId!: Snowflake;

    public authorizingIntegrationOwners?: Record<IntegrationTypes, Snowflake>;

    public channel?: Partial<TextChannel>;

    public channelId?: Snowflake;

    public context?: InteractionContextTypes;

    public data?:
        | ApplicationCommandData
        | ApplicationCommandInteractionDataOption
        | MessageComponentData
        | ModalSubmitData
        | ResolvedData;

    public entitlements?: Entitlement[];

    public guild?: Partial<Guild>;

    public guildId?: Snowflake;

    public guildLocale?: Locales;

    public id!: Snowflake;

    public locale?: Locales;

    public member?: Partial<GuildMember>;

    public message?: Partial<Message>;

    public token!: string;

    public type!: InteractionTypes;

    public user?: User;

    public version!: 1;

    public constructor(data: Partial<InteractionStructure>) {
        super(data);
    }

    protected patch(data: Partial<InteractionStructure>): void {
        if ("app_permissions" in data) {
            this.appPermissions = data.app_permissions;
        }

        this.applicationId = data.application_id ?? this.applicationId;

        if ("authorizing_integration_owners" in data) {
            this.authorizingIntegrationOwners = data.authorizing_integration_owners;
        }

        if ("channel" in data && data.channel) {
            this.channel = TextChannel.from(data.channel);
        }

        if ("channel_id" in data) {
            this.channelId = data.channel_id;
        }

        if ("context" in data) {
            this.context = data.context;
        }

        // TODO: Fix this
        // if ("data" in data) {
        //     if (data.data instanceof ApplicationCommandData) {
        //         this.data = ApplicationCommandData.from(data.data);
        //     } else if (data.data instanceof ApplicationCommandInteractionDataOption) {
        //         this.data = ApplicationCommandInteractionDataOption.from(data.data);
        //     } else if (data.data instanceof MessageComponentData) {
        //         this.data = MessageComponentData.from(data.data);
        //     } else if (data.data instanceof ModalSubmitData) {
        //         this.data = ModalSubmitData.from(data.data);
        //     } else {
        //         this.data = ResolvedData.from(data.data);
        //     }
        // }

        if ("entitlements" in data && data.entitlements) {
            this.entitlements = data.entitlements.map((entitlement) => Entitlement.from(entitlement));
        }

        if ("guild" in data && data.guild) {
            this.guild = Guild.from(data.guild);
        }

        if ("guild_id" in data) {
            this.guildId = data.guild_id;
        }

        if ("guild_locale" in data) {
            this.guildLocale = data.guild_locale;
        }

        if ("id" in data && data.id) {
            this.id = data.id;
        }

        if ("locale" in data) {
            this.locale = data.locale;
        }

        if ("member" in data && data.member) {
            this.member = GuildMember.from(data.member);
        }

        if ("message" in data && data.message) {
            this.message = Message.from(data.message);
        }

        this.token = data.token ?? this.token;
        this.type = data.type ?? this.type;

        if ("user" in data && data.user) {
            this.user = User.from(data.user);
        }

        this.version = 1;
    }
}

export {
    TextInputStyles,
    SelectDefaultValueTypes,
    ButtonStyles,
    ComponentTypes,
    ApplicationCommandPermissionTypes,
    ApplicationCommandOptionTypes,
    ApplicationCommandTypes,
    InteractionCallbackTypes,
    InteractionContextTypes,
    InteractionTypes,
} from "@nyxjs/api-types";
