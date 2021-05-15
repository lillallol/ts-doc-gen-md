import * as ts from "../../adapters/typescript";
import { getJsDocOfAstNode } from "../getJSDocOfAstNode";

export function getJSDocTagsWithValues(astNode: ts.astNode): getJSDocTagsWithValuesReturnType {
    const jsDoc: ts.JSDoc[] | undefined = getJsDocOfAstNode(astNode);
    if (jsDoc === undefined) {
        return {
            tagAndComment: [],
            comment: undefined,
        };
    }
    const lastJSDocComment: ts.JSDoc | undefined = jsDoc[jsDoc.length - 1];
    if (lastJSDocComment === undefined) throw Error("Case not accounted for"); //@TODO add internal library error here

    const { tags } = lastJSDocComment;

    return {
        comment: lastJSDocComment.comment,
        tagAndComment:
            tags !== undefined
                ? tags.map((tag) => ({
                      tagName: ts.unescapeLeadingUnderscores(tag.tagName.escapedText),
                      comment: tag.comment,
                  }))
                : [],
    };
}

export type getJSDocTagsWithValuesReturnType = {
    /**
     * @description First tag-less comment.
     */
    comment?: string;
    tagAndComment: {
        tagName: string;
        comment?: string;
    }[];
};
