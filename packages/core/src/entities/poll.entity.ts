import type { EmojiEntity } from "./emoji.entity.js";

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
 * Interface for Poll Answer Count
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-answer-count-object-structure}
 */
export interface PollAnswerCountEntity {
  /**
   * The answer_id
   * @minimum 1
   */
  id: number;

  /**
   * The number of votes for this answer
   * @minimum 0
   */
  count: number;

  /** Whether the current user voted for this answer */
  me_voted: boolean;
}

/**
 * Interface for Poll Results
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-results-object-structure}
 */
export interface PollResultsEntity {
  /** Whether the votes have been precisely counted */
  is_finalized: boolean;

  /** The counts for each answer */
  answer_counts: PollAnswerCountEntity[];
}

/**
 * Interface for Poll Media
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-media-object-structure}
 * @validate Either text or emoji (or both) must be provided
 */
export interface PollMediaEntity {
  /** The text of the field (max 300 characters for questions, max 55 for answers) */
  text?: string;

  /** The emoji of the field (custom or default emoji) */
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * Interface for Poll Answer
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  /**
   * The ID of the answer
   * @minimum 1
   */
  answer_id: number;

  /** The data of the answer */
  poll_media: PollMediaEntity & {
    /**
     * The text of the answer
     * @maxLength 55
     * @optional
     */
    text?: string;
  };
}

/**
 * Interface for Poll Create Request
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-create-request-object-structure}
 */
export interface PollCreateRequestEntity {
  /** The question of the poll */
  question: PollMediaEntity & {
    /**
     * The text of the question
     * @maxLength 300
     * @optional
     */
    text?: string;
  };

  /**
   * Each of the answers available in the poll, up to 10
   * @minItems 2
   * @maxItems 10
   */
  answers: Omit<PollAnswerEntity, "answer_id">[];

  /**
   * Number of hours the poll should be open for, up to 32 days
   * Defaults to 24 hours
   * @minimum 1
   * @maximum 768
   */
  duration: number;

  /**
   * Whether a user can select multiple answers
   * Defaults to false
   * @default false
   */
  allow_multiselect: boolean;

  /**
   * The layout type of the poll
   * Defaults to DEFAULT
   * @default 1
   */
  layout_type: LayoutType;
}

/**
 * Interface for Poll Entity
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/poll.md#poll-object-structure}
 */
export interface PollEntity {
  /** The question of the poll */
  question: PollMediaEntity & {
    /**
     * The text of the question
     * @maxLength 300
     * @optional
     */
    text?: string;
  };

  /**
   * Each of the answers available in the poll
   * @minItems 2
   * @maxItems 10
   */
  answers: PollAnswerEntity[];

  /**
   * The time when the poll ends
   * Currently, all polls have an expiry, but this is marked as nullable
   * to support non-expiring polls in the future
   * @nullable
   * @validate Expiry must be a valid ISO8601 timestamp or null
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
