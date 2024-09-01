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

	public toJSON(): PollAnswerCountStructure {
		return {
			count: this.count,
			id: this.id,
			me_voted: this.meVoted,
		};
	}

	protected patch(data: Partial<PollAnswerCountStructure>): void {
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

	public constructor(data: Partial<PollResultsStructure>) {
		super(data);
	}

	public toJSON(): PollResultsStructure {
		return {
			answer_counts: this.answerCounts.map((answerCount) =>
				answerCount.toJSON(),
			),
			is_finalized: this.isFinalized,
		};
	}

	protected patch(data: Partial<PollResultsStructure>): void {
		if (data.answer_counts !== undefined) {
			this.answerCounts = data.answer_counts.map(
				(answerCount) => new PollAnswerCount(answerCount),
			);
		}

		if (data.is_finalized !== undefined) {
			this.isFinalized = data.is_finalized;
		}
	}
}

export class PollMedia extends Base<PollMediaStructure> {
	public emoji!: Pick<Emoji, "id" | "name" | "toJSON">;

	public text!: string;

	public constructor(data: Partial<PollMediaStructure>) {
		super(data);
	}

	public toJSON(): PollMediaStructure {
		return {
			emoji: this.emoji.toJSON(),
			text: this.text,
		};
	}

	protected patch(data: Partial<PollMediaStructure>): void {
		if (data.emoji !== undefined) {
			this.emoji = new Emoji(data.emoji);
		}

		if (data.text !== undefined) {
			this.text = data.text;
		}
	}
}

export class PollAnswer extends Base<PollAnswerStructure> {
	public answerId!: Integer;

	public pollMedia!: PollMedia;

	public constructor(data: Partial<PollAnswerStructure>) {
		super(data);
	}

	public toJSON(): PollAnswerStructure {
		return {
			answer_id: this.answerId,
			poll_media: this.pollMedia.toJSON(),
		};
	}

	protected patch(data: Partial<PollAnswerStructure>): void {
		if (data.answer_id !== undefined) {
			this.answerId = data.answer_id;
		}

		if (data.poll_media !== undefined) {
			this.pollMedia = new PollMedia(data.poll_media);
		}
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

	public toJSON(): PollCreateRequestStructure {
		return {
			allow_multiselect: this.allowMultiselect,
			answers: this.answers.map((answer) => answer.toJSON()),
			duration: this.duration,
			layout_type: this.layoutType,
			question: this.question.toJSON(),
		};
	}

	protected patch(data: Partial<PollCreateRequestStructure>): void {
		if (data.allow_multiselect !== undefined) {
			this.allowMultiselect = data.allow_multiselect;
		}

		if (data.answers !== undefined) {
			this.answers = data.answers.map((answer) => new PollAnswer(answer));
		}

		if (data.duration !== undefined) {
			this.duration = data.duration;
		}

		if (data.layout_type !== undefined) {
			this.layoutType = data.layout_type;
		}

		if (data.question !== undefined) {
			this.question = new PollMedia(data.question);
		}
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

	public toJSON(): PollStructure {
		return {
			answers: this.answers,
			expiry: this.expiry,
			layout_type: this.layoutType,
			question: this.question,
			results: this.results,
		};
	}

	protected patch(data: Partial<PollStructure>): void {
		if (data.answers !== undefined) {
			this.answers = data.answers;
		}

		if (data.expiry !== undefined) {
			this.expiry = data.expiry;
		}

		if (data.layout_type !== undefined) {
			this.layoutType = data.layout_type;
		}

		if (data.question !== undefined) {
			this.question = data.question;
		}

		if (data.results !== undefined) {
			this.results = data.results;
		}
	}
}

export { type LayoutTypes } from "@nyxjs/rest";
