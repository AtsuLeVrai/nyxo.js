import type { GuildWidgetSettingsStructure, GuildWidgetStructure } from "@nyxjs/api-types";
import type { Integer, Snowflake } from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Base } from "./Base";
import { BaseChannel } from "./Channels";
import { User } from "./Users";

export class GuildWidget extends Base<GuildWidgetStructure> {
    public channels!: PickWithPublicMethods<BaseChannel, "id" | "name" | "position">[];

    public id!: Snowflake;

    public instantInvite!: string | null;

    public members!: PickWithPublicMethods<
        User & {
            avatarUrl: string;
            status: string;
        },
        "avatar" | "avatarUrl" | "discriminator" | "id" | "status" | "username"
    >[];

    public name!: string;

    public presenceCount!: Integer;

    public constructor(data: Readonly<Partial<GuildWidgetStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildWidgetStructure>>): void {
        if (data.channels !== undefined) {
            this.channels = data.channels.map((channel) => BaseChannel.from(channel));
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.instant_invite !== undefined) {
            this.instantInvite = data.instant_invite;
        }

        if (data.members !== undefined) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.members = data.members.map((member) => {
                const user = User.from(member);
                return {
                    avatarUrl: member.avatar_url,
                    status: member.status,
                    ...user,
                };
            });
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if (data.presence_count !== undefined) {
            this.presenceCount = data.presence_count;
        }
    }
}

export class GuildWidgetSettings extends Base<GuildWidgetSettingsStructure> {
    public channelId!: Snowflake | null;

    public enabled!: boolean;

    public constructor(data: Readonly<Partial<GuildWidgetSettingsStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<GuildWidgetSettingsStructure>>): void {
        if (data.channel_id !== undefined) {
            this.channelId = data.channel_id;
        }

        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }
    }
}
