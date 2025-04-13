import type {
  AnyChannelEntity,
  Snowflake,
  WebhookEntity,
  WebhookType,
} from "@nyxjs/core";
import type { GuildCreateEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import { ChannelFactory } from "../../factories/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import type { AnyChannel } from "../channels/index.js";
import { Guild } from "../guilds/index.js";
import { User } from "../users/index.js";

export class Webhook
  extends BaseClass<WebhookEntity>
  implements EnforceCamelCase<WebhookEntity>
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return {
      storeKey: "webhooks",
      id: this.id,
    };
  }
}
