import type { EmojiEntity } from "./emoji.entity.js";

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
export interface PollAnswerCountEntity {
  /** The answer_id */
  id: number;

  /** The number of votes for this answer */
  count: number;

  /** Whether the current user voted for this answer */
  me_voted: boolean;
}

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
export interface PollMediaEntity {
  /** The text of the field (max 300 characters for questions, max 55 for answers) */
  text?: string;

  /** The emoji of the field (custom or default emoji) */
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * Represents an answer option in a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  /** The ID of the answer */
  answer_id: number;

  /** The data of the answer */
  poll_media: PollMediaEntity & { text?: string };
}

/**
 * Represents the request object used when creating a poll.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export interface PollCreateRequestEntity {
  /** The question of the poll */
  question: PollMediaEntity;

  /** Each of the answers available in the poll, up to 10 */
  answers: Omit<PollAnswerEntity, "answer_id">[];

  /**
   * Number of hours the poll should be open for, up to 32 days
   * Defaults to 24 hours
   */
  duration: number;

  /**
   * Whether a user can select multiple answers
   * Defaults to false
   */
  allow_multiselect: boolean;

  /**
   * The layout type of the poll
   * Defaults to DEFAULT
   */
  layout_type: LayoutType;
}

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
