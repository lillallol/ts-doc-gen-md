import { getStatementsOf } from "../getStatementsOf/getStatementsOf";
import { isDelegationExport } from "../../isAssertions/isDelegationExport/isDelegationExport";
import { delegationExportStatement } from "../../types";

/**
 * @description
 * Returns all the export statements of this type :
 * ```ts
 * export * from "./some/where";
 * ```
 */
export function getDelegationExportStatementsOf(absolutePathToTsFile: string): delegationExportStatement[] {
    const statements = getStatementsOf(absolutePathToTsFile);
    const toReturn: delegationExportStatement[] = [];
    for (const s of statements) {
        if (isDelegationExport(s)) toReturn.push(s);
    }
    return toReturn;
}
