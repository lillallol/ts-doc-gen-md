import * as ts from "../../adapters/typescript";
import { isInvalidExportAssignment } from "../isInvalidExportAssignment/isInvalidExportAssignment";

export function isInvalidStatement(statement: ts.Statement): boolean {
    return (
        isInvalidExportAssignment(statement) ||
        ts.isImportEqualsDeclaration(statement) ||
        ts.isModuleDeclaration(statement)
    );
}
