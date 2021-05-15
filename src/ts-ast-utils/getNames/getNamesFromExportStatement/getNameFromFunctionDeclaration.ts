import * as ts from "../../adapters/typescript";

/**
 * @description
 * It returns the name of the function declaration statement provided.
 * It throws error for the cases of arrow function.
*/
export function getNameFromFunctionDeclaration(s: ts.FunctionDeclaration): string {
    const { name } = s;
    if (name === undefined) throw Error();//@TODO
    return ts.unescapeLeadingUnderscores(name.escapedText);
}
