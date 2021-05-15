/**
 * @description
 * It returns the common maximum indentation length among the lines of the
 * provided string. Lines that are only spaces are not taken into account.
 *
 * It throws error if a `\s` character that is not ` ` (space) is encountered
 * in the indentation.
 * @example
 * commonMinIndentLength(
 * `   hello
 *      world!
 * `);
 * //returns
 * 3;
 */
export function commonMaxIndentLength(s: string): number {
    let minIndentLength = Infinity;
    s.split("\n").forEach((line) => {
        if (/^[ ]+$/.test(line) || line.length === 0) return;

        let newMinIndentLength = 0;
        for (let i = 0; i < line.length; i++) {
            if (/\s/.test(line[i]) && line[i] !== " ") throw Error(_errorMessages.badIndentSpaceCharacter);
            if (line[i] !== " ") break;
            newMinIndentLength++;
        }
        if (newMinIndentLength < minIndentLength) minIndentLength = newMinIndentLength;
    });
    return minIndentLength;
}

export const _errorMessages = {
    badIndentSpaceCharacter: "Only space characters are allowed in the indented part of the string",
};
