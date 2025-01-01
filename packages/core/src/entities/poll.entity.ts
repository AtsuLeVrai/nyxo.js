import { z } from "zod";
import { EmojiSchema } from "./emoji.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export const PollAnswerCountSchema = z
  .object({
    id: z.number().int(),
    count: z.number().int(),
    me_voted: z.boolean(),
  })
  .strict();

export type PollAnswerCountEntity = z.infer<typeof PollAnswerCountSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export const PollResultsSchema = z
  .object({
    is_finalized: z.boolean(),
    answer_counts: z.array(PollAnswerCountSchema),
  })
  .strict();

export type PollResultsEntity = z.infer<typeof PollResultsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export const PollMediaSchema = z
  .object({
    text: z.string().min(1).max(300).optional(),
    emoji: z
      .union([EmojiSchema.pick({ id: true }), EmojiSchema.pick({ name: true })])
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

export type PollMediaEntity = z.infer<typeof PollMediaSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export const PollAnswerSchema = z
  .object({
    answer_id: z.number().int(),
    poll_media: PollMediaSchema.sourceType().extend({
      text: z.string().min(1).max(55).optional(),
    }),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export const LayoutType = {
  default: 1,
} as const;

export type LayoutType = (typeof LayoutType)[keyof typeof LayoutType];

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export const PollCreateRequestSchema = z
  .object({
    question: PollMediaSchema,
    answers: z
      .array(PollAnswerSchema.omit({ answer_id: true }))
      .min(1)
      .max(10),
    duration: z
      .number()
      .int()
      .min(1)
      .max(32 * 24)
      .optional()
      .default(24),
    allow_multiselect: z.boolean().optional().default(false),
    layout_type: z
      .nativeEnum(LayoutType)
      .optional()
      .default(LayoutType.default),
  })
  .strict();

export type PollCreateRequestEntity = z.infer<typeof PollCreateRequestSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export const PollSchema = z
  .object({
    question: PollMediaSchema,
    answers: z.array(PollAnswerSchema).min(1).max(10),
    expiry: z.string().datetime().nullable(),
    allow_multiselect: z.boolean(),
    layout_type: z.nativeEnum(LayoutType),
    results: PollResultsSchema.optional(),
  })
  .strict();

export type PollEntity = z.infer<typeof PollSchema>;
