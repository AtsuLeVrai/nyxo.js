import { EventEmitter } from "node:events";
import { Rest } from "@nyxjs/rest";

export class Client extends EventEmitter {
	public constructor(public token: string) {
		super();
	}

	public get rest(): Rest {
		return new Rest(this.token);
	}
}
