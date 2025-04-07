import type { EmojiEntity } from "./emoji.entity.js";

/**
 * Layout types available for polls.
 * Defines the visual presentation style of polls in Discord.
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  /**
   * The default layout type for polls.
   * Currently the only available layout option.
   * @value 1
   */
  Default = 1,
}

/**
 * Represents the count and status of a poll answer.
 * Contains voting information for a specific poll option.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export interface PollAnswerCountEntity {
  /**
   * The answer_id.
   * Unique identifier for this answer option.
   * @minimum 1
   */
  id: number;

  /**
   * The number of votes for this answer.
   * Count of users who selected this option.
   * @minimum 0
   */
  count: number;

  /**
   * Whether the current user voted for this answer.
   * Indicates if the current user selected this option.
   */
  me_voted: boolean;
}

/**
 * Contains results data for a poll.
 * Includes vote counts and finalization status.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export interface PollResultsEntity {
  /**
   * Whether the votes have been precisely counted.
   * True when the final tally is complete after a poll ends.
   */
  is_finalized: boolean;

  /**
   * The counts for each answer.
   * Array of vote counts for each answer option.
   */
  answer_counts: PollAnswerCountEntity[];
}

/**
 * Represents the content of a poll question or answer.
 * Can contain text and/or emoji elements.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 * @validate Either text or emoji (or both) must be provided
 */
export interface PollMediaEntity {
  /**
   * The text of the field.
   * Max 300 characters for questions, max 55 for answers.
   */
  text?: string;

  /**
   * The emoji of the field.
   * Can be a custom emoji (with id) or default emoji (with name).
   */
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * Represents an answer option in a poll.
 * Contains the answer's content and identifier.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  /**
   * The ID of the answer.
   * Unique identifier for this answer option.
   * @minimum 1
   */
  answer_id: number;

  /**
   * The data of the answer.
   * Content displayed for this answer option.
   */
  poll_media: PollMediaEntity & {
    /**
     * The text of the answer.
     * Displayed text for this option.
     * @maxLength 55
     * @optional
     */
    text?: string;
  };
}

/**
 * Used when creating a new poll.
 * Contains all necessary fields to create a poll on Discord.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-structure}
 */
export interface PollCreateRequestEntity {
  /**
   * The question of the poll.
   * The main prompt that users will respond to.
   */
  question: PollMediaEntity & {
    /**
     * The text of the question.
     * Main text displayed at the top of the poll.
     * @maxLength 300
     * @optional
     */
    text?: string;
  };

  /**
   * Each of the answers available in the poll.
   * The options users can select from when voting.
   * @minItems 2
   * @maxItems 10
   */
  answers: Omit<PollAnswerEntity, "answer_id">[];

  /**
   * Number of hours the poll should be open for.
   * Duration in hours, up to 32 days (768 hours).
   * @minimum 1
   * @maximum 768
   */
  duration: number;

  /**
   * Whether a user can select multiple answers.
   * If true, users can vote for more than one option.
   * @default false
   */
  allow_multiselect: boolean;

  /**
   * The layout type of the poll.
   * Controls the visual presentation of the poll.
   * @default 1
   */
  layout_type: LayoutType;
}

/**
 * Represents a full poll object.
 * Contains all information about a poll, including its question, answers, and results.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-structure}
 */
export interface PollEntity {
  /**
   * The question of the poll.
   * The main prompt displayed at the top of the poll.
   */
  question: PollMediaEntity & {
    /**
     * The text of the question.
     * Main text of the poll prompt.
     * @maxLength 300
     * @optional
     */
    text?: string;
  };

  /**
   * Each of the answers available in the poll.
   * The options users can vote on.
   * @minItems 2
   * @maxItems 10
   */
  answers: PollAnswerEntity[];

  /**
   * The time when the poll ends.
   * ISO8601 timestamp for poll expiration.
   * @nullable
   * @validate Expiry must be a valid ISO8601 timestamp or null
   */
  expiry: string | null;

  /**
   * Whether a user can select multiple answers.
   * Determines if users can vote for multiple options.
   */
  allow_multiselect: boolean;

  /**
   * The layout type of the poll.
   * Defines how the poll is visually presented.
   */
  layout_type: LayoutType;

  /**
   * The results of the poll.
   * Contains voting statistics for each answer.
   * May not be present in certain responses where results are not fetched.
   */
  results?: PollResultsEntity;
}
