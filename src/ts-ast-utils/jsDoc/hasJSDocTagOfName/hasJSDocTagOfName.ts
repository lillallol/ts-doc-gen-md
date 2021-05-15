import * as ts from "../../adapters/typescript";
import { getJsDocOfAstNode } from "../getJSDocOfAstNode";
/**
 * @description
 * Returns:
 * 
 * * `true` if the provided ast node has JSDoc tag of the provided name
 * * `false` if it does not have the JSDoc tag
 * * `false` if the ast node has no JSDoc comment
 * 
 * If the ast node has many JSDoc comments only the closest is to the ast node
 * (i.e. the last element of the jsDoc array) is taken into account.
 */
export function hasJSDocTagOfName(astNode: ts.astNode, tagName: string): boolean {
    const jsDoc: ts.JSDoc[] | undefined = getJsDocOfAstNode(astNode);
    if (jsDoc === undefined) return false;
    const { tags } = jsDoc[jsDoc.length - 1];
    if (tags === undefined) return false;
    return tags.some(({ tagName: _tagName }) => ts.unescapeLeadingUnderscores(_tagName.escapedText) === tagName);
}
