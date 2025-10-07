import type { EmojiObject } from "./emoji.js";
import type { UserObject } from "./user.js";

export enum LayoutTypes {
  Default = 1,
}

export interface PollMediaObject {
  readonly text?: string;

  readonly emoji?: Pick<EmojiObject, "id"> | Pick<EmojiObject, "name">;
}

export interface PollAnswerObject {
  readonly answer_id: number;

  readonly poll_media: PollMediaObject;
}

export interface PollAnswerCountObject {
  readonly id: number;

  readonly count: number;

  readonly me_voted: boolean;
}

export interface PollResultsObject {
  readonly is_finalized: boolean;

  readonly answer_counts: PollAnswerCountObject[];
}

export interface PollObject {
  readonly question: Pick<PollMediaObject, "text">;

  readonly answers: PollAnswerObject[];

  readonly expiry: string | null;

  readonly allow_multiselect: boolean;

  readonly layout_type: LayoutTypes;

  readonly results?: PollResultsObject;
}

export interface PollCreateRequestObject {
  readonly question: Pick<PollMediaObject, "text">;

  readonly answers: PollAnswerObject[];

  readonly duration?: number;

  readonly allow_multiselect?: boolean;

  readonly layout_type?: LayoutTypes;
}

export interface GetAnswerVotersQueryStringParams {
  readonly after?: string;

  readonly limit?: number;
}

export interface GetAnswerVotersResponse {
  readonly users: UserObject[];
}
