import { BitfieldManager } from "@nyxjs/core";

export function calculateIntents<T extends number>(intents: T | T[]): number {
    if (Array.isArray(intents)) {
        return Number(BitfieldManager.from(intents).valueOf());
    } else {
        return intents;
    }
}
