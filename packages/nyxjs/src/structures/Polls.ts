import type {
    EmojiStructure,
    Integer,
    Iso8601Timestamp,
    PollAnswerCountStructure,
    PollAnswerStructure,
    PollCreateRequestStructure,
    PollLayoutTypes,
    PollMediaStructure,
    PollResultsStructure,
    PollStructure,
    Snowflake,
} from "@nyxjs/core";
import type { MessagePollVoteAddFields, MessagePollVoteRemoveFields } from "@nyxjs/gateway";
import type { PickWithMethods } from "../types/index.js";
import { Base } from "./Base.js";
import { Emoji } from "./Emojis.js";

export interface PollAnswerCountSchema {
    readonly count: Integer;
    readonly id: Integer;
    readonly meVoted: boolean;
}

export class PollAnswerCount
    extends Base<PollAnswerCountStructure, PollAnswerCountSchema>
    implements PollAnswerCountSchema
{
    #count: Integer = 0;
    #id: Integer = 0;
    #meVoted = false;

    constructor(data: Partial<PollAnswerCountStructure>) {
        super();
        this.patch(data);
    }

    get count(): Integer {
        return this.#count;
    }

    get id(): Integer {
        return this.#id;
    }

    get meVoted(): boolean {
        return this.#meVoted;
    }

    static from(data: Partial<PollAnswerCountStructure>): PollAnswerCount {
        return new PollAnswerCount(data);
    }

    patch(data: Partial<PollAnswerCountStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#count = data.count ?? this.#count;
        this.#id = data.id ?? this.#id;
        this.#meVoted = Boolean(data.me_voted ?? this.#meVoted);
    }

    toJson(): Partial<PollAnswerCountStructure> {
        return {
            count: this.#count,
            id: this.#id,
            me_voted: this.#meVoted,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollAnswerCountSchema {
        return {
            count: this.#count,
            id: this.#id,
            meVoted: this.#meVoted,
        };
    }

    clone(): PollAnswerCount {
        return new PollAnswerCount(this.toJson());
    }

    reset(): void {
        this.#count = 0;
        this.#id = 0;
        this.#meVoted = false;
    }

    equals(other: Partial<PollAnswerCount>): boolean {
        return Boolean(this.#count === other.count && this.#id === other.id && this.#meVoted === other.meVoted);
    }
}

export interface PollResultsSchema {
    readonly answerCounts: PollAnswerCount[];
    readonly isFinalized: boolean;
}

export class PollResults extends Base<PollResultsStructure, PollResultsSchema> implements PollResultsSchema {
    #answerCounts: PollAnswerCount[] = [];
    #isFinalized = false;

    constructor(data: Partial<PollResultsStructure>) {
        super();
        this.patch(data);
    }

    get answerCounts(): PollAnswerCount[] {
        return [...this.#answerCounts];
    }

    get isFinalized(): boolean {
        return this.#isFinalized;
    }

    get totalVotes(): number {
        return this.#answerCounts.reduce((sum, answer) => sum + answer.count, 0);
    }

    get hasVotes(): boolean {
        return this.totalVotes > 0;
    }

    static from(data: Partial<PollResultsStructure>): PollResults {
        return new PollResults(data);
    }

    getVotePercentage(answerId: Integer): number {
        const total = this.totalVotes;
        if (total === 0) {
            return 0;
        }

        const answer = this.#answerCounts.find((a) => a.id === answerId);
        return answer ? (answer.count / total) * 100 : 0;
    }

    patch(data: Partial<PollResultsStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        if (Array.isArray(data.answer_counts)) {
            this.#answerCounts = data.answer_counts.map((count) => PollAnswerCount.from(count));
        }

        this.#isFinalized = Boolean(data.is_finalized ?? this.#isFinalized);
    }

    toJson(): Partial<PollResultsStructure> {
        return {
            answer_counts: this.#answerCounts.map((count) => count.toJson()) as PollAnswerCountStructure[],
            is_finalized: this.#isFinalized,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollResultsSchema {
        return {
            answerCounts: [...this.#answerCounts],
            isFinalized: this.#isFinalized,
        };
    }

    clone(): PollResults {
        return new PollResults(this.toJson());
    }

    reset(): void {
        this.#answerCounts = [];
        this.#isFinalized = false;
    }

    equals(other: Partial<PollResults>): boolean {
        return Boolean(
            this.#answerCounts.length === other.answerCounts?.length &&
                this.#answerCounts.every((count, index) => count.equals(other.answerCounts?.[index] ?? count)) &&
                this.#isFinalized === other.isFinalized,
        );
    }
}

export interface PollMediaSchema {
    readonly emoji: PickWithMethods<Emoji, "id" | "name"> | null;
    readonly text: string | null;
}

export class PollMedia extends Base<PollMediaStructure, PollMediaSchema> implements PollMediaSchema {
    #emoji: PickWithMethods<Emoji, "id" | "name"> | null = null;
    #text: string | null = null;

    constructor(data: Partial<PollMediaStructure>) {
        super();
        this.patch(data);
    }

    get emoji(): PickWithMethods<Emoji, "id" | "name"> | null {
        return this.#emoji;
    }

    get text(): string | null {
        return this.#text;
    }

    get displayText(): string {
        return this.#text ?? this.#emoji?.name ?? "";
    }

    static from(data: Partial<PollMediaStructure>): PollMedia {
        return new PollMedia(data);
    }

    patch(data: Partial<PollMediaStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#emoji = data.emoji ? Emoji.from(data.emoji) : this.#emoji;
        this.#text = data.text ?? this.#text;
    }

    toJson(): Partial<PollMediaStructure> {
        return {
            emoji: this.#emoji?.toJson() as EmojiStructure,
            text: this.#text ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollMediaSchema {
        return {
            emoji: this.#emoji,
            text: this.#text,
        };
    }

    clone(): PollMedia {
        return new PollMedia(this.toJson());
    }

    reset(): void {
        this.#emoji = null;
        this.#text = null;
    }

    equals(other: Partial<PollMedia>): boolean {
        return Boolean(this.#emoji?.equals(other.emoji ?? {}) && this.#text === other.text);
    }
}

export interface PollAnswerSchema {
    readonly answerId: Integer | null;
    readonly pollMedia: PollMedia | null;
}

export class PollAnswer extends Base<PollAnswerStructure, PollAnswerSchema> implements PollAnswerSchema {
    #answerId: Integer | null = null;
    #pollMedia: PollMedia | null = null;

    constructor(data: Partial<PollAnswerStructure>) {
        super();
        this.patch(data);
    }

    get answerId(): Integer | null {
        return this.#answerId;
    }

    get pollMedia(): PollMedia | null {
        return this.#pollMedia;
    }

    get displayText(): string {
        return this.#pollMedia?.displayText ?? "";
    }

    static from(data: Partial<PollAnswerStructure>): PollAnswer {
        return new PollAnswer(data);
    }

    patch(data: Partial<PollAnswerStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#answerId = data.answer_id ?? this.#answerId;
        this.#pollMedia = data.poll_media ? PollMedia.from(data.poll_media) : this.#pollMedia;
    }

    toJson(): Partial<PollAnswerStructure> {
        return {
            answer_id: this.#answerId ?? undefined,
            poll_media: this.#pollMedia?.toJson(),
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollAnswerSchema {
        return {
            answerId: this.#answerId,
            pollMedia: this.#pollMedia,
        };
    }

    clone(): PollAnswer {
        return new PollAnswer(this.toJson());
    }

    reset(): void {
        this.#answerId = null;
        this.#pollMedia = null;
    }

    equals(other: Partial<PollAnswer>): boolean {
        return Boolean(this.#answerId === other.answerId && this.#pollMedia?.equals(other.pollMedia ?? {}));
    }
}

export interface PollCreateRequestSchema {
    readonly allowMultiselect: boolean;
    readonly answers: PollAnswer[];
    readonly duration: Integer | null;
    readonly layoutType: PollLayoutTypes | null;
    readonly question: PollMedia | null;
}

export class PollCreateRequest
    extends Base<PollCreateRequestStructure, PollCreateRequestSchema>
    implements PollCreateRequestSchema
{
    #allowMultiselect = false;
    #answers: PollAnswer[] = [];
    #duration: Integer | null = null;
    #layoutType: PollLayoutTypes | null = null;
    #question: PollMedia | null = null;

    constructor(data: Partial<PollCreateRequestStructure>) {
        super();
        this.patch(data);
    }

    get allowMultiselect(): boolean {
        return this.#allowMultiselect;
    }

    get answers(): PollAnswer[] {
        return [...this.#answers];
    }

    get duration(): Integer | null {
        return this.#duration;
    }

    get layoutType(): PollLayoutTypes | null {
        return this.#layoutType;
    }

    get question(): PollMedia | null {
        return this.#question;
    }

    static from(data: Partial<PollCreateRequestStructure>): PollCreateRequest {
        return new PollCreateRequest(data);
    }

    patch(data: Partial<PollCreateRequestStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#allowMultiselect = Boolean(data.allow_multiselect ?? this.#allowMultiselect);

        if (Array.isArray(data.answers)) {
            this.#answers = data.answers.map((answer) => PollAnswer.from(answer));
        }

        this.#duration = data.duration ?? this.#duration;
        this.#layoutType = data.layout_type ?? this.#layoutType;
        this.#question = data.question ? PollMedia.from(data.question) : this.#question;
    }

    toJson(): Partial<PollCreateRequestStructure> {
        return {
            allow_multiselect: this.#allowMultiselect,
            answers: this.#answers.map((answer) => answer.toJson()) as PollAnswerStructure[],
            duration: this.#duration ?? undefined,
            layout_type: this.#layoutType ?? undefined,
            question: this.#question?.toJson(),
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollCreateRequestSchema {
        return {
            allowMultiselect: this.#allowMultiselect,
            answers: [...this.#answers],
            duration: this.#duration,
            layoutType: this.#layoutType,
            question: this.#question,
        };
    }

    clone(): PollCreateRequest {
        return new PollCreateRequest(this.toJson());
    }

    reset(): void {
        this.#allowMultiselect = false;
        this.#answers = [];
        this.#duration = null;
        this.#layoutType = null;
        this.#question = null;
    }

    equals(other: Partial<PollCreateRequest>): boolean {
        return Boolean(
            this.#allowMultiselect === other.allowMultiselect &&
                this.#answers.length === other.answers?.length &&
                this.#answers.every((answer, index) => answer.equals(other.answers?.[index] ?? {})) &&
                this.#duration === other.duration &&
                this.#layoutType === other.layoutType &&
                this.#question?.equals(other.question ?? {}),
        );
    }
}

export interface MessagePollVoteSchema {
    readonly answerId: Integer | null;
    readonly channelId: Snowflake | null;
    readonly guildId: Snowflake | null;
    readonly messageId: Snowflake | null;
    readonly userId: Snowflake | null;
}

export class MessagePollVote
    extends Base<MessagePollVoteAddFields | MessagePollVoteRemoveFields, MessagePollVoteSchema>
    implements MessagePollVoteSchema
{
    #answerId: Integer | null = null;
    #channelId: Snowflake | null = null;
    #guildId: Snowflake | null = null;
    #messageId: Snowflake | null = null;
    #userId: Snowflake | null = null;

    constructor(data: Partial<MessagePollVoteAddFields | MessagePollVoteRemoveFields>) {
        super();
        this.patch(data);
    }

    get answerId(): Integer | null {
        return this.#answerId;
    }

    get channelId(): Snowflake | null {
        return this.#channelId;
    }

    get guildId(): Snowflake | null {
        return this.#guildId;
    }

    get messageId(): Snowflake | null {
        return this.#messageId;
    }

    get userId(): Snowflake | null {
        return this.#userId;
    }

    static from(data: Partial<MessagePollVoteAddFields | MessagePollVoteRemoveFields>): MessagePollVote {
        return new MessagePollVote(data);
    }

    patch(data: Partial<MessagePollVoteAddFields | MessagePollVoteRemoveFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#answerId = data.answer_id ?? this.#answerId;
        this.#channelId = data.channel_id ?? this.#channelId;
        this.#guildId = data.guild_id ?? this.#guildId;
        this.#messageId = data.message_id ?? this.#messageId;
        this.#userId = data.user_id ?? this.#userId;
    }

    toJson(): Partial<MessagePollVoteAddFields | MessagePollVoteRemoveFields> {
        return {
            answer_id: this.#answerId ?? undefined,
            channel_id: this.#channelId ?? undefined,
            guild_id: this.#guildId ?? undefined,
            message_id: this.#messageId ?? undefined,
            user_id: this.#userId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): MessagePollVoteSchema {
        return {
            answerId: this.#answerId,
            channelId: this.#channelId,
            guildId: this.#guildId,
            messageId: this.#messageId,
            userId: this.#userId,
        };
    }

    clone(): MessagePollVote {
        return new MessagePollVote(this.toJson());
    }

    reset(): void {
        this.#answerId = null;
        this.#channelId = null;
        this.#guildId = null;
        this.#messageId = null;
        this.#userId = null;
    }

    equals(other: Partial<MessagePollVote>): boolean {
        return Boolean(
            this.#answerId === other.answerId &&
                this.#channelId === other.channelId &&
                this.#guildId === other.guildId &&
                this.#messageId === other.messageId &&
                this.#userId === other.userId,
        );
    }
}

export interface PollSchema {
    readonly allowMultiselect: boolean;
    readonly answers: PollAnswer[];
    readonly expiry: Iso8601Timestamp | null;
    readonly layoutType: PollLayoutTypes | null;
    readonly question: PollMedia | null;
    readonly results: PollResults | null;
}

export class Poll extends Base<PollStructure, PollSchema> implements PollSchema {
    #allowMultiselect = false;
    #answers: PollAnswer[] = [];
    #expiry: Iso8601Timestamp | null = null;
    #layoutType: PollLayoutTypes | null = null;
    #question: PollMedia | null = null;
    #results: PollResults | null = null;

    constructor(data: Partial<PollStructure>) {
        super();
        this.patch(data);
    }

    get allowMultiselect(): boolean {
        return this.#allowMultiselect;
    }

    get answers(): PollAnswer[] {
        return [...this.#answers];
    }

    get expiry(): Iso8601Timestamp | null {
        return this.#expiry;
    }

    get layoutType(): PollLayoutTypes | null {
        return this.#layoutType;
    }

    get question(): PollMedia | null {
        return this.#question;
    }

    get results(): PollResults | null {
        return this.#results;
    }

    get isExpired(): boolean {
        return this.#expiry ? new Date(this.#expiry).getTime() < Date.now() : false;
    }

    get remainingTime(): number | null {
        if (!this.#expiry) {
            return null;
        }
        const remaining = new Date(this.#expiry).getTime() - Date.now();
        return remaining > 0 ? remaining : 0;
    }

    get isActive(): boolean {
        return !(this.isExpired || this.#results?.isFinalized);
    }

    get totalVotes(): number {
        return this.#results?.totalVotes ?? 0;
    }

    static from(data: Partial<PollStructure>): Poll {
        return new Poll(data);
    }

    getAnswerPercentage(answerId: Integer): number {
        return this.#results?.getVotePercentage(answerId) ?? 0;
    }

    patch(data: Partial<PollStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#allowMultiselect = Boolean(data.allow_multiselect ?? this.#allowMultiselect);

        if (Array.isArray(data.answers)) {
            this.#answers = data.answers.map((answer) => PollAnswer.from(answer));
        }

        this.#expiry = data.expiry ?? this.#expiry;
        this.#layoutType = data.layout_type ?? this.#layoutType;
        this.#question = data.question ? PollMedia.from(data.question) : this.#question;
        this.#results = data.results ? PollResults.from(data.results) : this.#results;
    }

    toJson(): Partial<PollStructure> {
        return {
            allow_multiselect: this.#allowMultiselect,
            answers: this.#answers.map((answer) => answer.toJson()) as PollAnswerStructure[],
            expiry: this.#expiry ?? undefined,
            layout_type: this.#layoutType ?? undefined,
            question: this.#question?.toJson(),
            results: this.#results?.toJson() as PollResultsStructure | undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): PollSchema {
        return {
            allowMultiselect: this.#allowMultiselect,
            answers: [...this.#answers],
            expiry: this.#expiry,
            layoutType: this.#layoutType,
            question: this.#question,
            results: this.#results,
        };
    }

    clone(): Poll {
        return new Poll(this.toJson());
    }

    reset(): void {
        this.#allowMultiselect = false;
        this.#answers = [];
        this.#expiry = null;
        this.#layoutType = null;
        this.#question = null;
        this.#results = null;
    }

    equals(other: Partial<Poll>): boolean {
        return Boolean(
            this.#allowMultiselect === other.allowMultiselect &&
                this.#answers.length === other.answers?.length &&
                this.#answers.every((answer, index) => answer.equals(other.answers?.[index] ?? {})) &&
                this.#expiry === other.expiry &&
                this.#layoutType === other.layoutType &&
                this.#question?.equals(other.question ?? {}) &&
                this.#results?.equals(other.results ?? {}),
        );
    }
}
