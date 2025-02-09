import { InviteStageInstanceEntity } from "@nyxjs/core";
import { z } from "zod";

export class InviteStageInstance {
  readonly #data: InviteStageInstanceEntity;

  constructor(data: InviteStageInstanceEntity) {
    this.#data = InviteStageInstanceEntity.parse(data);
  }

  get members(): object[] {
    return Array.isArray(this.#data.members) ? [...this.#data.members] : [];
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

  static fromJson(json: InviteStageInstanceEntity): InviteStageInstance {
    return new InviteStageInstance(json);
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
