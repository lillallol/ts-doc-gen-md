import * as ts from "../../adapters/typescript";

export function getNameFromInterfaceDeclaration(s : ts.InterfaceDeclaration):string {
    return ts.unescapeLeadingUnderscores(s.name.escapedText);
}