import type { Integer, Iso8601 } from "@nyxjs/core";
import type { EmojiStructure } from "./emojis";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export type PollAnswerCountStructure = {
	/**
	 * The number of votes for this answer
	 */
	count: Integer;
	/**
	 * The answer_id
	 */
	id: Integer;
	/**
	 * Whether the current user voted for this answer
	 */
	me_voted: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export type PollMediaStructure = {
	/**
	 * The emoji of the field
	 */
	emoji?: Pick<EmojiStructure, "id"> | Pick<EmojiStructure, "name">;
	/**
	 * The text of the field
	 */
	text?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
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
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum PollLayoutTypes {
	/**
	 * The, uhm, default layout type.
	 */
	Default = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export type PollCreateRequestStructure = {
	/**
	 * Whether a user can select multiple answers. Defaults to false
	 */
	allow_multiselect?: boolean;
	/**
	 * Each of the answers available in the poll, up to 10
	 */
	answers: PollAnswerStructure[];
	/**
	 * Number of hours the poll should be open for, up to 32 days. Defaults to 24
	 */
	duration?: Integer;
	/**
	 * The layout type of the poll. Defaults to... DEFAULT!
	 */
	layout_type?: PollLayoutTypes;
	/**
	 * The question of the poll. Only text is supported.
	 */
	question: PollMediaStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export type PollStructure = {
	/**
	 * Whether a user can select multiple answers
	 */
	allow_multiselect: boolean;
	/**
	 * The answers available in the poll
	 */
	answers: PollAnswerStructure[];
	/**
	 * The time when the poll ends
	 */
	expiry: Iso8601 | null;
	/**
	 * The layout type of the poll
	 */
	layout_type: PollLayoutTypes;
	/**
	 * The question of the poll
	 */
	question: PollMediaStructure;
	/**
	 * The results of the poll
	 */
	results?: PollResultsStructure;
};
