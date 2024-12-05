import type {
  ActionRowEntity,
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  PollCreateRequestEntity,
} from "@nyxjs/core";

/**
 * @todo Verify all the types in `InteractionResponseOptions`.
 */
export interface InteractionResponseOptionsEntity {
  type: number;
  data?: InteractionCallbackDataOptionsEntity;
}

/**
 * @todo Verify all the types in `InteractionCallbackDataOptions`.
 */
export interface InteractionCallbackDataOptionsEntity {
  tts?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  flags?: number;
  components?: ActionRowEntity[];
  attachments?: Partial<AttachmentEntity>[];
  poll?: PollCreateRequestEntity;
}
