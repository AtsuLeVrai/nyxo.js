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
import { BaseStructure } from "../bases/BaseStructure";
import { Emoji } from "./Emojis";

export class PollAnswerCount extends BaseStructure<PollAnswerCountStructure> {
    public count: Integer;

    public id: Integer;

    public meVoted: boolean;

    public constructor(data: Partial<PollAnswerCountStructure> = {}) {
        super();
        this.count = data.count!;
        this.id = data.id!;
        this.meVoted = data.me_voted!;
    }

    public toJSON(): PollAnswerCountStructure {
        return {
            count: this.count,
            id: this.id,
            me_voted: this.meVoted,
        };
    }
}

export class PollResults extends BaseStructure<PollResultsStructure> {
    public answerCounts: PollAnswerCount[];

    public isFinalized: boolean;

    public constructor(data: Partial<PollResultsStructure> = {}) {
        super();
        this.answerCounts = data.answer_counts!.map((answerCount) => PollAnswerCount.from(answerCount));
        this.isFinalized = data.is_finalized!;
    }

    public toJSON(): PollResultsStructure {
        return {
            answer_counts: this.answerCounts.map((answerCount) => answerCount.toJSON()),
            is_finalized: this.isFinalized,
        };
    }
}

export class PollMedia extends BaseStructure<PollMediaStructure> {
    public emoji?: Pick<Emoji, "id" | "name" | "toJSON">;

    public text?: string;

    public constructor(data: Partial<PollMediaStructure> = {}) {
        super();
        this.emoji = Emoji.from(data.emoji);
        this.text = data.text;
    }

    public toJSON(): PollMediaStructure {
        return {
            emoji: this.emoji?.toJSON(),
            text: this.text,
        };
    }
}

export class PollAnswer extends BaseStructure<PollAnswerStructure> {
    public answerId: Integer;

    public pollMedia: PollMedia;

    public constructor(data: Partial<PollAnswerStructure> = {}) {
        super();
        this.answerId = data.answer_id!;
        this.pollMedia = PollMedia.from(data.poll_media);
    }

    public toJSON(): PollAnswerStructure {
        return {
            answer_id: this.answerId,
            poll_media: this.pollMedia.toJSON(),
        };
    }
}

export class PollCreateRequest extends BaseStructure<PollCreateRequestStructure> {
    public allowMultiselect?: boolean;

    public answers: PollAnswer[];

    public duration?: Integer;

    public layoutType?: PollLayoutTypes;

    public question: PollMedia;

    public constructor(data: Partial<PollCreateRequestStructure> = {}) {
        super();
        this.allowMultiselect = data.allow_multiselect;
        this.answers = data.answers!.map((answer) => PollAnswer.from(answer));
        this.duration = data.duration;
        this.layoutType = data.layout_type;
        this.question = PollMedia.from(data.question);
    }

    public toJSON(): PollCreateRequestStructure {
        return {
            allow_multiselect: this.allowMultiselect,
            answers: this.answers.map((answer) => answer.toJSON()),
            duration: this.duration,
            layout_type: this.layoutType,
            question: this.question.toJSON(),
        };
    }
}

export class Poll extends BaseStructure<PollStructure> {
    public allowMultiselect: boolean;

    public answers: PollAnswer[];

    public expiry: Iso8601Timestamp | null;

    public layoutType: PollLayoutTypes;

    public question: PollMedia;

    public results?: PollResults;

    public constructor(data: Partial<PollStructure> = {}) {
        super();
        this.allowMultiselect = data.allow_multiselect!;
        this.answers = data.answers!.map((answer) => PollAnswer.from(answer));
        this.expiry = data.expiry!;
        this.layoutType = data.layout_type!;
        this.question = PollMedia.from(data.question);
        this.results = PollResults.from(data.results);
    }

    public toJSON(): PollStructure {
        return {
            allow_multiselect: this.allowMultiselect,
            answers: this.answers.map((answer) => answer.toJSON()),
            expiry: this.expiry,
            layout_type: this.layoutType,
            question: this.question.toJSON(),
            results: this.results?.toJSON(),
        };
    }
}
