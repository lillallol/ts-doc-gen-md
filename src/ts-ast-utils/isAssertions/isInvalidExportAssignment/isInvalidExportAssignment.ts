import * as ts from "../../adapters/typescript";

export function isInvalidExportAssignment(statement: ts.Statement): boolean {
    return ts.isExportAssignment(statement) && statement.isExportEquals === true;
}
