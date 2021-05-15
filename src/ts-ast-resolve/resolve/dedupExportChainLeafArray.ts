import { exportChainLeafStatement } from "../types";
import { constructiveDot } from "../../es-utils/index";
import { ExportChainLeaf } from "../exportChainNode/ExportChainLeaf";

/**
 * @description
 * There are cases where there are multiple object that extends this type and are clones of each other.
 * For example when resolving the public API of a node module, I might get clones of export chain leaf,
 * as it is shown in the following code snippet:
 * ```ts
 * // index.d.ts
 * export * from "file1";
 * export * from "file2";
 * // file1.d.ts
 * export * from "file3";
 * // file2.d.ts
 * export * from "file3";
 * // file3.d.ts
 * export declare type A = number;
 * ```
 * @todo
 * is the example not producing linting errors?
 * @todo
 * fix description
 * @todo
 * are there legit cases with joinedNamespace?
 * do I really have to use joinedNamespace?
 */
class ExportChainLeafSet {
    private _map: Map<
        exportChainLeafStatement,
        {
            [resolutionIndex: number]: {
                [exposedName: string]: {
                    [joinedNamespace: string]: boolean;
                };
            };
        }
    >;

    constructor() {
        this._map = new Map();
    }

    add(exportNodeLike: ExportChainLeaf): void {
        const { statement, resolutionIndex, exposedName, namespace } = exportNodeLike;

        const _ = this._map.get(statement);
        if (_ === undefined) {
            this._map.set(statement, {
                [resolutionIndex]: {
                    [exposedName ?? "null"]: {
                        [namespace.join(".")]: true,
                    },
                },
            });
        } else {
            constructiveDot(_, [resolutionIndex, exposedName ?? "null"])[namespace.join(".")] = true;
        }
    }

    isAdded(exportNodeLike: ExportChainLeaf): boolean {
        const { exposedName, statement, resolutionIndex, namespace } = exportNodeLike;
        const _ = this._map.get(statement)?.[resolutionIndex]?.[exposedName ?? "null"]?.[namespace.join(".")];
        return _ !== undefined;
    }
}

/**
 * @description
 * This is needed because some export chain leaf statements can
 * have more than one export chain leaf that are clones. With this
 * function the clones are discarded.
 * @todo
 * test that
 * @todo
 * make that a property to the ExportChainLeafSet
 */
export function dedupExportChainLeafArray(exportChainLeafArray: ExportChainLeaf[]): ExportChainLeaf[] {
    const toReturn: ExportChainLeaf[] = [];

    const exportChainLeafSet: ExportChainLeafSet = new ExportChainLeafSet();

    exportChainLeafArray.forEach((exportChainLeaf) => {
        if (exportChainLeafSet.isAdded(exportChainLeaf)) {
            return;
        } else {
            exportChainLeafSet.add(exportChainLeaf);
            toReturn.push(exportChainLeaf);
        }
    });

    return toReturn;
}
