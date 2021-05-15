/**
 * @description
 * Return the last line of the provided string.
 */
export function getLastLineOfString(string: string): string {
    const lines = string.split("\n");
    return lines[lines.length - 1];
}
