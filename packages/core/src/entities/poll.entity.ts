import { z } from "zod";
import { EmojiEntity } from "./emoji.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export const PollAnswerCountEntity = z
  .object({
    id: z.number().int(),
    count: z.number().int(),
    me_voted: z.boolean(),
  })
  .strict();

export type PollAnswerCountEntity = z.infer<typeof PollAnswerCountEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export const PollResultsEntity = z
  .object({
    is_finalized: z.boolean(),
    answer_counts: z.array(PollAnswerCountEntity),
  })
  .strict();

export type PollResultsEntity = z.infer<typeof PollResultsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export const PollMediaEntity = z
  .object({
    text: z.string().min(1).max(300).optional(),
    emoji: z
      .union([EmojiEntity.pick({ id: true }), EmojiEntity.pick({ name: true })])
      .optional(),
  })
  .strict()
  .superRefine((media, ctx) => {
    if (!(media.text || media.emoji)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least text or emoji must be provided",
      });
    }
  });

export type PollMediaEntity = z.infer<typeof PollMediaEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export const PollAnswerEntity = z
  .object({
    answer_id: z.number().int(),
    poll_media: PollMediaEntity.sourceType().extend({
      text: z.string().min(1).max(55).optional(),
    }),
  })
  .strict();

export type PollAnswerEntity = z.infer<typeof PollAnswerEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  Default = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export const PollCreateRequestEntity = z
  .object({
    question: PollMediaEntity,
    answers: z
      .array(PollAnswerEntity.omit({ answer_id: true }))
      .min(1)
      .max(10),
    duration: z
      .number()
      .int()
      .min(1)
      .max(32 * 24)
      .default(24),
    allow_multiselect: z.boolean().default(false),
    layout_type: z.nativeEnum(LayoutType).default(LayoutType.Default),
  })
  .strict();

export type PollCreateRequestEntity = z.infer<typeof PollCreateRequestEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export const PollEntity = z
  .object({
    question: PollMediaEntity,
    answers: z.array(PollAnswerEntity).min(1).max(10),
    expiry: z.string().datetime().nullable(),
    allow_multiselect: z.boolean(),
    layout_type: z.nativeEnum(LayoutType),
    results: PollResultsEntity.optional(),
  })
  .strict();

export type PollEntity = z.infer<typeof PollEntity>;
