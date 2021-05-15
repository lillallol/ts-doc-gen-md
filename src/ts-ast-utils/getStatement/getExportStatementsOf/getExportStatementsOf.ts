import { isExportStatement } from "../../isAssertions/isExportStatement";
import { exportStatement } from "../../types";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

export function getExportStatementsOf(pathToTsFile : string):exportStatement[] {
    return getStatementsOf(pathToTsFile).filter(isExportStatement);
}