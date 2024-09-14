import type {
    ActionRowStructure,
    ApplicationCommandDataStructure,
    ApplicationCommandInteractionDataOptionStructure,
    ApplicationCommandOptionTypes,
    AutocompleteStructure,
    ComponentTypes,
    Integer,
    IntegrationTypes,
    InteractionCallbackTypes,
    InteractionContextTypes,
    InteractionResponseStructure,
    InteractionStructure,
    InteractionTypes,
    Locales,
    MessageComponentDataStructure,
    MessageFlags,
    MessageInteractionStructure,
    MessageResponseStructure,
    ModalStructure,
    ModalSubmitDataStructure,
    ResolvedDataStructure,
    Snowflake,
} from "@nyxjs/core";
import { ApplicationCommandOptionChoice } from "./ApplicationCommands";
import { Base } from "./Base";
import { TextChannel, ThreadChannel } from "./Channels";
import { Embed } from "./Embed";
import { Entitlement } from "./Entitlements";
import { Guild, GuildMember } from "./Guilds";
import type { Button, SelectMenu, TextInput } from "./MessageComponents";
import { SelectOption } from "./MessageComponents";
import { AllowedMentions, Attachment, Message } from "./Messages";
import { PollCreateRequest } from "./Polls";
import { Role } from "./Roles";
import { User } from "./Users";

export class ActionRow<
    T extends Button | SelectMenu | TextInput = Button | SelectMenu | TextInput,
> extends Base<ActionRowStructure> {
    public components!: T[];

    public type!: ComponentTypes.ActionRow;

    public constructor(data: Readonly<Partial<ActionRowStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ActionRowStructure>>): void {
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

    public constructor(data: Readonly<Partial<ModalStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ModalStructure>>): void {
        if (data.components !== undefined) {
            this.components = data.components.map((component) => new ActionRow<TextInput>(component));
        }

        if (data.custom_id !== undefined) {
            this.customId = data.custom_id;
        }

        if (data.title !== undefined) {
            this.title = data.title;
        }
    }
}

export class Autocomplete extends Base<AutocompleteStructure> {
    public choices!: ApplicationCommandOptionChoice[];

    public constructor(data: Readonly<Partial<AutocompleteStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AutocompleteStructure>>): void {
        if (data.choices !== undefined) {
            this.choices = data.choices.map((choice) => ApplicationCommandOptionChoice.from(choice));
        }
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

    public constructor(data: Readonly<Partial<MessageResponseStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageResponseStructure>>): void {
        if ("allowed_mentions" in data) {
            if (data.allowed_mentions === null) {
                this.allowedMentions = undefined;
            } else if (data.allowed_mentions !== undefined) {
                this.allowedMentions = AllowedMentions.from(data.allowed_mentions);
            }
        }

        if ("attachments" in data) {
            if (data.attachments === null) {
                this.attachments = undefined;
            } else if (data.attachments !== undefined) {
                this.attachments = data.attachments.map((attachment) => Attachment.from(attachment));
            }
        }

        if ("components" in data) {
            if (data.components === null) {
                this.components = undefined;
            } else if (data.components !== undefined) {
                this.components = data.components.map((component) => new ActionRow(component));
            }
        }

        if ("content" in data) {
            if (data.content === null) {
                this.content = undefined;
            } else if (data.content !== undefined) {
                this.content = data.content;
            }
        }

        if ("embeds" in data) {
            if (data.embeds === null) {
                this.embeds = undefined;
            } else if (data.embeds !== undefined) {
                this.embeds = data.embeds.map((embed) => Embed.from(embed));
            }
        }

        if ("flags" in data) {
            if (data.flags === null) {
                this.flags = undefined;
            } else if (data.flags !== undefined) {
                this.flags = data.flags;
            }
        }

        if ("poll" in data) {
            if (data.poll === null) {
                this.poll = undefined;
            } else if (data.poll !== undefined) {
                this.poll = PollCreateRequest.from(data.poll);
            }
        }

        if ("tts" in data) {
            if (data.tts === null) {
                this.tts = undefined;
            } else if (data.tts !== undefined) {
                this.tts = data.tts;
            }
        }
    }
}

export class InteractionResponse extends Base<InteractionResponseStructure> {
    public data?: Autocomplete | MessageResponse | Modal;

    public type!: InteractionCallbackTypes;

    public constructor(data: Readonly<Partial<InteractionResponseStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<InteractionResponseStructure>>): void {
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

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class MessageInteraction extends Base<MessageInteractionStructure> {
    public id!: Snowflake;

    public member?: Partial<GuildMember>;

    public name!: string;

    public type!: InteractionTypes;

    public user!: User;

    public constructor(data: Readonly<Partial<MessageInteractionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageInteractionStructure>>): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("member" in data) {
            if (data.member === null) {
                this.member = undefined;
            } else if (data.member !== undefined) {
                this.member = GuildMember.from(data.member);
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if (data.user !== undefined) {
            this.user = User.from(data.user);
        }
    }
}

export class ApplicationCommandInteractionDataOption extends Base<ApplicationCommandInteractionDataOptionStructure> {
    public focused?: boolean;

    public name!: string;

    public options?: ApplicationCommandInteractionDataOption[];

    public type!: ApplicationCommandOptionTypes;

    public value?: Integer | boolean | string;

    public constructor(data: Readonly<Partial<ApplicationCommandInteractionDataOptionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandInteractionDataOptionStructure>>): void {
        if ("focused" in data) {
            if (data.focused === null) {
                this.focused = undefined;
            } else if (data.focused !== undefined) {
                this.focused = data.focused;
            }
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = data.options.map((option) => ApplicationCommandInteractionDataOption.from(option));
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("value" in data) {
            if (data.value === null) {
                this.value = undefined;
            } else if (data.value !== undefined) {
                this.value = data.value;
            }
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

    public constructor(data: Readonly<Partial<ResolvedDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ResolvedDataStructure>>): void {
        if ("attachments" in data) {
            if (data.attachments === null) {
                this.attachments = undefined;
            } else if (data.attachments !== undefined) {
                this.attachments = new Map(
                    Object.entries(data.attachments).map(([key, value]) => [key, Attachment.from(value)])
                );
            }
        }

        if ("channels" in data) {
            if (data.channels === null) {
                this.channels = undefined;
            } else if (data.channels !== undefined) {
                this.channels = new Map(
                    Object.entries(data.channels).map(([key, value]) => [key, ThreadChannel.from(value)])
                );
            }
        }

        if ("members" in data) {
            if (data.members === null) {
                this.members = undefined;
            } else if (data.members !== undefined) {
                this.members = new Map(
                    Object.entries(data.members).map(([key, value]) => [key, GuildMember.from(value)])
                );
            }
        }

        if ("messages" in data) {
            if (data.messages === null) {
                this.messages = undefined;
            } else if (data.messages !== undefined) {
                this.messages = new Map(
                    Object.entries(data.messages).map(([key, value]) => [key, Message.from(value)])
                );
            }
        }

        if ("roles" in data) {
            if (data.roles === null) {
                this.roles = undefined;
            } else if (data.roles !== undefined) {
                this.roles = new Map(Object.entries(data.roles).map(([key, value]) => [key, Role.from(value)]));
            }
        }

        if ("users" in data) {
            if (data.users === null) {
                this.users = undefined;
            } else if (data.users !== undefined) {
                this.users = new Map(Object.entries(data.users).map(([key, value]) => [key, User.from(value)]));
            }
        }
    }
}

export class ModalSubmitData extends Base<ModalSubmitDataStructure> {
    public components!: ActionRow<TextInput>[];

    public customId!: string;

    public constructor(data: Readonly<Partial<ModalSubmitDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ModalSubmitDataStructure>>): void {
        if (data.components !== undefined) {
            this.components = data.components.map((component) => new ActionRow<TextInput>(component));
        }

        if (data.custom_id !== undefined) {
            this.customId = data.custom_id;
        }
    }
}

export class MessageComponentData extends Base<MessageComponentDataStructure> {
    public componentType!: ComponentTypes;

    public customId!: string;

    public resolved?: ResolvedData;

    public values?: SelectOption[];

    public constructor(data: Readonly<Partial<MessageComponentDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<MessageComponentDataStructure>>): void {
        if (data.component_type !== undefined) {
            this.componentType = data.component_type;
        }

        if (data.custom_id !== undefined) {
            this.customId = data.custom_id;
        }

        if ("resolved" in data) {
            if (data.resolved === null) {
                this.resolved = undefined;
            } else if (data.resolved !== undefined) {
                this.resolved = ResolvedData.from(data.resolved);
            }
        }

        if ("values" in data) {
            if (data.values === null) {
                this.values = undefined;
            } else if (data.values !== undefined) {
                this.values = data.values.map((value) => SelectOption.from(value));
            }
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

    public constructor(data: Readonly<Partial<ApplicationCommandDataStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ApplicationCommandDataStructure>>): void {
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

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = data.options.map((option) => ApplicationCommandInteractionDataOption.from(option));
            }
        }

        if ("resolved" in data) {
            if (data.resolved === null) {
                this.resolved = undefined;
            } else if (data.resolved !== undefined) {
                this.resolved = ResolvedData.from(data.resolved);
            }
        }

        if ("target_id" in data) {
            if (data.target_id === null) {
                this.targetId = undefined;
            } else {
                this.targetId = data.target_id;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
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

    public constructor(data: Readonly<Partial<InteractionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<InteractionStructure>>): void {
        if ("app_permissions" in data) {
            if (data.app_permissions === null) {
                this.appPermissions = undefined;
            } else if (data.app_permissions !== undefined) {
                this.appPermissions = data.app_permissions;
            }
        }

        if (data.application_id !== undefined) {
            this.applicationId = data.application_id;
        }

        if ("authorizing_integration_owners" in data) {
            if (data.authorizing_integration_owners === null) {
                this.authorizingIntegrationOwners = undefined;
            } else if (data.authorizing_integration_owners !== undefined) {
                this.authorizingIntegrationOwners = data.authorizing_integration_owners;
            }
        }

        if ("channel" in data) {
            if (data.channel === null) {
                this.channel = undefined;
            } else if (data.channel !== undefined) {
                this.channel = TextChannel.from(data.channel);
            }
        }

        if ("channel_id" in data) {
            if (data.channel_id === null) {
                this.channelId = undefined;
            } else {
                this.channelId = data.channel_id;
            }
        }

        if ("context" in data) {
            if (data.context === null) {
                this.context = undefined;
            } else if (data.context !== undefined) {
                this.context = data.context;
            }
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
        //     } else if (data.data instanceof ResolvedData) {
        //         this.data = ResolvedData.from(data.data);
        //     }
        // }

        if ("entitlements" in data) {
            if (data.entitlements === null) {
                this.entitlements = undefined;
            } else if (data.entitlements !== undefined) {
                this.entitlements = data.entitlements.map((entitlement) => Entitlement.from(entitlement));
            }
        }

        if ("guild" in data) {
            if (data.guild === null) {
                this.guild = undefined;
            } else if (data.guild !== undefined) {
                this.guild = Guild.from(data.guild);
            }
        }

        if ("guild_id" in data) {
            if (data.guild_id === null) {
                this.guildId = undefined;
            } else {
                this.guildId = data.guild_id;
            }
        }

        if ("guild_locale" in data) {
            if (data.guild_locale === null) {
                this.guildLocale = undefined;
            } else if (data.guild_locale !== undefined) {
                this.guildLocale = data.guild_locale;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("locale" in data) {
            if (data.locale === null) {
                this.locale = undefined;
            } else if (data.locale !== undefined) {
                this.locale = data.locale;
            }
        }

        if ("member" in data) {
            if (data.member === null) {
                this.member = undefined;
            } else if (data.member !== undefined) {
                this.member = GuildMember.from(data.member);
            }
        }

        if ("message" in data) {
            if (data.message === null) {
                this.message = undefined;
            } else if (data.message !== undefined) {
                this.message = Message.from(data.message);
            }
        }

        if (data.token !== undefined) {
            this.token = data.token;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = User.from(data.user);
            }
        }

        if (data.version !== undefined) {
            this.version = data.version;
        }
    }
}
