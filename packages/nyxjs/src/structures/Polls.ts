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
import { Emoji } from "./Emojis.js";

export class PollAnswerCount {
    count!: Integer;

    id!: Integer;

    meVoted!: boolean;

    constructor(data: Partial<PollAnswerCountStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollAnswerCountStructure>): void {
        if (data.count) {
            this.count = data.count;
        }
        if (data.id) {
            this.id = data.id;
        }
        if (data.me_voted) {
            this.meVoted = data.me_voted;
        }
    }
}

export class PollResults {
    answerCounts!: PollAnswerCount[];

    isFinalized!: boolean;

    constructor(data: Partial<PollResultsStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollResultsStructure>): void {
        if (data.answer_counts) {
            this.answerCounts = data.answer_counts.map((answerCount) => new PollAnswerCount(answerCount));
        }
        if (data.is_finalized) {
            this.isFinalized = data.is_finalized;
        }
    }
}

export class PollMedia {
    emoji?: Pick<Emoji, "id" | "name">;

    text?: string;

    constructor(data: Partial<PollMediaStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollMediaStructure>): void {
        if (data.emoji) {
            this.emoji = new Emoji(data.emoji);
        }
        if (data.text) {
            this.text = data.text;
        }
    }
}

export class PollAnswer {
    answerId!: Integer;

    pollMedia!: PollMedia;

    constructor(data: Partial<PollAnswerStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollAnswerStructure>): void {
        if (data.answer_id) {
            this.answerId = data.answer_id;
        }
        if (data.poll_media) {
            this.pollMedia = new PollMedia(data.poll_media);
        }
    }
}

export class PollCreateRequest {
    allowMultiselect?: boolean;

    answers!: PollAnswer[];

    duration?: Integer;

    layoutType?: PollLayoutTypes;

    question!: PollMedia;

    constructor(data: Partial<PollCreateRequestStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollCreateRequestStructure>): void {
        if (data.allow_multiselect) {
            this.allowMultiselect = data.allow_multiselect;
        }
        if (data.answers) {
            this.answers = data.answers.map((answer) => new PollAnswer(answer));
        }
        if (data.duration) {
            this.duration = data.duration;
        }
        if (data.layout_type) {
            this.layoutType = data.layout_type;
        }
        if (data.question) {
            this.question = new PollMedia(data.question);
        }
    }
}

export class Poll {
    allowMultiselect!: boolean;

    answers!: PollAnswer[];

    expiry!: Iso8601Timestamp | null;

    layoutType!: PollLayoutTypes;

    question!: PollMedia;

    results?: PollResults;

    constructor(data: Partial<PollStructure>) {
        this.#patch(data);
    }

    #patch(data: Partial<PollStructure>): void {
        if (data.allow_multiselect) {
            this.allowMultiselect = data.allow_multiselect;
        }
        if (data.answers) {
            this.answers = data.answers.map((answer) => new PollAnswer(answer));
        }
        if (data.expiry) {
            this.expiry = data.expiry;
        }
        if (data.layout_type) {
            this.layoutType = data.layout_type;
        }
        if (data.question) {
            this.question = new PollMedia(data.question);
        }
        if (data.results) {
            this.results = new PollResults(data.results);
        }
    }
}
