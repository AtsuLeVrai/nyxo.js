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
});

export type InteractionCallbackDataSchema = z.input<
  typeof InteractionCallbackDataSchema
>;

export const InteractionResponseSchema = z.object({
  type: z.nativeEnum(InteractionCallbackType),
  data: InteractionCallbackDataSchema.optional(),
});

export type InteractionResponseSchema = z.input<
  typeof InteractionResponseSchema
>;

export const FollowupMessageSchema = InteractionCallbackDataSchema;

export type FollowupMessageSchema = z.input<typeof FollowupMessageSchema>;
