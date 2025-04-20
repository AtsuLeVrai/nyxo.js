import type {
  AnyChannelEntity,
  Snowflake,
  WebhookEntity,
  WebhookType,
} from "@nyxojs/core";
import type { GuildCreateEntity } from "@nyxojs/gateway";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import { ChannelFactory } from "../factories/index.js";
import type { Enforce } from "../types/index.js";
import type { AnyChannel } from "./channel.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

@Cacheable("webhooks")
export class Webhook
  extends BaseClass<WebhookEntity>
  implements Enforce<CamelCasedProperties<WebhookEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get type(): WebhookType {
    return this.data.type;
  }

  get guildId(): Snowflake | null | undefined {
    return this.data.guild_id;
  }

  get channelId(): Snowflake | null {
    return this.data.channel_id;
  }

  get user(): User | null | undefined {
    if (!this.data.user) {
      return null;
    }

    return new User(this.client, this.data.user);
  }

  get name(): string | null | undefined {
    return this.data.name;
  }

  get avatar(): string | null | undefined {
    return this.data.avatar;
  }

  get token(): string | undefined {
    return this.data.token;
  }

  get applicationId(): Snowflake | null {
    return this.data.application_id;
  }

  get sourceGuild(): Guild | null | undefined {
    if (!this.data.source_guild) {
      return null;
    }

    return new Guild(this.client, this.data.source_guild as GuildCreateEntity);
  }

  get sourceChannel(): AnyChannel | null | undefined {
    if (!this.data.source_channel) {
      return null;
    }

    return ChannelFactory.create(
      this.client,
      this.data.source_channel as AnyChannelEntity,
    );
  }

  get url(): string | undefined {
    return this.data.url;
  }
}
