import {
  BitFieldManager,
  BitwisePermissionFlags,
  type FormattedRole,
  RoleEntity,
  type RoleFlags,
  RoleTagsEntity,
  formatRole,
} from "@nyxjs/core";
import {
  Cdn,
  type ImageProcessingOptions,
  type ModifyGuildRoleEntity,
} from "@nyxjs/rest";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { ColorInformation } from "../builders/index.js";
import type { Client } from "../client.js";
import { snakeCaseDeep } from "../utils.js";

export class RoleTagsClass {
  readonly #data: RoleTagsEntity;

  constructor(data: Partial<z.input<typeof RoleTagsEntity>> = {}) {
    try {
      this.#data = RoleTagsEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get botId(): string | null {
    return this.#data.bot_id ?? null;
  }

  get integrationId(): string | null {
    return this.#data.integration_id ?? null;
  }

  get premiumSubscriber(): null {
    return this.#data.premium_subscriber ?? null;
  }

  get subscriptionListingId(): string | null {
    return this.#data.premium_subscriber ?? null;
  }

  get availableForPurchase(): null {
    return this.#data.available_for_purchase ?? null;
  }

  get guildConnections(): null {
    return this.#data.guild_connections ?? null;
  }

  static from(data: Partial<z.input<typeof RoleTagsEntity>>): RoleTagsClass {
    return new RoleTagsClass(data);
  }

  isBot(): boolean {
    return this.botId !== null;
  }

  isIntegration(): boolean {
    return this.integrationId !== null;
  }

  isPremiumSubscriber(): boolean {
    return this.premiumSubscriber !== null;
  }

  isAvailableForPurchase(): boolean {
    return this.availableForPurchase !== null;
  }

  hasGuildConnections(): boolean {
    return this.guildConnections !== null;
  }

  toJson(): RoleTagsEntity {
    try {
      return RoleTagsEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}

export interface RoleDifferences {
  name: boolean;
  color: boolean;
  hoist: boolean;
  position: boolean;
  permissions: boolean;
  mentionable: boolean;
  icon: boolean;
  unicodeEmoji: boolean;
}

export class Role {
  readonly #client: Client;
  readonly #data: RoleEntity;
  readonly #guildId: string;
  readonly #permissions: BitFieldManager<BitwisePermissionFlags>;
  readonly #flags: BitFieldManager<RoleFlags>;

  constructor(
    client: Client,
    guildId: string,
    data: Partial<z.input<typeof RoleEntity>> = {},
  ) {
    this.#client = client;
    this.#guildId = guildId;

    try {
      this.#data = RoleEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#permissions = new BitFieldManager<BitwisePermissionFlags>(
      BigInt(this.#data.permissions),
    );
    this.#flags = new BitFieldManager<RoleFlags>(this.#data.flags);
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get color(): number {
    return this.#data.color;
  }

  get hoist(): boolean {
    return this.#data.hoist;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get unicodeEmoji(): string | null {
    return this.#data.unicode_emoji ?? null;
  }

  get position(): number {
    return this.#data.position;
  }

  get managed(): boolean {
    return this.#data.managed;
  }

  get mentionable(): boolean {
    return this.#data.mentionable;
  }

  get tags(): RoleTagsClass | null {
    return this.#data.tags
      ? RoleTagsClass.from(snakeCaseDeep(this.#data.tags))
      : null;
  }

  get data(): RoleEntity {
    return this.#data;
  }

  get permissions(): BitFieldManager<BitwisePermissionFlags> {
    return this.#permissions.clone();
  }

  get flags(): BitFieldManager<RoleFlags> {
    return this.#flags.clone();
  }

  static from(
    client: Client,
    guildId: string,
    data: Partial<RoleEntity>,
  ): Role {
    return new Role(client, guildId, data);
  }

  isDefault(): boolean {
    return this.id === this.#guildId;
  }

  isVisible(): boolean {
    return this.hoist || this.color !== 0;
  }

  isHigherThan(other: Role): boolean {
    if (this.position === other.position) {
      return BigInt(this.id) > BigInt(other.id);
    }
    return this.position > other.position;
  }

  isManagedRole(): boolean {
    return this.managed || this.tags?.integrationId !== null;
  }

  isBoosterRole(): boolean {
    return this.tags?.premiumSubscriber !== null;
  }

  getPermissionNames(): string[] {
    return Object.entries(BitwisePermissionFlags)
      .filter(
        ([_, flag]) => typeof flag === "number" && this.hasPermission(flag),
      )
      .map(([name]) => name);
  }

  getIconUrl(options?: ImageProcessingOptions): string | null {
    if (!this.#data.icon) {
      return null;
    }
    return Cdn.roleIcon(this.id, this.#data.icon, options);
  }

  getColor(): ColorInformation {
    const decimal = this.color;
    const r = (decimal >> 16) & 0xff;
    const g = (decimal >> 8) & 0xff;
    const b = decimal & 0xff;
    const hex = `#${decimal.toString(16).padStart(6, "0")}`;

    return {
      hex,
      rgb: { r, g, b },
      decimal,
    };
  }

  getContrastingColor(): string {
    const { rgb } = this.getColor();
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }

  getDifferences(other: Role): RoleDifferences {
    return {
      name: this.name !== other.name,
      color: this.color !== other.color,
      hoist: this.hoist !== other.hoist,
      position: this.position !== other.position,
      permissions: !this.#permissions.equals(other.#permissions),
      mentionable: this.mentionable !== other.mentionable,
      icon: this.icon !== other.icon,
      unicodeEmoji: this.unicodeEmoji !== other.unicodeEmoji,
    };
  }

  async modify(options: ModifyGuildRoleEntity, reason?: string): Promise<Role> {
    const response = await this.#client.rest.guilds.modifyGuildRole(
      this.#guildId,
      this.id,
      options,
      reason,
    );

    return new Role(this.#client, this.#guildId, response);
  }

  async delete(reason?: string): Promise<void> {
    await this.#client.rest.guilds.deleteGuildRole(
      this.#guildId,
      this.id,
      reason,
    );
  }

  async setPosition(position: number): Promise<Role> {
    const response = await this.#client.rest.guilds.modifyGuildRolePositions(
      this.#guildId,
      [{ id: this.id, position }],
    );

    const updatedRole = response.find((role) => role.id === this.id);
    if (!updatedRole) {
      throw new Error("Role not found after position update");
    }

    return new Role(this.#client, this.#guildId, updatedRole);
  }

  async clone(newName?: string, reason?: string): Promise<Role> {
    const response = await this.#client.rest.guilds.createGuildRole(
      this.#guildId,
      {
        name: newName ?? `${this.name} (copy)`,
        permissions: this.#permissions.toString(),
        color: this.color,
        hoist: this.hoist,
        mentionable: this.mentionable,
        icon: this.icon ?? null,
        unicode_emoji: this.unicodeEmoji ?? undefined,
      },
      reason,
    );

    return new Role(this.#client, this.#guildId, response);
  }

  syncPermissionsWith(other: Role, reason?: string): Promise<Role> {
    return this.modify(
      {
        permissions: other.permissions.toString(),
      },
      reason,
    );
  }

  toString(): FormattedRole {
    return formatRole(this.id);
  }

  toJson(): RoleEntity {
    try {
      return RoleEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  hasPermission(permission: BitwisePermissionFlags): boolean {
    if (this.#permissions.has(BitwisePermissionFlags.Administrator)) {
      return true;
    }
    return this.#permissions.has(permission);
  }

  hasPermissions(permissions: BitwisePermissionFlags[]): boolean {
    if (this.#permissions.has(BitwisePermissionFlags.Administrator)) {
      return true;
    }
    return permissions.every((permission) => this.#permissions.has(permission));
  }

  hasAnyPermission(permissions: BitwisePermissionFlags[]): boolean {
    if (this.#permissions.has(BitwisePermissionFlags.Administrator)) {
      return true;
    }
    return permissions.some((permission) => this.#permissions.has(permission));
  }

  hasFlag(flag: RoleFlags): boolean {
    return this.#flags.has(flag);
  }

  hasFlags(flags: RoleFlags[]): boolean {
    return this.#flags.hasAll(flags);
  }

  hasAnyFlag(flags: RoleFlags[]): boolean {
    return this.#flags.hasAny(flags);
  }

  hasCustomColor(): boolean {
    return this.color !== 0;
  }

  setName(name: string, reason?: string): Promise<Role> {
    return this.modify({ name }, reason);
  }

  setColor(color: number, reason?: string): Promise<Role> {
    return this.modify({ color }, reason);
  }

  setMentionable(mentionable: boolean, reason?: string): Promise<Role> {
    return this.modify({ mentionable }, reason);
  }

  setPermissions(
    permissions: BitwisePermissionFlags[],
    reason?: string,
  ): Promise<Role> {
    const bitfield = BitFieldManager.combine(...permissions);
    return this.modify({ permissions: bitfield.toString() }, reason);
  }

  addPermissions(
    permissions: BitwisePermissionFlags[],
    reason?: string,
  ): Promise<Role> {
    const newPermissions = this.#permissions.clone().add(...permissions);
    return this.modify({ permissions: newPermissions.toString() }, reason);
  }

  removePermissions(
    permissions: BitwisePermissionFlags[],
    reason?: string,
  ): Promise<Role> {
    const newPermissions = this.#permissions.clone().remove(...permissions);
    return this.modify({ permissions: newPermissions.toString() }, reason);
  }

  moveBelow(other: Role): Promise<Role> {
    return this.setPosition(other.position - 1);
  }

  moveAbove(other: Role): Promise<Role> {
    return this.setPosition(other.position + 1);
  }

  copyFrom(other: Role, reason?: string): Promise<Role> {
    return this.modify(
      {
        name: other.name,
        color: other.color,
        hoist: other.hoist,
        permissions: other.permissions.toString(),
        mentionable: other.mentionable,
        icon: other.icon,
        unicode_emoji: other.unicodeEmoji ?? undefined,
      },
      reason,
    );
  }

  comparePosition(other: Role): number {
    return this.position - other.position;
  }

  missingPermissions(
    permissions: BitwisePermissionFlags[],
  ): BitwisePermissionFlags[] {
    if (this.#permissions.has(BitwisePermissionFlags.Administrator)) {
      return [];
    }

    const missingBits = this.#permissions.missing(permissions);
    return permissions.filter((permission) =>
      missingBits.includes(BigInt(permission)),
    );
  }
}
