import { isExportStatementChain } from "../../isAssertions/isExportStatementChain";
import { isExportStatementNonChain } from "../../isAssertions/isExportStatementNonChain/isExportStatementNonChain";
import { hasExportModifier } from "../../predicates/hasExportModifier/hasExportModifier";
import { exportStatement } from "../../types";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

export function getExportChainNodeRootStatementOf(absolutePathToTsFile: string): exportStatement[] {
    return [
        ...getStatementsOf(absolutePathToTsFile).filter(isExportStatementNonChain).filter(hasExportModifier),
        ...getStatementsOf(absolutePathToTsFile).filter(isExportStatementChain),
    ];
}
