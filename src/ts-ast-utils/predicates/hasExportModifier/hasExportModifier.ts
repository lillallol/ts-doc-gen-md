import * as ts from "../../adapters/typescript";

export function hasExportModifier(s: ts.Statement): boolean {
    return !!s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}
