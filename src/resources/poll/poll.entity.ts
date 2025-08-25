import type { EmojiEntity } from "../emoji/index.js";

export enum LayoutType {
  Default = 1,
}

export interface PollAnswerCountEntity {
  id: number;
  count: number;
  me_voted: boolean;
}

export interface PollResultsEntity {
  is_finalized: boolean;
  answer_counts: PollAnswerCountEntity[];
}

export interface PollMediaEntity {
  text?: string;
  emoji?: Pick<EmojiEntity, "id"> | Pick<EmojiEntity, "name">;
}

export interface PollAnswerEntity {
  answer_id: number;
  poll_media: PollMediaEntity & {
    text?: string;
  };
}

export interface PollCreateRequestEntity {
  question: PollMediaEntity & {
    text?: string;
  };
  answers: { poll_media: PollAnswerEntity["poll_media"] }[];
  duration: number;
  allow_multiselect: boolean;
  layout_type: LayoutType;
}

export interface PollEntity {
  question: PollMediaEntity & {
    text?: string;
  };
  answers: PollAnswerEntity[];
  expiry: string | null;
  allow_multiselect: boolean;
  layout_type: LayoutType;
  results?: PollResultsEntity;
}
