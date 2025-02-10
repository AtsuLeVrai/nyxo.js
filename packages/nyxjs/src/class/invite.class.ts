import {
  InviteEntity,
  type InviteTargetType,
  type InviteType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Application } from "./application.class.js";
import { Channel } from "./channel.class.js";
import { GuildScheduledEvent } from "./guild-scheduled-event.class.js";
import { Guild } from "./guild.class.js";
import { InviteStageInstance } from "./invite-stage-instance.class.js";
import { User } from "./user.class.js";

export class Invite {
  readonly #data: InviteEntity;

  constructor(data: Partial<z.input<typeof InviteEntity>> = {}) {
    try {
      this.#data = InviteEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get type(): InviteType {
    return this.#data.type;
  }

  get code(): string {
    return this.#data.code;
  }

  get guild(): Guild | null {
    return this.#data.guild ? new Guild(this.#data.guild) : null;
  }

  get channel(): Channel | null {
    return this.#data.channel ? new Channel(this.#data.channel) : null;
  }

  get inviter(): User | null {
    return this.#data.inviter ? new User(this.#data.inviter) : null;
  }

  get targetType(): InviteTargetType | null {
    return this.#data.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.#data.target_user ? new User(this.#data.target_user) : null;
  }

  get targetApplication(): Application | null {
    return this.#data.target_application
      ? new Application(this.#data.target_application)
      : null;
  }

  get approximatePresenceCount(): number | null {
    return this.#data.approximate_presence_count ?? null;
  }

  get approximateMemberCount(): number | null {
    return this.#data.approximate_member_count ?? null;
  }

  get expiresAt(): string | null {
    return this.#data.expires_at ?? null;
  }

  get stageInstance(): InviteStageInstance | null {
    return this.#data.stage_instance
      ? new InviteStageInstance(this.#data.stage_instance)
      : null;
  }

  get guildScheduledEvent(): GuildScheduledEvent | null {
    return this.#data.guild_scheduled_event
      ? new GuildScheduledEvent(this.#data.guild_scheduled_event)
      : null;
  }

  toJson(): InviteEntity {
    return { ...this.#data };
  }

  clone(): Invite {
    return new Invite(this.toJson());
  }

  validate(): boolean {
    try {
      InviteSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InviteEntity>): Invite {
    return new Invite({ ...this.toJson(), ...other });
  }

  equals(other: Invite): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InviteSchema = z.instanceof(Invite);
