import { InviteStageInstanceEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class InviteStageInstance extends BaseClass<InviteStageInstanceEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof InviteStageInstanceEntity>> = {},
  ) {
    super(client, InviteStageInstanceEntity, data);
  }

  get members(): GuildMember[] {
    return Array.isArray(this.data.members)
      ? this.data.members.map((member) => new GuildMember(this.client, member))
      : [];
  }

  get participantCount(): number {
    return this.data.participant_count;
  }

  get speakerCount(): number {
    return this.data.speaker_count;
  }

  get topic(): string {
    return this.data.topic;
  }

  toJson(): InviteStageInstanceEntity {
    return { ...this.data };
  }
}

export const InviteStageInstanceSchema = z.instanceof(InviteStageInstance);
