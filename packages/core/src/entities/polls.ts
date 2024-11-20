import type { Integer, Iso8601 } from "../formatting/index.js";
import type { EmojiEntity } from "./emojis.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-answer-count-object-structure}
 */
export interface PollAnswerCountEntity {
  id: Integer;
  count: Integer;
  me_voted: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-results-object-poll-results-object-structure}
 */
export interface PollResultsEntity {
  is_finalized: boolean;
  answer_counts: PollAnswerCountEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-media-object-poll-media-object-structure}
 */
export interface PollMediaEntity {
  text?: string;
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-answer-object-poll-answer-object-structure}
 */
export interface PollAnswerEntity {
  answer_id: Integer;
  poll_media: PollMediaEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#layout-type}
 */
export enum LayoutType {
  Default = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-create-request-object-poll-create-request-object-structure}
 */
export interface PollCreateRequest {
  question: PollMediaEntity;
  answers: PollAnswerEntity[];
  duration?: Integer;
  allow_multiselect?: boolean;
  layout_type?: LayoutType;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/poll#poll-object-poll-object-structure}
 */
export interface PollEntity {
  question: PollMediaEntity;
  answers: PollAnswerEntity[];
  expiry: Iso8601 | null;
  allow_multiselect: boolean;
  layout_type: LayoutType;
  results?: PollResultsEntity;
}
