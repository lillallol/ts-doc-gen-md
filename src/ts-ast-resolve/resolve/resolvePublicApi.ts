import { ExportChainLeaf } from "../exportChainNode/ExportChainLeaf";
import { ExportChainNode } from "../exportChainNode/ExportChainNode";
import { getExportChainNodeRootStatementOf } from "../../ts-ast-utils/index";
import { dedupExportChainLeafArray } from "./dedupExportChainLeafArray";

/**
 * @description
 * Resolves and returns all the export chain leafs that correspond to the exposed API
 * of the provided d.ts file.
 *
 * The returned export chain leaf array is deduped (clone wise).
 */
export function resolvePublicApi(_: {
    /**
     * @description
     * Absolute path to the index d.ts to resolve to resolve its public api to export chain leafs.
     */
    absolutePathToIndexDts: string;
}): ExportChainLeaf[] {
    const { absolutePathToIndexDts } = _;
    const toReturn: ExportChainLeaf[] = [];

    //@TODO what Root has to do with the name of the following function call?
    const arr = getExportChainNodeRootStatementOf(absolutePathToIndexDts);

    arr.forEach((s) => {
        ExportChainNode.createInitialNode(s, absolutePathToIndexDts).forEach((exportNode) => {
            if (exportNode instanceof ExportChainLeaf) toReturn.push(exportNode);
            else toReturn.push(...exportNode.resolve());
        });
    });
    return dedupExportChainLeafArray(toReturn);
}
