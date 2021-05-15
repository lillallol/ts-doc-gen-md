import { ts } from "../..";

export function getNameFromEnumDeclaration(s: ts.EnumDeclaration): string {
    return ts.unescapeLeadingUnderscores(s.name.escapedText);
}
