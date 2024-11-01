import type { ClientEvents } from "nyx.js";
import type { WorkBench } from "../client.js";

export type ClientEventOptions<T extends keyof ClientEvents> = {
    event: T;
    listener(client: WorkBench, ...args: ClientEvents[T]): void;
    once?: boolean;
};

export class WorkBenchEvent<T extends keyof ClientEvents> implements ClientEventOptions<T> {
    event: T;
    listener: ClientEventOptions<T>["listener"];
    once?: boolean;

    constructor(event: ClientEventOptions<T>["event"], listener: ClientEventOptions<T>["listener"], once = false) {
        this.event = event;
        this.listener = listener;
        this.once = once;
    }
}
