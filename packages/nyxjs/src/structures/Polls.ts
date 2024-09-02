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
import type { Emoji } from "./Emojis";

export class PollAnswerCount extends Base<PollAnswerCountStructure> {
	public count!: Integer;

	public id!: Integer;

	public meVoted!: boolean;

	public constructor(data: Partial<PollAnswerCountStructure>) {
		super(data);
	}
}

export class PollResults extends Base<PollResultsStructure> {
	public answerCounts!: PollAnswerCount[];

	public isFinalized!: boolean;

	public constructor(data: Partial<PollResultsStructure>) {
		super(data);
	}
}

export class PollMedia extends Base<PollMediaStructure> {
	public emoji!: Pick<Emoji, "id" | "name" | "toJSON">;

	public text!: string;

	public constructor(data: Partial<PollMediaStructure>) {
		super(data);
	}
}

export class PollAnswer extends Base<PollAnswerStructure> {
	public answerId!: Integer;

	public pollMedia!: PollMedia;

	public constructor(data: Partial<PollAnswerStructure>) {
		super(data);
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
}

export class Poll extends Base<PollStructure> {
	public answers!: PollAnswerStructure[];

	public expiry!: IsoO8601Timestamp | null;

	public layoutType!: LayoutTypes;

	public question!: PollMediaStructure;

	public results?: PollResultsStructure;

	public constructor(data: Partial<PollStructure>) {
		super(data);
	}
}

export { type LayoutTypes } from "@nyxjs/rest";
