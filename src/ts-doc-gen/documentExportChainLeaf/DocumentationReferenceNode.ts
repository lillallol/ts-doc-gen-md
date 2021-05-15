import { exportChainLeafStatement } from "../../ts-ast-resolve/index";
import { BaseMaps } from "../BaseMaps";
import { referencedTypes } from "../types";
import { DocumentationNode } from "./DocumentationNode";

export class DocumentationReferenceNode extends BaseMaps {
    statement: exportChainLeafStatement;
    resolutionIndex: number;
    pathToTsFile: string;
    /**
     * @description
     * When documenting a statement, some type references that are not generics might be encountered
     * in its ast.
     * This singleton maps theses references to the statement that they correspond.
     */
    referencedTypes: referencedTypes;
    private _docText?: string;

    constructor(_: {
        statement: exportChainLeafStatement;
        resolutionIndex: number;
        pathToTsFile: string;
        referencedTypes: referencedTypes;
    }) {
        super();
        const { statement, resolutionIndex, pathToTsFile, referencedTypes } = _;
        this.pathToTsFile = pathToTsFile;
        this.referencedTypes = referencedTypes;
        this.resolutionIndex = resolutionIndex;
        this.statement = statement;
    }

    get docText(): string {
        const { _docText } = this;
        if (_docText === undefined) throw Error(); //@TODO
        return _docText;
    }
    set docText(docText: string) {
        this._docText = docText;
    }

    referencedTypeNameToDocumentation(referencedTypeName: string): DocumentationReferenceNode | DocumentationNode {
        //@TODO throw error if the referenced type name is not a key of referenced types
        const exportChainLeaf = this.referencedTypes[referencedTypeName];
        const toReturn =
            this.exportChainLeafToDocumentationNodeMap.get(exportChainLeaf) ??
            this.exportChainLeafToDocumentationReferenceNodeMap.get(exportChainLeaf);
        if (toReturn === undefined) throw Error();
        return toReturn;
    }
}
