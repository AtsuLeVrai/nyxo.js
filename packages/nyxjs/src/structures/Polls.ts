import type { Integer, IsoO8601Timestamp } from "@nyxjs/core";
import type {
    LayoutTypes,
    PollAnswerCountStructure,
    PollAnswerStructure,
    PollCreateRequestStructure,
    PollMediaStructure,
    PollResultsStructure,
    PollStructure,
} from "@nyxjs/rest";
import { Base } from "./Base";
import { Emoji } from "./Emojis";

export class PollAnswerCount extends Base<PollAnswerCountStructure> {
    public count!: Integer;

    public id!: Integer;

    public meVoted!: boolean;

    public constructor(data: Partial<PollAnswerCountStructure>) {
        super(data);
    }

    public patch(data: Partial<PollAnswerCountStructure>): void {
        this.count = data.count ?? this.count;
        this.id = data.id ?? this.id;
        this.meVoted = data.me_voted ?? this.meVoted;
    }
}

export class PollResults extends Base<PollResultsStructure> {
    public answerCounts!: PollAnswerCount[];

    public isFinalized!: boolean;

    public constructor(data: Partial<PollResultsStructure>) {
        super(data);
    }

    public patch(data: Partial<PollResultsStructure>): void {
        if (data.answer_counts) {
            this.answerCounts = data.answer_counts.map(
                (answerCount) =>
                    this.answerCounts.find((ac) => ac.id === answerCount.id)?.patch(answerCount) ??
                    PollAnswerCount.from(answerCount)
            );
        }

        this.isFinalized = data.is_finalized ?? this.isFinalized;
    }
}

export class PollMedia extends Base<PollMediaStructure> {
    public emoji!: Pick<Emoji, "id" | "name" | "toJSON">;

    public text!: string;

    public constructor(data: Partial<PollMediaStructure>) {
        super(data);
    }

    public patch(data: Partial<PollMediaStructure>): void {
        if (data.emoji) {
            this.emoji = Emoji.from(data.emoji);
        }

        this.text = data.text ?? this.text;
    }
}

export class PollAnswer extends Base<PollAnswerStructure> {
    public answerId!: Integer;

    public pollMedia!: PollMedia;

    public constructor(data: Partial<PollAnswerStructure>) {
        super(data);
    }

    public patch(data: Partial<PollAnswerStructure>): void {
        this.answerId = data.answer_id ?? this.answerId;
        this.pollMedia = data.poll_media ? PollMedia.from(data.poll_media) : this.pollMedia;
    }
}

export class PollCreateRequest extends Base<PollCreateRequestStructure> {
    public allowMultiselect?: boolean;

    public answers!: PollAnswer[];

    public duration?: Integer;

    public layoutType?: LayoutTypes;

    public question!: PollMedia;

    public constructor(data: Partial<PollCreateRequestStructure>) {
        super(data);
    }

    public patch(data: Partial<PollCreateRequestStructure>): void {
        if ("allow_multiselect" in data) {
            this.allowMultiselect = data.allow_multiselect;
        }

        this.answers = data.answers ? data.answers.map((answer) => PollAnswer.from(answer)) : this.answers;
        if ("duration" in data) {
            this.duration = data.duration;
        }

        if ("layout_type" in data) {
            this.layoutType = data.layout_type;
        }

        this.question = data.question ? PollMedia.from(data.question) : this.question;
    }
}

export class Poll extends Base<PollStructure> {
    public answers!: PollAnswer[];

    public expiry!: IsoO8601Timestamp | null;

    public layoutType!: LayoutTypes;

    public question!: PollMedia;

    public results?: PollResults;

    public constructor(data: Partial<PollStructure>) {
        super(data);
    }

    public patch(data: Partial<PollStructure>): void {
        this.answers = data.answers ? data.answers.map((answer) => PollAnswer.from(answer)) : this.answers;
        this.expiry = data.expiry ?? this.expiry;
        this.layoutType = data.layout_type ?? this.layoutType;
        this.question = data.question ? PollMedia.from(data.question) : this.question;
        if ("results" in data && data.results) {
            this.results = PollResults.from(data.results);
        }
    }
}
