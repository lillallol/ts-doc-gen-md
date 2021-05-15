import { exportStatement } from "../../types";
import { isNamespaceExport } from "../../isAssertions/isNamespaceExport/isNamespaceExport";
import { isDelegationExport } from "../../isAssertions/isDelegationExport/isDelegationExport";
import { getNameFromNamespaceExport } from "./getNamesFromNamespaceExport";
import { isDefaultExportChain } from "../../isAssertions/isDefaultExportChain/isDefaultExportChain";
import { getNamesFromNamedExportStatement } from "./getNamesFromNamedExportStatement";
import { isNamedExport } from "../../isAssertions/isNamedExport/isNamedExport";
import { getNamesFromNonChainExport } from "./getNamesFromNonChainExport";

/**
 * @description
 * For the cases of default export it returns `["default"]`.
 * For delegation export it returns `undefined`.
 */
export function getNamesFromExportStatement(s: exportStatement): string[] | undefined {
    if (isDefaultExportChain(s)) return ["default"];
    if (isDelegationExport(s)) return undefined;
    if (isNamespaceExport(s)) return [getNameFromNamespaceExport(s)];
    if (isNamedExport(s)) return getNamesFromNamedExportStatement(s);
    return getNamesFromNonChainExport(s);
}
