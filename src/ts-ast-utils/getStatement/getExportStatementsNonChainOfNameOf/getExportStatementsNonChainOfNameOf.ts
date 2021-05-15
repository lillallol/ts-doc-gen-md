import { getNamesFromExportStatement } from "../../getNames/getNamesFromExportStatement/getNamesFromExportStatement";
import { isExportStatementNonChain } from "../../isAssertions/isExportStatementNonChain/isExportStatementNonChain";
import { exportStatementNonChain } from "../../types";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

export function getExportStatementsNonChainOfNameOf(
    pathToTsFile: string,
    nameToSearchFor: string
): exportStatementNonChain[] {
    return getStatementsOf(pathToTsFile)
        .filter(isExportStatementNonChain)
        .filter((s) => {
            const names = getNamesFromExportStatement(s);
            if (names === undefined) return false;
            for (const name of names) {
                if (name === nameToSearchFor) return true;
            }
            return false;
        });
}
