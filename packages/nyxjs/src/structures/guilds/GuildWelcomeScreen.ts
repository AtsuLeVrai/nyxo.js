import type { Snowflake } from "@nyxjs/core";
import type {
	WelcomeScreenChannelStructure,
	WelcomeScreenStructure,
} from "@nyxjs/rest";
import { Base } from "../Base";

export class WelcomeScreenChannel extends Base<WelcomeScreenChannelStructure> {
	public channelId!: Snowflake;

	public description!: string;

	public emojiId!: Snowflake | null;

	public emojiName!: string | null;

	public constructor(data: Partial<WelcomeScreenChannelStructure>) {
		super(data);
	}

	public toJSON(): WelcomeScreenChannelStructure {
		return {
			channel_id: this.channelId,
			description: this.description,
			emoji_id: this.emojiId,
			emoji_name: this.emojiName,
		};
	}

	protected patch(data: Partial<WelcomeScreenChannelStructure>): void {
		if (data.channel_id !== undefined) {
			this.channelId = data.channel_id;
		}

		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.emoji_id !== undefined) {
			this.emojiId = data.emoji_id;
		}

		if (data.emoji_name !== undefined) {
			this.emojiName = data.emoji_name;
		}
	}
}

export class WelcomeScreen extends Base<WelcomeScreenStructure> {
	public description!: string | null;

	public welcomeChannels!: WelcomeScreenChannel[];

	public constructor(data: Partial<WelcomeScreenStructure>) {
		super(data);
	}

	public toJSON(): WelcomeScreenStructure {
		return {
			description: this.description,
			welcome_channels: this.welcomeChannels.map((channel) => channel.toJSON()),
		};
	}

	protected patch(data: Partial<WelcomeScreenStructure>): void {
		if (data.description !== undefined) {
			this.description = data.description;
		}

		if (data.welcome_channels !== undefined) {
			this.welcomeChannels = data.welcome_channels.map((channel) =>
				WelcomeScreenChannel.from(channel),
			);
		}
	}
}
