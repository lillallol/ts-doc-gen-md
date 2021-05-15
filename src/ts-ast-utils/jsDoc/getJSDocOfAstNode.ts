import { JSDoc, Node } from "typescript";

/**
 * @description
 * If it returns an array then this is not a zero length array.
 */
export function getJsDocOfAstNode(astNode: Node): JSDoc[] | undefined {
    //@TODO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const { jsDoc } = astNode;
    //@TODO the check should be more strict
    if ((jsDoc !== undefined && !Array.isArray(jsDoc)) || (Array.isArray(jsDoc) && jsDoc.length === 0)) {
        throw Error("internal library error message");//@TODO
    }
    return jsDoc;
}
