import { isObject } from "./isObject";
import { tagUnindent } from "./tagUnindent";

/**
 * @description
 * Works like normal object dotting, but adds object literal for dots that return undefined.
 * @example
 * const baseObj = {};
 * constructiveDot(baseObj,["prop1","prop2"]).prop3 = "a string";
 * expect(baseObj).toEqual({
 *     prop1 : {
 *         prop2 : {
 *             prop3 : "a string"
 *         }
 *     }
 * });
 */
export function constructiveDot(o: { [x: string]: unknown }, dots: (string | number)[]): { [x: string]: unknown } {
    let currentObj = o;
    const currentCoveredDottedPath: (string | number)[] = [];
    for (const dot of dots) {
        currentCoveredDottedPath.push(dot);
        const currentObjDot = currentObj[dot];
        if (currentObjDot === undefined) {
            const newObj = {};
            currentObj[dot] = newObj;
            currentObj = newObj;
        } else if (isObject(currentObjDot)) {
            currentObj = currentObjDot;
        } else {
            throw Error(_errorMessages.badPath(currentCoveredDottedPath));
        }
    }
    return currentObj;
}

export const _errorMessages = {
    badPath: (currentCoveredDottedPath: (string | number)[]): string => {
        const addQuotationMarksIfString = (dot: string | number) => {
            return typeof dot === "string" ? `"${dot}"` : String(dot);
        };
        return tagUnindent`
            The value:

                ${
                    "objectToConstructiveDot[" +
                    currentCoveredDottedPath.map((dot) => addQuotationMarksIfString(dot)).join("][") +
                    "]"
                }

            is not an object.

            Can not consume the rest of the provided constructive dot path.
        `;
    },
};
