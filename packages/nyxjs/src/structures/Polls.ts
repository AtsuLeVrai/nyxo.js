import type {
    Integer,
    Iso8601Timestamp,
    PollAnswerCountStructure,
    PollAnswerStructure,
    PollCreateRequestStructure,
    PollLayoutTypes,
    PollMediaStructure,
    PollResultsStructure,
    PollStructure,
} from "@nyxjs/core";
import type { PickWithMethods } from "../types/index.js";
import { Emoji } from "./Emojis.js";

export class PollAnswerCount {
    #count: Integer = 0;
    #id: Integer = 0;
    #meVoted = false;

    constructor(data: Partial<PollAnswerCountStructure>) {
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

    patch(data: Partial<PollAnswerCountStructure>): void {
        if (!data) {
            return;
        }

        this.#count = data.count ?? this.#count;
        this.#id = data.id ?? this.#id;
        this.#meVoted = data.me_voted ?? this.#meVoted;
    }

    toJSON(): Partial<PollAnswerCountStructure> {
        return {
            count: this.#count,
            id: this.#id,
            me_voted: this.#meVoted,
        };
    }
}

export class PollResults {
    #answerCounts: PollAnswerCount[] = [];
    #isFinalized = false;

    constructor(data: Partial<PollResultsStructure>) {
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

    getVotePercentage(answerId: Integer): number {
        const total = this.totalVotes;
        if (total === 0) {
            return 0;
        }

        const answer = this.#answerCounts.find((a) => a.id === answerId);
        return answer ? (answer.count / total) * 100 : 0;
    }

    patch(data: Partial<PollResultsStructure>): void {
        if (!data) {
            return;
        }

        if (Array.isArray(data.answer_counts)) {
            this.#answerCounts = data.answer_counts.map((count) => new PollAnswerCount(count));
        }

        this.#isFinalized = data.is_finalized ?? this.#isFinalized;
    }

    toJSON(): Partial<PollResultsStructure> {
        return {
            answer_counts: this.#answerCounts.map((count) => count.toJSON()) as PollAnswerCountStructure[],
            is_finalized: this.#isFinalized,
        };
    }
}

export class PollMedia {
    #emoji: PickWithMethods<Emoji, "id" | "name"> | null = null;
    #text: string | null = null;

    constructor(data: Partial<PollMediaStructure>) {
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

    patch(data: Partial<PollMediaStructure>): void {
        if (!data) {
            return;
        }

        this.#emoji = data.emoji ? new Emoji(data.emoji) : this.#emoji;
        this.#text = data.text ?? this.#text;
    }

    toJSON(): Partial<PollMediaStructure> {
        return {
            emoji: this.#emoji ?? undefined,
            text: this.#text ?? undefined,
        };
    }
}

export class PollAnswer {
    #answerId: Integer | null = null;
    #pollMedia: PollMedia | null = null;

    constructor(data: Partial<PollAnswerStructure>) {
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

    patch(data: Partial<PollAnswerStructure>): void {
        if (!data) {
            return;
        }

        this.#answerId = data.answer_id ?? this.#answerId;
        this.#pollMedia = data.poll_media ? new PollMedia(data.poll_media) : this.#pollMedia;
    }

    toJSON(): Partial<PollAnswerStructure> {
        return {
            answer_id: this.#answerId ?? undefined,
            poll_media: this.#pollMedia?.toJSON(),
        };
    }
}

export class PollCreateResquest {
    #allowMultiselect = false;
    #answers: PollAnswer[] = [];
    #duration: Integer | null = null;
    #layoutType: PollLayoutTypes | null = null;
    #question: PollMedia | null = null;

    constructor(data: Partial<PollCreateRequestStructure>) {
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

    patch(data: Partial<PollCreateRequestStructure>): void {
        if (!data) {
            return;
        }

        this.#allowMultiselect = data.allow_multiselect ?? this.#allowMultiselect;

        if (Array.isArray(data.answers)) {
            this.#answers = data.answers.map((answer) => new PollAnswer(answer));
        }

        this.#duration = data.duration ?? this.#duration;
        this.#layoutType = data.layout_type ?? this.#layoutType;

        this.#question = data.question ? new PollMedia(data.question) : this.#question;
    }

    toJSON(): Partial<PollCreateRequestStructure> {
        return {
            allow_multiselect: this.#allowMultiselect,
            answers: this.#answers.map((answer) => answer.toJSON()) as PollAnswerStructure[],
            duration: this.#duration ?? undefined,
            layout_type: this.#layoutType ?? undefined,
            question: this.#question?.toJSON(),
        };
    }
}

export class Poll {
    #allowMultiselect = false;
    #answers: PollAnswer[] = [];
    #expiry: Iso8601Timestamp | null = null;
    #layoutType: PollLayoutTypes | null = null;
    #question: PollMedia | null = null;
    #results: PollResults | null = null;

    constructor(data: Partial<PollStructure>) {
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

    // Getters calculés
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
        return !this.isExpired && !this.#results?.isFinalized;
    }

    get totalVotes(): number {
        return this.#results?.totalVotes ?? 0;
    }

    getAnswerPercentage(answerId: Integer): number {
        return this.#results?.getVotePercentage(answerId) ?? 0;
    }

    patch(data: Partial<PollStructure>): void {
        if (!data) {
            return;
        }

        this.#allowMultiselect = data.allow_multiselect ?? this.#allowMultiselect;
        this.#answers = Array.isArray(data.answers)
            ? data.answers.map((answer) => new PollAnswer(answer))
            : this.#answers;
        this.#expiry = data.expiry ?? this.#expiry;
        this.#layoutType = data.layout_type ?? this.#layoutType;
        this.#question = data.question ? new PollMedia(data.question) : this.#question;
        this.#results = data.results ? new PollResults(data.results) : this.#results;
    }

    toJSON(): Partial<PollStructure> {
        return {
            allow_multiselect: this.#allowMultiselect,
            answers: this.#answers.map((answer) => answer.toJSON()) as PollAnswerStructure[],
            expiry: this.#expiry,
            layout_type: this.#layoutType ?? undefined,
            question: this.#question?.toJSON(),
            results: this.#results?.toJSON() as PollResultsStructure | undefined,
        };
    }
}
