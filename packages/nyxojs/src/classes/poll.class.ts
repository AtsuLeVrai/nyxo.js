import type { MessagePollVoteEntity } from "@nyxojs/gateway";
import type { PollVotersFetchParams } from "@nyxojs/rest";
import { BaseClass } from "../bases/index.js";
import type { Enforce, PropsToCamel } from "../types/index.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Message Poll Vote, providing methods to interact with poll voting events.
 *
 * The MessagePollVote class serves as a wrapper around Discord's Poll Vote Gateway events,
 * which track when users vote on or remove votes from message polls. It provides:
 * - Access to vote information (user, answer, channel, etc.)
 * - Methods to fetch related data like poll messages and voters
 * - Utilities for tracking and analyzing poll participation
 *
 * This is primarily used in the message_poll_vote_add and message_poll_vote_remove Gateway events.
 *
 * @see {@link https://discord.com/developers/docs/resources/poll}
 */
export class MessagePollVote
  extends BaseClass<MessagePollVoteEntity>
  implements Enforce<PropsToCamel<MessagePollVoteEntity>>
{
  /**
   * Gets the ID of the user who voted or removed their vote.
   *
   * This identifies which user participated in the poll.
   *
   * @returns The user's ID as a Snowflake string
   */
  readonly userId = this.rawData.user_id;

  /**
   * Gets the ID of the channel containing the poll message.
   *
   * This identifies which channel contains the poll.
   *
   * @returns The channel's ID as a Snowflake string
   */
  readonly channelId = this.rawData.channel_id;

  /**
   * Gets the ID of the message containing the poll.
   *
   * This identifies which message contains the poll.
   *
   * @returns The message's ID as a Snowflake string
   */
  readonly messageId = this.rawData.message_id;

  /**
   * Gets the ID of the guild containing the message.
   *
   * This identifies which guild the poll belongs to, if applicable.
   * May be undefined for polls in DM channels.
   *
   * @returns The guild's ID as a Snowflake string, or undefined for DMs
   */
  readonly guildId = this.rawData.guild_id;

  /**
   * Gets the ID of the poll answer that was selected or deselected.
   *
   * This corresponds to the position of the answer in the poll options array.
   *
   * @returns The answer ID as a number
   */
  readonly answerId = this.rawData.answer_id;

  /**
   * Fetches the message containing the poll.
   *
   * @returns A promise resolving to the Message object containing the poll
   * @throws Error if the message couldn't be fetched
   */
  async fetchPollMessage(): Promise<Message> {
    const messageData = await this.client.rest.messages.fetchMessage(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, messageData);
  }

  /**
   * Fetches the list of users who voted for the same poll answer.
   *
   * @param params - Query parameters for pagination
   * @returns A promise resolving to an array of users who voted for this answer
   * @throws Error if the voters couldn't be fetched
   */
  async fetchVoters(params?: PollVotersFetchParams) {
    const response = await this.client.rest.polls.fetchAnswerVoters(
      this.channelId,
      this.messageId,
      this.answerId,
      params,
    );

    return response.users.map((userData) => new User(this.client, userData));
  }

  /**
   * Ends the poll immediately.
   *
   * Requires being the poll creator or having MANAGE_MESSAGES permission.
   *
   * @returns A promise resolving to the updated Message with the ended poll
   * @throws Error if the poll couldn't be ended
   */
  async endPoll(): Promise<Message> {
    const messageData = await this.client.rest.polls.endPoll(
      this.channelId,
      this.messageId,
    );

    return new Message(this.client, messageData);
  }
}
