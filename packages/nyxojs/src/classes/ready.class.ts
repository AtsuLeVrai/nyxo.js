import type { ApiVersion, ApplicationEntity } from "@nyxojs/core";
import type { GuildCreateEntity, ReadyEntity } from "@nyxojs/gateway";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import { Application } from "./application.class.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class Ready
  extends BaseClass<ReadyEntity>
  implements Enforce<CamelCasedProperties<ReadyEntity>>
{
  get v(): ApiVersion {
    return this.data.v;
  }

  get user(): User {
    return new User(this.client, this.data.user);
  }

  get guilds(): Guild[] {
    return this.data.guilds.map(
      (guild) => new Guild(this.client, guild as unknown as GuildCreateEntity),
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
    return new Application(
      this.client,
      this.data.application as ApplicationEntity,
    );
  }
}
