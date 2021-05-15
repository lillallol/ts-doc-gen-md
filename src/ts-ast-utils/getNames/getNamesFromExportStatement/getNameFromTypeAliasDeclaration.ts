import * as ts from "../../adapters/typescript";

export function getNameFromTypeAliasDeclaration(s: ts.TypeAliasDeclaration): string {
    return ts.unescapeLeadingUnderscores(s.name.escapedText);
}
