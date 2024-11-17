type PatternKeys = "methodCall" | "importantText" | "value" | "path" | "email" | "url" | "version" | "wsUrl";

export const PATTERNS: Record<PatternKeys, RegExp> = {
    methodCall: /\b\w+\(\)/g,
    importantText: /'([^']+)'/g,
    value: /\{([^}]+)}/g,
    path: /(?:\/[\w.-]+)+/g,
    email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi,
    url: /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/g,
    version: /(\d+)\.(\d+)\.(\d+)(-[a-zA-Z0-9]+)?/,
    wsUrl: /wss?:\/\/[^\s<>"]+/g,
} as const;
