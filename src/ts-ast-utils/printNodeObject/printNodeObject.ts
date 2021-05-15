import * as ts from "../adapters/typescript";
import { getSourceFileOf } from "../getSourceFileOf/getSourceFileOf";

/**
 * @description It prints the source code that corresponds to the provided ts.Node of the ts
 * file that corresponds to the provided absolute path.
 */
export function printNodeObject(nodeObject: ts.astNode, absolutePathToTsFileContainingNodeObject: string): string {
    const sourceFile = getSourceFileOf(absolutePathToTsFileContainingNodeObject);
    const { pos, end } = nodeObject;
    return sourceFile.text.slice(pos, end);
}
