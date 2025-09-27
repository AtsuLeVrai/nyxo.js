import type { EmojiObject } from "./emoji.js";
import type { UserObject } from "./user.js";

/**
 * Visual layout options for poll display within Discord messages.
 * Designed for future extensibility to support different poll presentation styles.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type} for layout type specification
 */
export enum LayoutTypes {
  /** Standard poll layout with vertical answer arrangement */
  Default = 1,
}

/**
 * Media content for poll questions and answers supporting text and emoji display.
 * Extensible structure designed to accommodate future rich media types.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object} for poll media specification
 */
export interface PollMediaObject {
  /** Text content (max 300 chars for questions, 55 chars for answers) */
  readonly text?: string;
  /** Emoji decoration using either custom emoji ID or unicode name */
  readonly emoji?: Pick<EmojiObject, "id"> | Pick<EmojiObject, "name">;
}

/**
 * Individual poll answer choice with unique identifier and media content.
 * Represents one selectable option within a poll with visual elements.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object} for poll answer specification
 */
export interface PollAnswerObject {
  /** Unique numeric identifier for this answer (starts at 1, sequential) */
  readonly answer_id: number;
  /** Display content including text and optional emoji */
  readonly poll_media: PollMediaObject;
}

/**
 * Vote count statistics for a specific poll answer including user participation.
 * Tracks voting metrics and current user's participation status.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure} for answer count specification
 */
export interface PollAnswerCountObject {
  /** Answer identifier corresponding to PollAnswerObject.answer_id */
  readonly id: number;
  /** Total number of votes received for this answer */
  readonly count: number;
  /** Whether the current user voted for this answer */
  readonly me_voted: boolean;
}

/**
 * Aggregated voting results for a poll including finalization status.
 * Contains vote counts per answer with accuracy guarantees after poll completion.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object} for poll results specification
 */
export interface PollResultsObject {
  /** Whether vote counting has been finalized with accurate tallying */
  readonly is_finalized: boolean;
  /** Vote statistics for each poll answer */
  readonly answer_counts: PollAnswerCountObject[];
}

/**
 * Complete poll entity containing question, answers, settings, and optional results.
 * Represents an interactive voting mechanism within Discord messages.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object} for poll object specification
 */
export interface PollObject {
  /** Poll question content (text only supported currently) */
  readonly question: Pick<PollMediaObject, "text">;
  /** Available answer choices (maximum 10 answers) */
  readonly answers: PollAnswerObject[];
  /** Poll expiration timestamp (nullable for future non-expiring polls) */
  readonly expiry: string | null;
  /** Whether users can select multiple answers */
  readonly allow_multiselect: boolean;
  /** Visual layout style for poll presentation */
  readonly layout_type: LayoutTypes;
  /** Vote tallies and statistics (may be absent in some responses) */
  readonly results?: PollResultsObject;
}

/**
 * Request parameters for creating new polls via Discord API endpoints.
 * Similar to PollObject but uses duration instead of expiry timestamp.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object} for poll creation specification
 */
export interface PollCreateRequestObject {
  /** Poll question content (text only supported currently) */
  readonly question: Pick<PollMediaObject, "text">;
  /** Available answer choices (maximum 10 answers) */
  readonly answers: PollAnswerObject[];
  /** Poll duration in hours (max 32 days, default 24 hours) */
  readonly duration?: number;
  /** Whether users can select multiple answers (default false) */
  readonly allow_multiselect?: boolean;
  /** Visual layout style for poll presentation (default DEFAULT) */
  readonly layout_type?: LayoutTypes;
}

/**
 * Query parameters for paginating through users who voted for a specific poll answer.
 * Supports cursor-based pagination for voter list retrieval.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters} for get voters endpoint
 */
export interface GetAnswerVotersQueryStringParams {
  /** Get users after this user ID for pagination */
  readonly after?: string;
  /** Maximum number of users to return (1-100, default 25) */
  readonly limit?: number;
}

/**
 * Response structure containing users who voted for a specific poll answer.
 * Provides user details for poll participation analysis and moderation.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#get-answer-voters} for get voters response
 */
export interface GetAnswerVotersResponse {
  /** Array of users who voted for the specified answer */
  readonly users: UserObject[];
}
