import { DocumentationNode } from "./documentExportChainLeaf/DocumentationNode";
import { DocumentationReferenceNode } from "./documentExportChainLeaf/DocumentationReferenceNode";
import { ExportChainLeafToNodeDocumentationOrReferenceMap } from "./documentExportChainLeaf/ExportChainLeafToNodeDocumentationOrReferenceMap";

export class BaseMaps {
    private static _exportChainLeafToDocumentationNodeMap?: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>;
    private static _exportChainLeafToDocumentationReferenceNodeMap?: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>;

    get exportChainLeafToDocumentationNodeMap(): ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode> {
        const { _exportChainLeafToDocumentationNodeMap } = BaseMaps;
        if (_exportChainLeafToDocumentationNodeMap === undefined) throw Error(); //@TODO
        return _exportChainLeafToDocumentationNodeMap;
    }
    static set exportChainLeafToDocumentationNodeMap(
        exportChainLeafToDocumentationNodeMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationNode>
    ) {
        //@TODO throw error if it is already setted
        BaseMaps._exportChainLeafToDocumentationNodeMap = exportChainLeafToDocumentationNodeMap;
    }

    get exportChainLeafToDocumentationReferenceNodeMap(): ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode> {
        const { _exportChainLeafToDocumentationReferenceNodeMap } = BaseMaps;
        if (_exportChainLeafToDocumentationReferenceNodeMap === undefined) throw Error(); //@TODO
        return _exportChainLeafToDocumentationReferenceNodeMap;
    }

    static set exportChainLeafToDocumentationReferenceNodeMap(
        exportChainLeafToNodeDocumentationOrReferenceMap: ExportChainLeafToNodeDocumentationOrReferenceMap<DocumentationReferenceNode>
    ) {
        //@TODO throw error if it is already setted
        BaseMaps._exportChainLeafToDocumentationReferenceNodeMap = exportChainLeafToNodeDocumentationOrReferenceMap;
    }
}
