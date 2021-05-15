import { getNamesFromExportStatement } from "../../getNames/getNamesFromExportStatement/getNamesFromExportStatement";
import { isDefaultExportChain } from "../../isAssertions/isDefaultExportChain/isDefaultExportChain";
import { isExportStatement } from "../../isAssertions/isExportStatement";
import { isExportStatementChain } from "../../isAssertions/isExportStatementChain";
import { hasExportModifier } from "../../predicates/hasExportModifier/hasExportModifier";
import { exportStatement } from "../../types";
import { getStatementsOf } from "../getStatementsOf/getStatementsOf";

/**
 * @description
 * Returns the export statements that correspond to the given name and given absolute path.
 * The reason that it returns an array is because a given name can correspond to a concretion
 * and a type export.
 * @todo 
 * change the name according to the is assertion 
 */
export function getExportStatementsOfNameOf(
    absolutePathToTsFile: string,
    nameToSearchFor: string
): { exportStatement: exportStatement; resolutionIndex: number }[] {
    const statements = getStatementsOf(absolutePathToTsFile);
    const toReturn: { exportStatement: exportStatement; resolutionIndex: number }[] = [];
    for (const s of statements) {
        if ( (isExportStatement(s) && hasExportModifier(s)) || isExportStatementChain(s) /*I am not so sure about the has export modifier*/) {
            const names = getNamesFromExportStatement(s);
            if (names === undefined) continue;
            const resolutionIndex = names.indexOf(nameToSearchFor);
            if (resolutionIndex !== -1) {
                toReturn.push({
                    resolutionIndex,
                    exportStatement: s,
                });
            }
        } else if (isDefaultExportChain(s)) {
            //@TODO why am I not checking name here?
            toReturn.push({
                resolutionIndex: 0,
                exportStatement: s,
            });
        }
    }
    return toReturn;
}
