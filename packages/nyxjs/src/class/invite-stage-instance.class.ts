import { InviteStageInstanceEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class InviteStageInstance extends BaseClass<InviteStageInstanceEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof InviteStageInstanceEntity>> = {},
  ) {
    super(client, InviteStageInstanceEntity, entity);
  }

  get members(): GuildMember[] {
    return Array.isArray(this.entity.members)
      ? this.entity.members.map(
          (member) => new GuildMember(this.client, member),
        )
      : [];
  }

  get participantCount(): number {
    return this.entity.participant_count;
  }

  get speakerCount(): number {
    return this.entity.speaker_count;
  }

  get topic(): string {
    return this.entity.topic;
  }

  toJson(): InviteStageInstanceEntity {
    return { ...this.entity };
  }
}

export const InviteStageInstanceSchema = z.instanceof(InviteStageInstance);
