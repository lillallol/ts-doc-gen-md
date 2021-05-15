import { throwIfProjectCanNotBeDocumented } from "./throwIfProjectCanNotBeDocumented";
import { resolvePublicApi } from "../ts-ast-resolve/index";
import { documentExportChainLeaf } from "./documentExportChainLeaf/documentExportChainLeaf";
import { ExportChainLeafToNodeDocumentationOrReferenceMap } from "./documentExportChainLeaf/ExportChainLeafToNodeDocumentationOrReferenceMap";
import { DocumentationNode } from "./documentExportChainLeaf/DocumentationNode";
import { DocumentationReferenceNode } from "./documentExportChainLeaf/DocumentationReferenceNode";
import { BaseMaps } from "./BaseMaps";

/**
 * @description
 * It resolve the public to documentation nodes.
 */
export function resolvePublicApiDocumentationNodes(absolutePathToDtsIndex: string): DocumentationNode[] {
    throwIfProjectCanNotBeDocumented(absolutePathToDtsIndex);
    const exportChainLeafToDocumentationNodeMap = new ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>();
    const exportChainLeafToDocumentationReferenceNodeMap = new ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>();

    BaseMaps.exportChainLeafToDocumentationNodeMap = exportChainLeafToDocumentationNodeMap;
    BaseMaps.exportChainLeafToDocumentationReferenceNodeMap = exportChainLeafToDocumentationReferenceNodeMap;

    resolvePublicApi({
        absolutePathToIndexDts: absolutePathToDtsIndex,
    }).forEach((exportChainLeaf) => {
        documentExportChainLeaf({
            exportChainLeaf,
            exportChainLeafToDocumentationReferenceNodeMap,
            exportChainLeafToDocumentationNodeMap,
        });
    });

    return exportChainLeafToDocumentationNodeMap.values();
}
