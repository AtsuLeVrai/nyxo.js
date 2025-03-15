import { z } from "zod";
import { EmojiEntity } from "./emoji.entity.js";

/**
 * Represents the layout types available for polls.
 * Currently only one layout type is supported.
 *
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#layout-type}
 */
export enum LayoutType {
  /** The default layout type for polls (1) */
  Default = 1,
}

/**
 * Zod schema for Poll Answer Count
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-answer-count-object-structure}
 */
export const PollAnswerCountEntity = z.object({
  /** The answer_id */
  id: z.number().int().positive(),

  /** The number of votes for this answer */
  count: z.number().int().nonnegative(),

  /** Whether the current user voted for this answer */
  me_voted: z.boolean(),
});

/**
 * Type definition for Poll Answer Count derived from the Zod schema
 */
export type PollAnswerCountEntity = z.infer<typeof PollAnswerCountEntity>;

/**
 * Zod schema for Poll Results
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-results-object-structure}
 */
export const PollResultsEntity = z.object({
  /** Whether the votes have been precisely counted */
  is_finalized: z.boolean(),

  /** The counts for each answer */
  answer_counts: z.array(PollAnswerCountEntity),
});

/**
 * Type definition for Poll Results derived from the Zod schema
 */
export type PollResultsEntity = z.infer<typeof PollResultsEntity>;

/**
 * Zod schema for Poll Media
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-media-object-structure}
 */
export const PollMediaEntity = z
  .object({
    /** The text of the field (max 300 characters for questions, max 55 for answers) */
    text: z.string().optional(),

    /** The emoji of the field (custom or default emoji) */
    emoji: z
      .union([EmojiEntity.pick({ id: true }), EmojiEntity.pick({ name: true })])
      .optional(),
  })
  .refine((data) => data.text !== undefined || data.emoji !== undefined, {
    message: "Either text or emoji (or both) must be provided",
  })
  .sourceType();

/**
 * Type definition for Poll Media derived from the Zod schema
 */
export type PollMediaEntity = z.infer<typeof PollMediaEntity>;

/**
 * Zod schema for Poll Answer
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-answer-object-structure}
 */
export const PollAnswerEntity = z.object({
  /** The ID of the answer */
  answer_id: z.number().int().positive(),

  /** The data of the answer */
  poll_media: PollMediaEntity.extend({
    text: z.string().max(55).optional(),
  }),
});

/**
 * Type definition for Poll Answer derived from the Zod schema
 */
export type PollAnswerEntity = z.infer<typeof PollAnswerEntity>;

/**
 * Zod schema for Poll Create Request
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-create-request-object-structure}
 */
export const PollCreateRequestEntity = z.object({
  /** The question of the poll */
  question: PollMediaEntity.extend({
    text: z.string().max(300).optional(),
  }),

  /** Each of the answers available in the poll, up to 10 */
  answers: z
    .array(PollAnswerEntity.omit({ answer_id: true }))
    .min(2)
    .max(10),

  /**
   * Number of hours the poll should be open for, up to 32 days
   * Defaults to 24 hours
   */
  duration: z
    .number()
    .int()
    .positive()
    .max(32 * 24), // Max 32 days in hours

  /**
   * Whether a user can select multiple answers
   * Defaults to false
   */
  allow_multiselect: z.boolean().default(false),

  /**
   * The layout type of the poll
   * Defaults to DEFAULT
   */
  layout_type: z.nativeEnum(LayoutType).default(LayoutType.Default),
});

/**
 * Type definition for Poll Create Request derived from the Zod schema
 */
export type PollCreateRequestEntity = z.infer<typeof PollCreateRequestEntity>;

/**
 * Zod schema for Poll Entity
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-object-structure}
 */
export const PollEntity = z.object({
  /** The question of the poll */
  question: PollMediaEntity.extend({
    text: z.string().max(300).optional(),
  }),

  /** Each of the answers available in the poll */
  answers: z.array(PollAnswerEntity).min(2).max(10),

  /**
   * The time when the poll ends
   * Currently, all polls have an expiry, but this is marked as nullable
   * to support non-expiring polls in the future
   */
  expiry: z
    .string()
    .nullable()
    .refine((val) => val === null || !Number.isNaN(Date.parse(val)), {
      message: "Expiry must be a valid ISO8601 timestamp or null",
    }),

  /** Whether a user can select multiple answers */
  allow_multiselect: z.boolean(),

  /** The layout type of the poll */
  layout_type: z.nativeEnum(LayoutType),

  /**
   * The results of the poll
   * May not be present in certain responses where results are not fetched
   */
  results: PollResultsEntity.optional(),
});

/**
 * Type definition for Poll Entity derived from the Zod schema
 */
export type PollEntity = z.infer<typeof PollEntity>;
