/**
 * Truncates the given string to a specified maximum length and appends a suffix if truncated.
 *
 * @param {string} str - The string to truncate.
 * @param {number} maxLength - The maximum length of the truncated string including the suffix.
 * @param {string} [suffix] - The suffix to append if the string is truncated. Defaults to "...".
 * @returns {string} The truncated string with the suffix if it was truncated, otherwise the original string.
 */
export function truncate(str: string, maxLength: number, suffix = "..."): string {
    if (str.length <= maxLength) {
        return str;
    }

    return str.slice(0, maxLength - suffix.length) + suffix;
}
