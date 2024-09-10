import type { Snowflake, WelcomeScreenChannelStructure, WelcomeScreenStructure } from "@nyxjs/core";
import { Base } from "./Base";

export class WelcomeScreenChannel extends Base<WelcomeScreenChannelStructure> {
    public channelId!: Snowflake;

    public description!: string;

    public emojiId!: Snowflake | null;

    public emojiName!: string | null;

    public constructor(data: Readonly<Partial<WelcomeScreenChannelStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<WelcomeScreenChannelStructure>>): void {
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

    public constructor(data: Readonly<Partial<WelcomeScreenStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<WelcomeScreenStructure>>): void {
        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.welcome_channels !== undefined) {
            this.welcomeChannels = data.welcome_channels.map((channel) => WelcomeScreenChannel.from(channel));
        }
    }
}
