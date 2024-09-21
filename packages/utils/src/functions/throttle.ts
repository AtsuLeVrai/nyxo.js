import { setTimeout } from "node:timers";

/**
 * Creates a throttled version of the provided function that will only execute once per specified time limit.
 *
 * @param func - The function to throttle.
 * @param limit - The time limit in milliseconds.
 * @returns A throttled version of the provided function.
 */
export function throttle<F extends (...args: any[]) => any>(func: F, limit: number): (...args: Parameters<F>) => void {
    let inThrottle: boolean;
    return function throttled(this: any, ...args: Parameters<F>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
