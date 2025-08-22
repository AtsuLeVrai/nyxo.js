import type { Snowflake } from "../common/index.js";
import type { EndpointFactory } from "../utils/index.js";
import type { EmojiObject } from "./emoji.js";
import type { MessageObject } from "./message.js";
import type { UserObject } from "./user.js";

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

// Poll Request Interfaces
export interface GetAnswerVotersQuery {
  after?: Snowflake;
  limit?: number;
}

export interface GetAnswerVotersResponse {
  users: UserObject[];
}

export const PollRoutes = {
  // GET /channels/{channel.id}/polls/{message.id}/answers/{answer_id} - Get Answer Voters
  getAnswerVoters: ((channelId: Snowflake, messageId: Snowflake, answerId: number) =>
    `/channels/${channelId}/polls/${messageId}/answers/${answerId}`) as EndpointFactory<
    `/channels/${string}/polls/${string}/answers/${number}`,
    ["GET"],
    GetAnswerVotersResponse,
    false,
    false,
    undefined,
    GetAnswerVotersQuery
  >,

  // POST /channels/{channel.id}/polls/{message.id}/expire - End Poll
  endPoll: ((channelId: Snowflake, messageId: Snowflake) =>
    `/channels/${channelId}/polls/${messageId}/expire`) as EndpointFactory<
    `/channels/${string}/polls/${string}/expire`,
    ["POST"],
    MessageObject
  >,
} as const satisfies Record<string, EndpointFactory<any, any, any, any, any, any, any, any>>;
