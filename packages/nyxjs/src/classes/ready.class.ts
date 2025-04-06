import type { ApiVersion, ApplicationEntity } from "@nyxjs/core";
import type { GuildCreateEntity, ReadyEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import { Application } from "./application.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class Ready extends BaseClass<ReadyEntity> {
  get v(): ApiVersion {
    return this.data.v;
  }

  get user(): User {
    return User.from(this.client, this.data.user);
  }

  get guilds(): Guild[] {
    return this.data.guilds.map((guild) =>
      Guild.from(this.client, guild as unknown as GuildCreateEntity),
    );
  }

  get sessionId(): string {
    return this.data.session_id;
  }

  get resumeGatewayUrl(): string {
    return this.data.resume_gateway_url;
  }

  get shard(): [number, number] | undefined {
    return this.data.shard;
  }

  get application(): Application {
    return Application.from(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
