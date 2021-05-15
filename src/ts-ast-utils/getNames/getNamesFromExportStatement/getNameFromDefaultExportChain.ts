import { isDefaultExportChain } from "../../isAssertions/isDefaultExportChain/isDefaultExportChain";
import * as ts from "../../adapters/typescript";

/**
 * ```ts
 * export default foo;// "foo"
 * ```
*/
export function getNameFromDefaultExportChain(s: ts.ExportAssignment): string {
    if (!isDefaultExportChain(s)) throw Error();//@TODO
    return ts.unescapeLeadingUnderscores(s.expression.escapedText);
}
