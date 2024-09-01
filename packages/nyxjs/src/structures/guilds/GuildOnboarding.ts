import type { Snowflake } from "@nyxjs/core";
import type {
	GuildOnboardingStructure,
	OnboardingMode,
	OnboardingPromptStructure,
	PromptOptionStructure,
	PromptTypes,
} from "@nyxjs/rest";
import { Base } from "../Base";
import { Emoji } from "../Emojis";

export class PromptOption extends Base<PromptOptionStructure> {
	public channelIds!: Snowflake[];

	public description!: string | null;

	public emoji?: Pick<Emoji, "id" | "animated" | "name" | "toJSON">;

	public id!: Snowflake;

	public roleIds!: Snowflake[];

	public title!: string;

	public constructor(data: Partial<PromptOptionStructure>) {
		super(data);
	}

	public toJSON(): PromptOptionStructure {
		return {
			channel_ids: this.channelIds,
			description: this.description,
			emoji: this.emoji?.toJSON(),
			id: this.id,
			role_ids: this.roleIds,
			title: this.title,
		};
	}

	protected patch(data: Partial<PromptOptionStructure>): void {
		if (data.channel_ids !== undefined) {
			this.channelIds = data.channel_ids;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.emoji !== undefined) {
			this.emoji = Emoji.from(data.emoji);
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

	public constructor(data: Partial<OnboardingPromptStructure>) {
		super(data);
	}

	public toJSON(): OnboardingPromptStructure {
		return {
			id: this.id,
			in_onboarding: this.inOnboarding,
			options: this.options.map((option) => option.toJSON()),
			required: this.required,
			single_select: this.singleSelect,
			title: this.title,
			type: this.type,
		};
	}

	protected patch(data: Partial<OnboardingPromptStructure>): void {
		if (data.id !== undefined) {
			this.id = data.id;
		}

		if (data.in_onboarding !== undefined) {
			this.inOnboarding = data.in_onboarding;
		}

		if (data.options !== undefined) {
			this.options = data.options.map((option) => new PromptOption(option));
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

	public constructor(data: Partial<GuildOnboardingStructure>) {
		super(data);
	}

	public toJSON(): GuildOnboardingStructure {
		return {
			default_channel_ids: this.defaultChannelIds,
			enabled: this.enabled,
			guild_id: this.guildId,
			mode: this.mode,
			prompts: this.prompts.map((prompt) => prompt.toJSON()),
		};
	}

	protected patch(data: Partial<GuildOnboardingStructure>): void {
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
			this.prompts = data.prompts.map((prompt) => new OnboardingPrompt(prompt));
		}
	}
}

export { PromptTypes, OnboardingMode } from "@nyxjs/rest";
