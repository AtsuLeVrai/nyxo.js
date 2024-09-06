import type {
    LayoutTypes,
    PollAnswerCountStructure,
    PollAnswerStructure,
    PollCreateRequestStructure,
    PollMediaStructure,
    PollResultsStructure,
    PollStructure,
} from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp } from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Base } from "./Base";
import { Emoji } from "./Emojis";

export class PollAnswerCount extends Base<PollAnswerCountStructure> {
    public count!: Integer;

    public id!: Integer;

    public meVoted!: boolean;

    public constructor(data: Readonly<Partial<PollAnswerCountStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollAnswerCountStructure>>): void {
        if (data.count !== undefined) {
            this.count = data.count;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.me_voted !== undefined) {
            this.meVoted = data.me_voted;
        }
    }
}

export class PollResults extends Base<PollResultsStructure> {
    public answerCounts!: PollAnswerCount[];

    public isFinalized!: boolean;

    public constructor(data: Readonly<Partial<PollResultsStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollResultsStructure>>): void {
        if (data.answer_counts !== undefined) {
            this.answerCounts = data.answer_counts.map((answerCount) => PollAnswerCount.from(answerCount));
        }

        if (data.is_finalized !== undefined) {
            this.isFinalized = data.is_finalized;
        }
    }
}

export class PollMedia extends Base<PollMediaStructure> {
    public emoji!: PickWithPublicMethods<Emoji, "id" | "name">;

    public text!: string;

    public constructor(data: Readonly<Partial<PollMediaStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollMediaStructure>>): void {
        if (data.emoji !== undefined) {
            this.emoji = Emoji.from(data.emoji);
        }

        if (data.text !== undefined) {
            this.text = data.text;
        }
    }
}

export class PollAnswer extends Base<PollAnswerStructure> {
    public answerId!: Integer;

    public pollMedia!: PollMedia;

    public constructor(data: Readonly<Partial<PollAnswerStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollAnswerStructure>>): void {
        if (data.answer_id !== undefined) {
            this.answerId = data.answer_id;
        }

        if (data.poll_media !== undefined) {
            this.pollMedia = PollMedia.from(data.poll_media);
        }
    }
}

export class PollCreateRequest extends Base<PollCreateRequestStructure> {
    public allowMultiselect?: boolean;

    public answers!: PollAnswer[];

    public duration?: Integer;

    public layoutType?: LayoutTypes;

    public question!: PollMedia;

    public constructor(data: Readonly<Partial<PollCreateRequestStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollCreateRequestStructure>>): void {
        if ("allow_multiselect" in data) {
            if (data.allow_multiselect === null) {
                this.allowMultiselect = undefined;
            } else if (data.allow_multiselect !== undefined) {
                this.allowMultiselect = data.allow_multiselect;
            }
        }

        if (data.answers !== undefined) {
            this.answers = data.answers.map((answer) => PollAnswer.from(answer));
        }

        if ("duration" in data) {
            if (data.duration === null) {
                this.duration = undefined;
            } else if (data.duration !== undefined) {
                this.duration = data.duration;
            }
        }

        if ("layout_type" in data) {
            if (data.layout_type === null) {
                this.layoutType = undefined;
            } else if (data.layout_type !== undefined) {
                this.layoutType = data.layout_type;
            }
        }

        if (data.question !== undefined) {
            this.question = PollMedia.from(data.question);
        }
    }
}

export class Poll extends Base<PollStructure> {
    public answers!: PollAnswer[];

    public expiry!: IsoO8601Timestamp | null;

    public layoutType!: LayoutTypes;

    public question!: PollMedia;

    public results?: PollResults;

    public constructor(data: Readonly<Partial<PollStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<PollStructure>>): void {
        if (data.answers !== undefined) {
            this.answers = data.answers.map((answer) => PollAnswer.from(answer));
        }

        if (data.expiry !== undefined) {
            this.expiry = data.expiry;
        }

        if (data.layout_type !== undefined) {
            this.layoutType = data.layout_type;
        }

        if (data.question !== undefined) {
            this.question = PollMedia.from(data.question);
        }

        if ("results" in data) {
            if (data.results === null) {
                this.results = undefined;
            } else if (data.results !== undefined) {
                this.results = PollResults.from(data.results);
            }
        }
    }
}

export { LayoutTypes } from "@nyxjs/api-types";
