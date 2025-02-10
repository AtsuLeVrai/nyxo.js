import { InviteStageInstanceEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { GuildMember } from "./guild-member.class.js";

export class InviteStageInstance {
  readonly #data: InviteStageInstanceEntity;

  constructor(data: Partial<z.input<typeof InviteStageInstanceEntity>> = {}) {
    try {
      this.#data = InviteStageInstanceEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get members(): GuildMember[] {
    return Array.isArray(this.#data.members)
      ? this.#data.members.map((member) => new GuildMember(member))
      : [];
  }

  get participantCount(): number {
    return this.#data.participant_count;
  }

  get speakerCount(): number {
    return this.#data.speaker_count;
  }

  get topic(): string {
    return this.#data.topic;
  }

  toJson(): InviteStageInstanceEntity {
    return { ...this.#data };
  }

  clone(): InviteStageInstance {
    return new InviteStageInstance(this.toJson());
  }

  validate(): boolean {
    try {
      InviteStageInstanceSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InviteStageInstanceEntity>): InviteStageInstance {
    return new InviteStageInstance({ ...this.toJson(), ...other });
  }

  equals(other: InviteStageInstance): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InviteStageInstanceSchema = z.instanceof(InviteStageInstance);
