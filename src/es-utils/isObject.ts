/**
 * @description
 * Returns `true` only when the `typeof` of the provided value is `object` and
 * the value is not `null`. Returns `false` in every other case.
 */
export function isObject(v: unknown): v is { [x: string]: unknown } {
    return v !== null && typeof v === "object";
}
