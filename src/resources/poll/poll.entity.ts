import type { EmojiEntity } from "../emoji/index.js";

/**
 * @description Layout types for Discord polls determining visual presentation style.
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  /**
   * @description Standard poll layout with default visual styling.
   */
  Default = 1,
}

/**
 * @description Vote count information for a specific poll answer including user participation status.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export interface PollAnswerCountEntity {
  /**
   * @description Answer ID corresponding to the poll answer being counted.
   */
  id: number;
  /**
   * @description Total number of votes received for this answer.
   */
  count: number;
  /**
   * @description Whether the current user has voted for this specific answer.
   */
  me_voted: boolean;
}

/**
 * @description Aggregated voting results for a Discord poll with finalization status and answer counts.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export interface PollResultsEntity {
  /**
   * @description Whether the vote count has been precisely tallied after poll completion.
   */
  is_finalized: boolean;
  /**
   * @description Vote counts for each poll answer (missing entries indicate zero votes).
   */
  answer_counts: PollAnswerCountEntity[];
}

/**
 * @description Media content for poll questions and answers supporting text and emoji display.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export interface PollMediaEntity {
  /**
   * @description Text content (max 300 chars for questions, 55 chars for answers).
   */
  text?: string;
  /**
   * @description Emoji for visual enhancement (custom emoji by ID or standard emoji by name).
   */
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * @description Individual poll answer option with unique identifier and media content.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  /**
   * @description Unique identifier for this answer option (starts at 1, sequential).
   */
  answer_id: number;
  /**
   * @description Media content for this answer including text and optional emoji.
   */
  poll_media: PollMediaEntity & {
    text?: string;
  };
}

/**
 * @description Request parameters for creating new Discord polls with duration and configuration options.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export interface PollCreateRequestEntity {
  /**
   * @description Poll question content (text required, max 300 characters).
   */
  question: PollMediaEntity & {
    text?: string;
  };
  /**
   * @description Available answer options (max 10 answers per poll).
   */
  answers: { poll_media: PollAnswerEntity["poll_media"] }[];
  /**
   * @description Poll duration in hours (max 32 days, defaults to 24 hours).
   */
  duration: number;
  /**
   * @description Whether users can select multiple answers (defaults to false).
   */
  allow_multiselect: boolean;
  /**
   * @description Visual layout type for poll presentation (defaults to DEFAULT).
   */
  layout_type: LayoutType;
}

/**
 * @description Complete Discord poll object with question, answers, timing, and optional results.
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export interface PollEntity {
  /**
   * @description Poll question content with text (required for questions).
   */
  question: PollMediaEntity & {
    text?: string;
  };
  /**
   * @description All available answer options for this poll.
   */
  answers: PollAnswerEntity[];
  /**
   * @description ISO8601 timestamp when poll expires (nullable for future non-expiring polls).
   */
  expiry: string | null;
  /**
   * @description Whether multiple answer selection is permitted.
   */
  allow_multiselect: boolean;
  /**
   * @description Visual layout style for poll display.
   */
  layout_type: LayoutType;
  /**
   * @description Vote tallies and finalization status (may be absent during result calculation).
   */
  results?: PollResultsEntity;
}
