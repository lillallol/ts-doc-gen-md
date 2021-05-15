import * as ts from "../../adapters/typescript";
import { getJsDocOfAstNode } from "../getJSDocOfAstNode";
import { hasJSDocTagOfName } from "../hasJSDocTagOfName/hasJSDocTagOfName";

/**
 * @description
 * It returns the values of all JSDoc tags of the provided name, have in the provide ast node.
 * It return `undefined` if the provided ast node does not have the provided JSDoc tag.
 * It checks only the last JSDoc comment.
 * Returns the tag less comment for provided JSDoc tag name being `null`.
 * @todo
 * SRP violation
 * create getJSDocTagLessValue
 * @todo
 * replace undefined with null
 */
export function getJSDocTagValue(s: ts.astNode, jsDocTagName: string|null): (undefined | string)[] | undefined {
    const jsDoc: ts.JSDoc[] | undefined = getJsDocOfAstNode(s);
    if (jsDoc === undefined) return undefined;
    const lastJsDoc = jsDoc[jsDoc.length - 1];
    if (jsDocTagName === null) return [lastJsDoc.comment];
    const { tags } = lastJsDoc;
    if (tags === undefined || !hasJSDocTagOfName(s, jsDocTagName)) {
        return undefined;
    }
    return Array.from(tags)
        .filter(({ tagName }) => ts.unescapeLeadingUnderscores(tagName.escapedText) === jsDocTagName)
        .map(({ comment }) => comment);
}
