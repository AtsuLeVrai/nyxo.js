import type { ApiVersion, ApplicationEntity } from "@nyxjs/core";
import type { GuildCreateEntity, ReadyEntity } from "@nyxjs/gateway";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { Application } from "../applications/index.js";
import { Guild } from "../guilds/index.js";
import { User } from "../users/index.js";

export class Ready
  extends BaseClass<ReadyEntity>
  implements EnforceCamelCase<ReadyEntity>
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

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
