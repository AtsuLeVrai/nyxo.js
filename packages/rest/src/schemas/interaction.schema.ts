import {
  ComponentType,
  InteractionCallbackType,
  MessageFlags,
} from "@nyxjs/core";
import { z } from "zod";
import { ApplicationCommandOptionChoiceSchema } from "./application-commands.schema.js";
import {
  ActionRowSchema,
  AllowedMentionsSchema,
  AttachmentSchema,
  EmbedSchema,
  PollCreateRequestSchema,
} from "./message.schema.js";

export const InteractionCallbackMessagesSchema = z.object({
  tts: z.boolean().optional().default(false),
  content: z.string().max(2000).optional(),
  embeds: z.array(EmbedSchema).max(10).optional(),
  allowed_mentions: AllowedMentionsSchema.optional(),
  flags: z.nativeEnum(MessageFlags).optional(),
  components: z.array(ActionRowSchema).max(5).optional(),
  attachments: z.array(AttachmentSchema).max(10).optional(),
  poll: PollCreateRequestSchema.optional(),
});

export const InteractionCallbackModalSchema = z.object({
  custom_id: z.string().max(100),
  title: z.string().max(45),
  components: z
    .array(ActionRowSchema)
    .min(1)
    .max(5)
    .refine(
      (components) =>
        components.every(
          (component) =>
            component.type === ComponentType.ActionRow &&
            component.components.length > 0,
        ),
      {
        message:
          "Les composants du modal doivent être des ActionRow valides avec au moins un composant",
      },
    ),
});

export const InteractionCallbackAutocompleteSchema = z.object({
  choices: z.array(ApplicationCommandOptionChoiceSchema).max(25),
});

export const InteractionResponseSchema = z.object({
  type: z.nativeEnum(InteractionCallbackType),
  data: z
    .union([
      InteractionCallbackMessagesSchema,
      InteractionCallbackModalSchema,
      InteractionCallbackAutocompleteSchema,
    ])
    .optional(),
});

export type InteractionResponseSchema = z.input<
  typeof InteractionResponseSchema
>;
