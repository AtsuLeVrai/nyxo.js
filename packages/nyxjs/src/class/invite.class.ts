import { InviteEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Invite {
  readonly #data: InviteEntity;

  constructor(data: Partial<z.input<typeof InviteEntity>> = {}) {
    try {
      this.#data = InviteEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get type(): unknown {
    return this.#data.type;
  }

  get code(): string {
    return this.#data.code;
  }

  get guild(): object | null {
    return this.#data.guild ?? null;
  }

  get channel(): unknown | null {
    return this.#data.channel ?? null;
  }

  get inviter(): object | null {
    return this.#data.inviter ?? null;
  }

  get targetType(): unknown | null {
    return this.#data.target_type ?? null;
  }

  get targetUser(): object | null {
    return this.#data.target_user ?? null;
  }

  get targetApplication(): object | null {
    return this.#data.target_application ?? null;
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

  get stageInstance(): object | null {
    return this.#data.stage_instance ?? null;
  }

  get guildScheduledEvent(): object | null {
    return this.#data.guild_scheduled_event ?? null;
  }

  static fromJson(json: InviteEntity): Invite {
    return new Invite(json);
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
