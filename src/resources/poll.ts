import type { EmojiObject } from "./emoji.js";

export enum PollLayoutType {
  Default = 1,
}

export interface PollMediaObject {
  text?: string;
  emoji?: Partial<EmojiObject>;
}

export interface PollAnswerObject {
  answer_id: number;
  poll_media: PollMediaObject;
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
  question: PollMediaObject;
  answers: PollAnswerObject[];
  expiry: string | null;
  allow_multiselect: boolean;
  layout_type: PollLayoutType;
  results?: PollResultsObject;
}

export interface PollCreateRequestObject {
  question: PollMediaObject;
  answers: PollAnswerObject[];
  duration?: number;
  allow_multiselect?: boolean;
  layout_type?: PollLayoutType;
}
