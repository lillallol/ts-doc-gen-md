import { defaultExportNonChain } from "../../types";
import * as ts from "../../adapters/typescript";
import { hasDefaultModifier } from "../../predicates/hasDefaultModifier/hasDefaultModifier";

export function isDefaultExportNonChain(s: ts.Statement): s is defaultExportNonChain {
    return (
        //prettier-ignore
        (
            (
                ts.isInterfaceDeclaration(s) ||
                ts.isFunctionDeclaration(s) ||
                ts.isClassDeclaration(s)
            )
            &&
            hasDefaultModifier(s)
        )
        ||
        (
            ts.isExportAssignment(s) && !ts.isIdentifier(s.expression)
        )
    );
}


