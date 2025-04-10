import {
  BitFieldManager,
  type BitwisePermissionFlags,
  type OverwriteEntity,
  type OverwriteType,
  type Snowflake,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class Overwrite
  extends BaseClass<OverwriteEntity>
  implements EnforceCamelCase<OverwriteEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get type(): OverwriteType {
    return this.data.type;
  }

  get allow(): BitFieldManager<BitwisePermissionFlags> {
    return new BitFieldManager<BitwisePermissionFlags>(this.data.allow);
  }

  get deny(): BitFieldManager<BitwisePermissionFlags> {
    return new BitFieldManager<BitwisePermissionFlags>(this.data.allow);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
