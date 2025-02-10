import {
  type ApplicationIntegrationType,
  BitFieldManager,
  type BitwisePermissionFlags,
  type InteractionContextType,
  type InteractionDataEntity,
  InteractionEntity,
  type InteractionType,
  type Locale,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Channel } from "./channel.class.js";
import { Entitlement } from "./entitlement.class.js";
import { GuildMember } from "./guild-member.class.js";
import { Guild } from "./guild.class.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

export class Interaction {
  readonly #data: InteractionEntity;
  readonly #appPermissions: BitFieldManager<BitwisePermissionFlags>;

  constructor(data: Partial<z.input<typeof InteractionEntity>> = {}) {
    try {
      this.#data = InteractionEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#appPermissions = new BitFieldManager(this.#data.app_permissions);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get applicationId(): Snowflake {
    return this.#data.application_id;
  }

  get type(): InteractionType {
    return this.#data.type;
  }

  get data(): InteractionDataEntity | null {
    return this.#data.data ?? null;
  }

  get guild(): Guild | null {
    return this.#data.guild ? new Guild(this.#data.guild) : null;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get channel(): Channel | null {
    return this.#data.channel ? new Channel(this.#data.channel) : null;
  }

  get channelId(): Snowflake | null {
    return this.#data.channel_id ?? null;
  }

  get member(): GuildMember | null {
    return this.#data.member ? new GuildMember(this.#data.member) : null;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get token(): string {
    return this.#data.token;
  }

  get version(): 1 {
    return this.#data.version;
  }

  get message(): Message | null {
    return this.#data.message ? new Message(this.#data.message) : null;
  }

  get appPermissions(): BitFieldManager<BitwisePermissionFlags> {
    return this.#appPermissions;
  }

  get locale(): Locale | null {
    return this.#data.locale ?? null;
  }

  get guildLocale(): Locale | null {
    return this.#data.guild_locale ?? null;
  }

  get entitlements(): Entitlement[] {
    return Array.isArray(this.#data.entitlements)
      ? this.#data.entitlements.map(
          (entitlement) => new Entitlement(entitlement),
        )
      : [];
  }

  get authorizingIntegrationOwners(): Record<
    ApplicationIntegrationType,
    string
  > {
    return this.#data.authorizing_integration_owners;
  }

  get context(): InteractionContextType | null {
    return this.#data.context ?? null;
  }

  toJson(): InteractionEntity {
    return { ...this.#data };
  }

  clone(): Interaction {
    return new Interaction(this.toJson());
  }

  validate(): boolean {
    try {
      InteractionSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InteractionEntity>): Interaction {
    return new Interaction({ ...this.toJson(), ...other });
  }

  equals(other: Interaction): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InteractionSchema = z.instanceof(Interaction);
