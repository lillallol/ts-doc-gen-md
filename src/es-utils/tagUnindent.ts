import { getLastLineOfString } from "./getLastLineOfString";
import { unindent } from "./unindent";

/**
 * @description
 * Tag function that returns the template literal it is provided as a string, but
 * with its common maximum indentation removed.
 *
 * The placeholders that are provided as single string element arrays are multi-line indented.
 *
 * It throws if :
 *
 * - the first line is non empty
 * - the last line is not only spaces
 * - the string contains `\s` characters that are not space characters in its indentation
 *
 * @example
 * expect(
 *      tagUnindent`
 *          path : (${`"./some/where"`})
 *          index : ${0}
 *          message :
 *              ${["hello\nworld"]}
 *      `
 * ).toBe(
 *     `path : ("./some/where")\n` +
 *     `index : 0\n` +
 *     `message : \n` +
 *     `    hello\n` +
 *     `    world`
 * );
 */
export function tagUnindent(
    stringArray: TemplateStringsArray,
    ...placeholders: (number | string | [string])[]
): string {
    const stringToUnindent: string = ((): string => {
        if (placeholders.length === 0) return stringArray[0];
        
        let toReturn = "";
        for (let i = 0; i < placeholders.length; i++) {
            const currentPlaceholder = placeholders[i];
            if (Array.isArray(currentPlaceholder)) {
                const lastStringArrayLineLength = getLastLineOfString(stringArray[i]).length;
                const [placeholderSingleElementArrayString] = currentPlaceholder;
                toReturn =
                    toReturn +
                    stringArray[i] +
                    placeholderSingleElementArrayString
                        .split("\n")
                        .map((line, i) => {
                            if (i === 0) return line;
                            return " ".repeat(lastStringArrayLineLength) + line;
                        })
                        .join("\n");
            } else {
                toReturn = toReturn + stringArray[i] + currentPlaceholder;
            }
        }
        return toReturn + stringArray[stringArray.length - 1];
    })();
    
    return unindent(stringToUnindent);
}
