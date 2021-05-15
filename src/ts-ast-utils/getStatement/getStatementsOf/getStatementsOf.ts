import { getSourceFileOf } from "../../getSourceFileOf/getSourceFileOf";
import * as ts from "../../adapters/typescript";

export function getStatementsOf(absolutePathToTsFile: string): ts.Statement[] {
    return Array.from(getSourceFileOf(absolutePathToTsFile).statements);
}
