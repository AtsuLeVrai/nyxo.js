import type { Integer, Iso8601 } from "../formatting/index.js";
import type { EmojiEntity } from "./emoji.js";

/**
 * Represents the count of votes for a specific answer in a poll.
 *
 * @remarks
 * Contains information about the number of votes an answer received and whether
 * the current user voted for it.
 *
 * @example
 * ```typescript
 * const answerCount: PollAnswerCountEntity = {
 *   id: 1,
 *   count: 42,
 *   me_voted: true
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export interface PollAnswerCountEntity {
  /** The answer_id */
  id: Integer;
  /** The number of votes for this answer */
  count: Integer;
  /** Whether the current user voted for this answer */
  me_voted: boolean;
}

/**
 * Represents the results of a poll.
 *
 * @remarks
 * Contains information about whether the poll results are finalized and
 * the vote counts for each answer. Results may not be perfectly accurate
 * while a poll is in progress, but become accurate once finalized.
 *
 * @example
 * ```typescript
 * const results: PollResultsEntity = {
 *   is_finalized: true,
 *   answer_counts: [
 *     { id: 1, count: 42, me_voted: true },
 *     { id: 2, count: 28, me_voted: false }
 *   ]
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export interface PollResultsEntity {
  /** Whether the votes have been precisely counted */
  is_finalized: boolean;
  /** The counts for each answer */
  answer_counts: PollAnswerCountEntity[];
}

/**
 * Represents media content for a poll question or answer.
 *
 * @remarks
 * Can contain text and/or emoji. Questions currently only support text,
 * while answers can have an optional emoji. When creating a poll answer with
 * an emoji, only send either the id (custom emoji) or name (default emoji).
 *
 * @example
 * ```typescript
 * const questionMedia: PollMediaEntity = {
 *   text: "What's your favorite color?"
 * };
 *
 * const answerMedia: PollMediaEntity = {
 *   text: "Blue",
 *   emoji: { name: "🔵" }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export interface PollMediaEntity {
  /** The text content. Max 300 chars for questions, 55 for answers */
  text?: string;
  /** The emoji for the field (only one field should be set) */
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * Represents an answer option in a poll.
 *
 * @remarks
 * Contains an ID and media content for the answer. While answer_ids currently
 * start at 1 and increment sequentially, this behavior should not be relied upon.
 *
 * @example
 * ```typescript
 * const answer: PollAnswerEntity = {
 *   answer_id: 1,
 *   poll_media: {
 *     text: "Yes",
 *     emoji: { name: "✅" }
 *   }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  /** The ID of the answer */
  answer_id: Integer;
  /** The content of the answer */
  poll_media: PollMediaEntity;
}

/**
 * Represents the available layout types for polls.
 *
 * @remarks
 * Currently only supports a default layout, but may support more in the future.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  /** The default layout type */
  Default = 1,
}

/**
 * Represents the data needed to create a new poll.
 *
 * @remarks
 * Similar to PollEntity but uses duration instead of expiry. Duration is converted
 * to an expiry timestamp when the poll is created.
 *
 * @example
 * ```typescript
 * const pollRequest: PollCreateRequestEntity = {
 *   question: { text: "What's your favorite color?" },
 *   answers: [
 *     { answer_id: 1, poll_media: { text: "Blue", emoji: { name: "🔵" } } },
 *     { answer_id: 2, poll_media: { text: "Red", emoji: { name: "🔴" } } }
 *   ],
 *   duration: 24,
 *   allow_multiselect: false,
 *   layout_type: LayoutType.Default
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export interface PollCreateRequestEntity {
  /** The question of the poll */
  question: PollMediaEntity;
  /** List of up to 10 possible answers */
  answers: PollAnswerEntity[];
  /** Number of hours the poll should be open for (up to 32 days) */
  duration?: Integer;
  /** Whether users can select multiple answers */
  allow_multiselect?: boolean;
  /** The layout type of the poll */
  layout_type?: LayoutType;
}

/**
 * Represents a Discord poll.
 *
 * @remarks
 * A poll allows users to vote on a question with multiple possible answers.
 * Polls have an expiration time, can optionally allow multiple selections,
 * and track vote counts for each answer.
 *
 * @example
 * ```typescript
 * const poll: PollEntity = {
 *   question: { text: "What's your favorite color?" },
 *   answers: [
 *     { answer_id: 1, poll_media: { text: "Blue", emoji: { name: "🔵" } } },
 *     { answer_id: 2, poll_media: { text: "Red", emoji: { name: "🔴" } } }
 *   ],
 *   expiry: "2024-12-31T23:59:59.999Z",
 *   allow_multiselect: false,
 *   layout_type: LayoutType.Default,
 *   results: {
 *     is_finalized: false,
 *     answer_counts: [
 *       { id: 1, count: 42, me_voted: true },
 *       { id: 2, count: 28, me_voted: false }
 *     ]
 *   }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export interface PollEntity {
  /** The question of the poll */
  question: PollMediaEntity;
  /** The available answers */
  answers: PollAnswerEntity[];
  /** When the poll ends */
  expiry: Iso8601 | null;
  /** Whether users can select multiple answers */
  allow_multiselect: boolean;
  /** The layout type of the poll */
  layout_type: LayoutType;
  /** The current results of the poll */
  results?: PollResultsEntity;
}
