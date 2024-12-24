import { InteractionCallbackType } from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";

export const InteractionCallbackDataSchema = CreateMessageSchema.pick({
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
  typeof InteractionCallbackDataSchema
>;

export const InteractionResponseSchema = z
  .object({
    type: z.nativeEnum(InteractionCallbackType),
    data: InteractionCallbackDataSchema.optional(),
  })
  .strict();

export type InteractionResponseEntity = z.infer<
  typeof InteractionResponseSchema
>;

export const FollowupMessageSchema = InteractionCallbackDataSchema;

export type FollowupMessageEntity = z.infer<typeof FollowupMessageSchema>;
