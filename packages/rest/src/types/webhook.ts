import type {
  AllowedMentionsEntity,
  AttachmentEntity,
  MessageEntity,
  Snowflake,
  WebhookEntity,
} from "@nyxjs/core";
import type { FileEntity, ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#create-webhook-json-params}
 */
export interface WebhookCreateEntity extends Pick<WebhookEntity, "name"> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#modify-webhook-json-params}
 */
export interface WebhookModifyEntity
  extends Partial<Pick<WebhookEntity, "name" | "channel_id">> {
  avatar?: ImageData | null;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params}
 */
export interface WebhookExecuteEntity
  extends Pick<
    MessageEntity,
    "content" | "tts" | "embeds" | "components" | "flags" | "poll"
  > {
  username?: string;
  avatar_url?: string;
  allowed_mentions?: AllowedMentionsEntity;
  files?: FileEntity[];
  payload_json?: string;
  attachments?: Partial<AttachmentEntity>[];
  thread_name?: string;
  applied_tags?: Snowflake[];
}

export interface WebhookExecuteOptionsEntity extends WebhookExecuteEntity {
  wait?: boolean;
  thread_id?: Snowflake;
}

export interface EditWebhookMessageOptionsEntity
  extends Partial<WebhookExecuteEntity> {
  thread_id?: Snowflake;
}
