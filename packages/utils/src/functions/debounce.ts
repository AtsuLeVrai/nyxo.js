import { clearTimeout, setTimeout } from "node:timers";

/**
 * Creates a debounced version of a function.
 *
 * @param func - The function to debounce.
 * @param waitFor - The number of milliseconds to wait before invoking the function.
 * @returns A new function that calls `func` after a delay.
 */
export function debounce<F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => func(...args), waitFor);
    };
}
