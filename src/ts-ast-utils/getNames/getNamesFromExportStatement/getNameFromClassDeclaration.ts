import * as ts from "../../adapters/typescript"

/**
 * @description
 * Returns the name of the provided class.
 * It throws error when the class has `undefined` name.
*/
export function getNameFromClassDeclaration(s : ts.ClassDeclaration):string {
    const { name } = s;
    if (name === undefined) throw Error(); //@TODO
    return ts.unescapeLeadingUnderscores(name.escapedText);
}