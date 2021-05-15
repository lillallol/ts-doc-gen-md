import { ExportChainLeaf, exportChainLeafStatement } from "../../ts-ast-resolve/index";
import { DocumentationReferenceNode } from "./DocumentationReferenceNode";

/**
 * @description
 * Map constructor that maps export chain leaf nodes to documentation nodes
 * or documentation reference nodes.
 *
 * Export chain leaf nodes that have the same:
 *
 * - resolution index
 * - export chain leaf statement (as reference)
 *
 * are treated as identical keys by the map.
 *
 * This map is useful for avoiding duplication and infinite loops when defining the
 * referenced types object of a documentation node or documentation reference node.
 *
 * @todo
 * have not tested it
 */
export class ExportChainLeafToNodeDocumentationOrReferenceMap<T extends DocumentationReferenceNode> {
    /**
     * @description
     * Documentation reference nodes to not care about namespace and exposed name.
     * Not even when they reference documentation nodes.
     */
    private _map: Map<
        exportChainLeafStatement,
        {
            [resolutionIndex: number]: T;
        }
    >;

    constructor() {
        this._map = new Map();
    }

    get(exportChainLeaf: ExportChainLeaf): T | undefined {
        const { statement, resolutionIndex } = exportChainLeaf;
        return this._map.get(statement)?.[resolutionIndex];
    }

    set(exportChainLeaf: ExportChainLeaf, documentationNode: T): void {
        const { statement, resolutionIndex } = exportChainLeaf;

        const _ = this._map.get(statement);
        if (_ === undefined) {
            this._map.set(statement, {
                [resolutionIndex]: documentationNode,
            });
        } else {
            _[resolutionIndex] = documentationNode;
        }
    }

    delete(exportChainLeaf : ExportChainLeaf) : boolean {
        const { statement, resolutionIndex } = exportChainLeaf;

        const _ = this._map.get(statement);
        if (_ === undefined) return false
        
        return delete _[resolutionIndex];
        
    }

    values(): T[] {
        return [...this._map.values()].flatMap((resolutionIndexToNode) => Object.values(resolutionIndexToNode));
    }
}
