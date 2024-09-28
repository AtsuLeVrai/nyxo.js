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
import { Base } from "./Base";
import { Emoji } from "./Emojis";

export class PollAnswerCount extends Base<PollAnswerCountStructure> {
    public count: Integer;

    public id: Integer;

    public meVoted: boolean;

    public constructor(data: Partial<PollAnswerCountStructure> = {}) {
        super();
        this.count = data.count!;
        this.id = data.id!;
        this.meVoted = data.me_voted!;
    }
}

export class PollResults extends Base<PollResultsStructure> {
    public answerCounts: PollAnswerCount[];

    public isFinalized: boolean;

    public constructor(data: Partial<PollResultsStructure> = {}) {
        super();
        this.answerCounts = data.answer_counts!.map((answerCount) => PollAnswerCount.from(answerCount));
        this.isFinalized = data.is_finalized!;
    }
}

export class PollMedia extends Base<PollMediaStructure> {
    public emoji?: Pick<Emoji, "id" | "name">;

    public text?: string;

    public constructor(data: Partial<PollMediaStructure> = {}) {
        super();
        this.emoji = Emoji.from(data.emoji);
        this.text = data.text;
    }
}

export class PollAnswer extends Base<PollAnswerStructure> {
    public answerId: Integer;

    public pollMedia: PollMedia;

    public constructor(data: Partial<PollAnswerStructure> = {}) {
        super();
        this.answerId = data.answer_id!;
        this.pollMedia = PollMedia.from(data.poll_media);
    }
}

export class PollCreateRequest extends Base<PollCreateRequestStructure> {
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
}

export class Poll extends Base<PollStructure> {
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
}
