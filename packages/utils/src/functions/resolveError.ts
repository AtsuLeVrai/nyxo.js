export function resolveError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    if (typeof error === "object") {
        return JSON.stringify(error);
    }

    return String(error);
}
