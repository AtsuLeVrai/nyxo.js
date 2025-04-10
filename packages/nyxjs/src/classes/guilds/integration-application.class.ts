import type { IntegrationApplicationEntity, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";

export class IntegrationApplication
  extends BaseClass<IntegrationApplicationEntity>
  implements EnforceCamelCase<IntegrationApplicationEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get icon(): string | null {
    return this.data.icon;
  }

  get description(): string | null {
    return this.data.description;
  }

  get bot(): User | undefined {
    if (!this.data.bot) {
      return undefined;
    }

    return User.from(this.client, this.data.bot);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
