import type { Integer, Iso8601Timestamp } from "../types";
import type { EmojiStructure } from "./emojis";

/**
 * Type representing the structure of a poll answer count.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure|Poll Answer Count Object Structure}
 */
export type PollAnswerCountStructure = {
    /**
     * The number of votes for this answer
     */
    count: Integer;
    /**
     * The answer ID
     */
    id: Integer;
    /**
     * Whether the current user voted for this answer
     */
    me_voted: boolean;
};

/**
 * Type representing the structure of poll results.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure|Poll Results Object Structure}
 */
export type PollResultsStructure = {
    /**
     * The counts for each answer
     */
    answer_counts: PollAnswerCountStructure[];
    /**
     * Whether the votes have been precisely counted
     */
    is_finalized: boolean;
};

/**
 * Type representing the structure of poll media.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure|Poll Media Object Structure}
 */
export type PollMediaStructure = {
    /**
     * The emoji of the field
     */
    emoji?: Pick<EmojiStructure, "id" | "name">;
    /**
     * The text of the field
     */
    text?: string;
};

/**
 * Type representing the structure of a poll answer.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure|Poll Answer Object Structure}
 */
export type PollAnswerStructure = {
    /**
     * The ID of the answer
     */
    answer_id: Integer;
    /**
     * The data of the answer
     */
    poll_media: PollMediaStructure;
};

/**
 * Enumeration representing poll layout types.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-types|Poll Layout Types}
 */
export enum PollLayoutTypes {
    /**
     * The default layout type.
     */
    Default = 1,
}

/**
 * Type representing the structure of a poll create request.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure|Poll Create Request Object Structure}
 */
export type PollCreateRequestStructure = {
    /**
     * Whether a user can select multiple answers. Defaults to false.
     */
    allow_multiselect?: boolean;
    /**
     * Each of the answers available in the poll, up to 10.
     */
    answers: PollAnswerStructure[];
    /**
     * Number of hours the poll should be open for, up to 32 days. Defaults to 24.
     */
    duration?: Integer;
    /**
     * The layout type of the poll. Defaults to Default.
     */
    layout_type?: PollLayoutTypes;
    /**
     * The question of the poll. Only text is supported.
     */
    question: PollMediaStructure;
};

/**
 * Type representing the structure of a poll.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure|Poll Object Structure}
 */
export type PollStructure = {
    /**
     * Whether a user can select multiple answers
     */
    allow_multiselect: boolean;
    /**
     * Each of the answers available in the poll.
     */
    answers: PollAnswerStructure[];
    /**
     * The time when the poll ends.
     */
    expiry: Iso8601Timestamp | null;
    /**
     * The layout type of the poll
     */
    layout_type: PollLayoutTypes;
    /**
     * The question of the poll. Only text is supported.
     */
    question: PollMediaStructure;
    /**
     * The results of the poll
     */
    results?: PollResultsStructure;
};
