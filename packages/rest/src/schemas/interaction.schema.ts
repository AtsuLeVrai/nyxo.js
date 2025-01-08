import { InteractionCallbackType } from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageEntity } from "./message.schema.js";

export const InteractionCallbackDataEntity = CreateMessageEntity.pick({
  tts: true,
  content: true,
  embeds: true,
  allowed_mentions: true,
  flags: true,
  components: true,
  attachments: true,
  poll: true,
}).strict();

export type InteractionCallbackDataEntity = z.infer<
  typeof InteractionCallbackDataEntity
>;

export const InteractionResponseEntity = z
  .object({
    type: z.nativeEnum(InteractionCallbackType),
    data: InteractionCallbackDataEntity.optional(),
  })
  .strict();

export type InteractionResponseEntity = z.infer<
  typeof InteractionResponseEntity
>;

export const FollowupMessageEntity = InteractionCallbackDataEntity;

export type FollowupMessageEntity = z.infer<typeof FollowupMessageEntity>;
