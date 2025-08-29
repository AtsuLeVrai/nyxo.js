import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { RoleEntity } from "./role.entity.js";

export class Role extends BaseClass<RoleEntity> implements CamelCaseKeys<RoleEntity> {
  readonly id = this.rawData.id;
  readonly name = this.rawData.name;
  readonly color = this.rawData.color;
  readonly colors = this.rawData.colors;
  readonly hoist = this.rawData.hoist;
  readonly icon = this.rawData.icon;
  readonly unicodeEmoji = this.rawData.unicode_emoji;
  readonly position = this.rawData.position;
  readonly permissions = this.rawData.permissions;
  readonly managed = this.rawData.managed;
  readonly mentionable = this.rawData.mentionable;
  readonly tags = this.rawData.tags;
  readonly flags = this.rawData.flags;
}
