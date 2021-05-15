import * as ts from "../../adapters/typescript";

export function hasDefaultModifier(s: ts.Statement): boolean {
    return !!s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
}