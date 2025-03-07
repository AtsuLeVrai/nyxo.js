import { z } from "zod";
import { Snowflake } from "../managers/index.js";

/**
 * Represents the layout types available for polls.
 * Currently only one layout type is supported.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  /** The default layout type for polls (1) */
  Default = 1,
}

/**
 * Represents the count of votes for a specific answer in a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export const PollAnswerCountEntity = z.object({
  /** The answer_id */
  id: z.number().int(),

  /** The number of votes for this answer */
  count: z.number().int(),

  /** Whether the current user voted for this answer */
  me_voted: z.boolean(),
});

export type PollAnswerCountEntity = z.infer<typeof PollAnswerCountEntity>;

/**
 * Represents the results of a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export interface PollResultsEntity {
  /** Whether the votes have been precisely counted */
  is_finalized: boolean;

  /** The counts for each answer */
  answer_counts: PollAnswerCountEntity[];
}

/**
 * Represents the media content for a poll question or answer.
 * Either text or emoji (or both) must be provided.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export const PollMediaEntity = z
  .object({
    /** The text of the field (max 300 characters for questions, max 55 for answers) */
    text: z.string().min(1).max(300).optional(),

    /** The emoji of the field (custom or default emoji) */
    emoji: z
      .union([z.object({ id: Snowflake }), z.object({ name: z.string() })])
      .optional(),
  })
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
 * Represents an answer option in a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export const PollAnswerEntity = z.object({
  /** The ID of the answer */
  answer_id: z.number().int(),

  /** The data of the answer */
  poll_media: z.lazy(() =>
    PollMediaEntity.sourceType().extend({
      text: z.string().min(1).max(55).optional(),
    }),
  ),
});

export type PollAnswerEntity = z.infer<typeof PollAnswerEntity>;

/**
 * Represents the request object used when creating a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export const PollCreateRequestEntity = z.object({
  /** The question of the poll */
  question: PollMediaEntity,

  /** Each of the answers available in the poll, up to 10 */
  answers: z
    .array(z.lazy(() => PollAnswerEntity.omit({ answer_id: true })))
    .min(1)
    .max(10),

  /**
   * Number of hours the poll should be open for, up to 32 days
   * Defaults to 24 hours
   */
  duration: z
    .number()
    .int()
    .min(1)
    .max(32 * 24)
    .default(24),

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

export type PollCreateRequestEntity = z.infer<typeof PollCreateRequestEntity>;

/**
 * Represents a poll in Discord.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export interface PollEntity {
  /** The question of the poll */
  question: PollMediaEntity;

  /** Each of the answers available in the poll */
  answers: PollAnswerEntity[];

  /**
   * The time when the poll ends
   * Currently, all polls have an expiry, but this is marked as nullable
   * to support non-expiring polls in the future
   */
  expiry: string | null;

  /** Whether a user can select multiple answers */
  allow_multiselect: boolean;

  /** The layout type of the poll */
  layout_type: LayoutType;

  /**
   * The results of the poll
   * May not be present in certain responses where results are not fetched
   */
  results?: PollResultsEntity;
}
