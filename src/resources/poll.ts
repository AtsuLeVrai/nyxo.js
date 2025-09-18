import type { EmojiObject } from "./emoji.js";
import type { UserObject } from "./user.js";

export enum LayoutTypes {
  Default = 1,
}

export interface PollMediaObject {
  text?: string;
  emoji?: Pick<EmojiObject, "id"> | Pick<EmojiObject, "name">;
}

export interface PollAnswerObject {
  answer_id: number;
  poll_media: PollMediaObject & {
    text?: string;
  };
}

export interface PollAnswerCountObject {
  id: number;
  count: number;
  me_voted: boolean;
}

export interface PollResultsObject {
  is_finalized: boolean;
  answer_counts: PollAnswerCountObject[];
}

export interface PollObject {
  question: PollMediaObject & {
    text?: string;
  };
  answers: PollAnswerObject[];
  expiry: string | null;
  allow_multiselect: boolean;
  layout_type: LayoutTypes;
  results?: PollResultsObject;
}

export interface PollCreateRequestObject {
  question: PollMediaObject & {
    text?: string;
  };
  answers: { poll_media: PollAnswerObject["poll_media"] }[];
  duration?: number;
  allow_multiselect?: boolean;
  layout_type?: LayoutTypes;
}

export interface GetAnswerVotersQueryStringParams {
  after?: string;
  limit?: number;
}

export interface GetAnswerVotersResponse {
  users: UserObject[];
}

/**
 * Checks if a poll allows multiple selections
 * @param poll The poll to check
 * @returns true if multiple selections are allowed
 */
export function allowsMultiselect(poll: PollObject): boolean {
  return poll.allow_multiselect;
}

/**
 * Checks if a poll has expired
 * @param poll The poll to check
 * @returns true if the poll has expired
 */
export function isPollExpired(poll: PollObject): boolean {
  if (!poll.expiry) return false;
  return new Date() > new Date(poll.expiry);
}

/**
 * Checks if poll results are finalized
 * @param poll The poll to check
 * @returns true if results are finalized
 */
export function arePollResultsFinalized(poll: PollObject): boolean {
  return poll.results?.is_finalized ?? false;
}

/**
 * Gets the total vote count for a poll
 * @param poll The poll to count votes for
 * @returns total number of votes across all answers
 */
export function getTotalVoteCount(poll: PollObject): number {
  return poll.results?.answer_counts.reduce((sum, count) => sum + count.count, 0) ?? 0;
}

/**
 * Checks if the current user voted for a specific answer
 * @param poll The poll to check
 * @param answerId The answer ID to check
 * @returns true if the current user voted for this answer
 */
export function didCurrentUserVoteForAnswer(poll: PollObject, answerId: number): boolean {
  const answerCount = poll.results?.answer_counts.find((count) => count.id === answerId);
  return answerCount?.me_voted ?? false;
}

/**
 * Gets the answer with the most votes
 * @param poll The poll to analyze
 * @returns the answer with the highest vote count, or null if no results
 */
export function getWinningAnswer(poll: PollObject): PollAnswerCountObject | null {
  if (!poll.results?.answer_counts.length) return null;

  return poll.results.answer_counts.reduce((winner, current) =>
    current.count > winner.count ? current : winner,
  );
}
