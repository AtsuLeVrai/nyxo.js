import type {
    GuildOnboardingStructure,
    OnboardingMode,
    OnboardingPromptStructure,
    PromptOptionStructure,
    PromptTypes,
    Snowflake,
} from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Base } from "./Base";
import { Emoji } from "./Emojis";

export class PromptOption extends Base<PromptOptionStructure> {
    public channelIds!: Snowflake[];

    public description!: string | null;

    public emoji?: PickWithPublicMethods<Emoji, "animated" | "id" | "name">;

    public id!: Snowflake;

    public roleIds!: Snowflake[];

    public title!: string;

    public constructor(data: Readonly<Partial<PromptOptionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PromptOptionStructure>>): void {
        if (data.channel_ids !== undefined) {
            this.channelIds = data.channel_ids;
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if ("emoji" in data && data.emoji) {
            if (data.emoji === null) {
                this.emoji = undefined;
            } else if (data.emoji.id !== undefined) {
                this.emoji = Emoji.from(data.emoji);
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.role_ids !== undefined) {
            this.roleIds = data.role_ids;
        }

        if (data.title !== undefined) {
            this.title = data.title;
        }
    }
}

export class OnboardingPrompt extends Base<OnboardingPromptStructure> {
    public id!: Snowflake;

    public inOnboarding!: boolean;

    public options!: PromptOption[];

    public required!: boolean;

    public singleSelect!: boolean;

    public title!: string;

    public type!: PromptTypes;

    public constructor(data: Readonly<Partial<OnboardingPromptStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<OnboardingPromptStructure>>): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.in_onboarding !== undefined) {
            this.inOnboarding = data.in_onboarding;
        }

        if (data.options !== undefined) {
            this.options = data.options.map((option) => PromptOption.from(option));
        }

        if (data.required !== undefined) {
            this.required = data.required;
        }

        if (data.single_select !== undefined) {
            this.singleSelect = data.single_select;
        }

        if (data.title !== undefined) {
            this.title = data.title;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class GuildOnboarding extends Base<GuildOnboardingStructure> {
    public defaultChannelIds!: Snowflake[];

    public enabled!: boolean;

    public guildId!: Snowflake;

    public mode!: OnboardingMode;

    public prompts!: OnboardingPrompt[];

    public constructor(data: Readonly<Partial<GuildOnboardingStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildOnboardingStructure>>): void {
        if (data.default_channel_ids !== undefined) {
            this.defaultChannelIds = data.default_channel_ids;
        }

        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }

        if (data.guild_id !== undefined) {
            this.guildId = data.guild_id;
        }

        if (data.mode !== undefined) {
            this.mode = data.mode;
        }

        if (data.prompts !== undefined) {
            this.prompts = data.prompts.map((prompt) => OnboardingPrompt.from(prompt));
        }
    }
}

export { OnboardingMode, PromptTypes } from "@nyxjs/core";
